// Voz IA con tu cuenta de ElevenLabs: cada personaje con su voz (perfiles/personajes.json).
// Genera public/audio/<id>.mp3 + public/captions/<id>.json (tiempos exactos de cada palabra y quién la dice).
//
//   npm run voz:ia -- <id> --plan                  → solo muestra voces, caracteres y créditos (no gasta nada; funciona sin clave)
//   npm run voz:ia -- <id>                         → genera con el modo de config/voces.json ("lineas" por defecto)
//   npm run voz:ia -- <id> --modo dialogo          → todas las voces en una sola actuación (eleven_v3, si tu plan lo tiene)
//   npm run voz:ia -- <id> --secundario <voiceId>  → cambia una voz solo para este video (--principal, --narrador, --extra)
//   npm run voz:ia -- <id> --nuevo                 → ignora la caché y vuelve a generar todo
//
// Caché: cada línea (o bloque) ya generada se guarda en .cache/voz/. Si cambias una parte del guion
// y vuelves a generar, solo se genera (y se paga) lo que cambió.
//
// Modo "lineas" (por defecto): una llamada por línea con eleven_multilingual_v2 y pausas entre líneas. Funciona en todos los planes.
// Modo "dialogo": Text to Dialogue (eleven_v3). Si tu cuenta no lo permite, pasa solo al modo "lineas".
import path from "node:path";
import {
  NOMBRE_ROL,
  ROLES,
  ROOT,
  bandera,
  esRol,
  esVoiceId,
  tokensArgs,
  alinearPorLinea,
  alignScriptToTimings,
  etiquetaLinea,
  getVideo,
  lineasDe,
  normalize,
  palabrasDe,
  paraVoz,
  resumenEscenas,
  writeCaptions,
} from "./lib/common.mjs";
import { codificarMp3, decodificar, duracionMs, silencio } from "./lib/audio.mjs";
import { claveCache, enCache, guardarCache, leerCache } from "./lib/cache.mjs";
import {
  configLinea,
  creditos,
  dialogo,
  errorFatal,
  etiquetaVoz,
  infoVoz,
  leerConfigVoces,
  palabrasDeAlineacion,
  tieneClave,
  tts,
  vocesElegidas,
  vozDeLinea,
  MENSAJE_SIN_CLAVE,
} from "./lib/elevenlabs.mjs";

const tokens = tokensArgs();
const esModo = (t) => t === "dialogo" || t === "lineas";
// Voces cambiadas solo para este video: "--secundario <voiceId>" / "secundario=<voiceId>" (o, si PowerShell se comió el "--", por orden)
const cambios = {};
const idsSueltos = tokens.filter(esVoiceId);
tokens.forEach((t, i) => {
  if (esRol(t) && esVoiceId(tokens[i + 1] || "")) cambios[t] = tokens[i + 1];
});
const rolesSinValor = ROLES.filter((r) => !cambios[r] && process.env[`npm_config_${r}`] !== undefined);
rolesSinValor.forEach((r, k) => {
  const libre = idsSueltos.filter((v) => !Object.values(cambios).includes(v))[k];
  if (libre) cambios[r] = libre;
});
const id = tokens.find((t) => !esModo(t) && !esRol(t) && !esVoiceId(t) && t !== "plan" && t !== "modo" && t !== "nuevo");
if (!id) {
  console.error("Uso: npm run voz:ia -- <id-del-video> [--plan] [--modo lineas|dialogo] [--principal|--secundario|--narrador|--extra <voiceId>]");
  console.error("En PowerShell también vale sin guiones: npm run voz:ia <id> lineas   ·   npm run voz:ia <id> plan");
  process.exit(1);
}
// "--plan" sin el "--" de npm (PowerShell) llega como las banderas cortas de npm -p -l -a: también cuenta como plan
const soloPlan = bandera(tokens, "plan") || (process.env.npm_config_parseable === "true" && process.env.npm_config_long === "true");
const sinCache = bandera(tokens, "nuevo");
const cfg = leerConfigVoces();
const voces = { ...vocesElegidas([]), ...cambios };
let modo = tokens.find(esModo) ?? cfg.modo;
if (!["dialogo", "lineas"].includes(modo)) modo = "lineas";

const spec = await getVideo(id);
const lineas = lineasDe(spec);
const textoVoz = (l, conTono) => (conTono && l.tono ? `[${l.tono}] ` : "") + paraVoz(l.texto);

// ── Utilidades ──────────────────────────────────────────────
const vozDe = (l) => vozDeLinea(cfg, voces, l);
const claveLinea = (l) => {
  const cl = configLinea(cfg, l.quien, l.extra);
  return claveCache({ v: vozDe(l), t: textoVoz(l, /eleven_v[34]/.test(cl.modelo)), m: cl.modelo, a: cl.ajustes, i: cl.idioma });
};
const claveDialogo = (bloque) => claveCache({ d: bloque.map((l) => ({ text: textoVoz(l, true), voice_id: vozDe(l) })), m: cfg.dialogo.modelo, e: cfg.dialogo.estabilidad });
const parecido = (words, texto) => {
  const a = palabrasDe(paraVoz(texto)).map(normalize).filter(Boolean);
  if (!a.length) return 1;
  const set = new Set(words.map((w) => normalize(w.text)));
  return a.filter((x) => set.has(x)).length / a.length;
};
const cortar = (al, c0, c1) => ({
  characters: al.characters.slice(c0, c1),
  character_start_times_seconds: al.character_start_times_seconds.slice(c0, c1),
  character_end_times_seconds: al.character_end_times_seconds.slice(c0, c1),
});

/** Bloques de líneas consecutivas que caben en una llamada (se corta preferentemente entre escenas) */
const partir = (ls, max) => {
  const bloques = [];
  let cur = [];
  let len = 0;
  ls.forEach((l, i) => {
    const t = textoVoz(l, true).length;
    const nuevaEscena = i > 0 && ls[i - 1].escena !== l.escena;
    const cabeEscena = (() => {
      // si empieza escena, ¿cabe la escena completa en el bloque actual?
      if (!nuevaEscena) return true;
      const resto = ls.filter((x) => x.escena === l.escena).reduce((a, x) => a + textoVoz(x, true).length, 0);
      return len + resto <= max;
    })();
    if (cur.length && (len + t > max || !cabeEscena)) {
      bloques.push(cur);
      cur = [];
      len = 0;
    }
    cur.push(l);
    len += t;
  });
  if (cur.length) bloques.push(cur);
  return bloques;
};

/** Reparte las palabras detectadas de un bloque entre sus líneas */
const repartir = (al, segs, bloque, offsetMs) => {
  // A) con voice_segments: rango de caracteres de cada línea
  if (segs.length) {
    const rangos = bloque.map((_, k) => {
      const s = segs.filter((x) => x.dialogue_input_index === k);
      if (!s.length) return null;
      return [Math.min(...s.map((x) => x.character_start_index)), Math.max(...s.map((x) => x.character_end_index))];
    });
    if (rangos.every((r) => r && r[0] >= 0 && r[1] <= al.characters.length && r[1] > r[0])) {
      const porLinea = rangos.map(([c0, c1]) => palabrasDeAlineacion(cortar(al, c0, c1), { offsetMs }));
      if (porLinea.every((ws, k) => parecido(ws, bloque[k].texto) >= 0.4)) return porLinea;
    }
  }
  // B) sin rangos fiables: alineo el bloque completo con el guion y separo por cantidad de palabras
  const todas = palabrasDeAlineacion(al, { offsetMs });
  const guion = bloque.flatMap((l) => palabrasDe(paraVoz(l.texto)));
  const alineadas = alignScriptToTimings(guion, todas).map((w) => ({ text: w.text.trim(), startMs: w.startMs, endMs: w.endMs }));
  let k = 0;
  return bloque.map((l) => {
    const n = palabrasDe(paraVoz(l.texto)).length;
    const ws = alineadas.slice(k, k + n);
    k += n;
    return ws;
  });
};

const INICIO_MS = 200;

const generarDialogo = async () => {
  const bloques = partir(lineas, cfg.dialogo.maxCaracteres);
  let pcm = silencio(INICIO_MS);
  const detectadas = [];
  for (const [b, bloque] of bloques.entries()) {
    if (b > 0) pcm = Buffer.concat([pcm, silencio(cfg.lineas.pausaMs.cambioEscena)]);
    const offset = Math.round(duracionMs(pcm));
    process.stdout.write(`  Diálogo ${b + 1}/${bloques.length} (${bloque.length} líneas)… `);
    const clave = claveDialogo(bloque);
    const guardado = sinCache ? null : leerCache(clave);
    const r = guardado
      ? { ok: true, data: guardado }
      : await dialogo(
          bloque.map((l) => ({ text: textoVoz(l, true), voice_id: vozDe(l) })),
          cfg.dialogo
        );
    if (!r.ok) {
      console.log("✖");
      return { ok: false, fatal: errorFatal(r.status, r.cuerpo), error: r.error };
    }
    if (!guardado) guardarCache(clave, r.data);
    const al = r.data.alignment || r.data.normalized_alignment;
    const porLinea = repartir(al, r.data.voice_segments || [], bloque, offset);
    bloque.forEach((l, k) => (detectadas[l.idx] = porLinea[k]));
    pcm = Buffer.concat([pcm, decodificar(Buffer.from(r.data.audio_base64, "base64"))]);
    console.log(guardado ? "✔ (ya estaba)" : "✔");
  }
  return { ok: true, pcm, detectadas };
};

const generarLineas = async () => {
  const p = cfg.lineas.pausaMs;
  let pcm = silencio(INICIO_MS);
  const detectadas = [];
  for (const [k, l] of lineas.entries()) {
    const prev = lineas[k - 1];
    const next = lineas[k + 1];
    if (prev) pcm = Buffer.concat([pcm, silencio(prev.escena !== l.escena ? p.cambioEscena : prev.quien !== l.quien || prev.extra !== l.extra ? p.cambioHablante : p.mismoHablante)]);
    const offset = Math.round(duracionMs(pcm));
    process.stdout.write(`  ${String(k + 1).padStart(2)}/${lineas.length} ${etiquetaLinea(l).padEnd(10)} ${l.texto.slice(0, 50)}… `);
    const cl = configLinea(cfg, l.quien, l.extra);
    const clave = claveLinea(l);
    const guardado = sinCache ? null : leerCache(clave);
    const r = guardado
      ? { ok: true, data: guardado }
      : await tts(vozDe(l), textoVoz(l, /eleven_v[34]/.test(cl.modelo)), {
          ...cl,
          previo: prev && prev.quien === l.quien ? paraVoz(prev.texto) : undefined,
          siguiente: next && next.quien === l.quien ? paraVoz(next.texto) : undefined,
        });
    if (!r.ok) {
      console.log("✖");
      return { ok: false, fatal: true, error: r.error };
    }
    if (!guardado) guardarCache(clave, r.data);
    detectadas[l.idx] = palabrasDeAlineacion(r.data.alignment || r.data.normalized_alignment, { offsetMs: offset });
    pcm = Buffer.concat([pcm, decodificar(Buffer.from(r.data.audio_base64, "base64"))]);
    console.log(guardado ? "✔ (ya estaba)" : "✔");
  }
  return { ok: true, pcm, detectadas };
};

// ── Plan: voces, caracteres, lo que falta generar y créditos ─
const conClave = tieneClave();
const fmt = (n) => n.toLocaleString("es-PE");
console.log(`Video "${id}" · ${lineas.length} líneas · ${spec.escenas.length} escenas`);
console.log(`Modo: ${modo === "dialogo" ? `diálogo (${cfg.dialogo.modelo}, todas las voces juntas)` : `por líneas (${cfg.lineas.modelo}, una línea a la vez)`}`);
// Quién habla y con qué voz (los extras pueden tener voz propia)
const hablantes = [];
for (const l of lineas) {
  const k = l.quien === "extra" ? `extra:${l.extra}` : l.quien;
  const h = hablantes.find((x) => x.k === k);
  if (h) h.n++;
  else hablantes.push({ k, nombre: l.quien === "extra" ? etiquetaLinea(l) : NOMBRE_ROL[l.quien], voz: vozDe(l), quien: l.quien, extra: l.extra, n: 1 });
}
const nombresVoz = {};
for (const h of hablantes) {
  if (conClave && !nombresVoz[h.voz]) nombresVoz[h.voz] = await infoVoz(h.voz);
  const info = nombresVoz[h.voz];
  const cl = configLinea(cfg, h.quien, h.extra);
  const extraModo = modo === "lineas" ? ` · ${cl.modelo}${cl.ajustes === "voz" || cl.ajustes === null ? " (ajustes de esa voz)" : ""}` : "";
  const aviso = info && !info.ok ? `  (⚠ ${info.error})` : "";
  console.log(`  ${h.nombre.padEnd(14)} → ${info ? etiquetaVoz(h.voz, info) : h.voz} · ${h.n} línea${h.n === 1 ? "" : "s"}${extraModo}${aviso}`);
}
if (new Set(hablantes.map((h) => h.voz)).size === 1 && hablantes.length > 1) {
  console.log("  (Todos usan la misma voz. Para distinguirlos, cambia alguna con: npm run voces -- --usar <personaje> <voiceId>)");
}
const caracteres = lineas.reduce((a, l) => a + textoVoz(l, modo === "dialogo").length, 0);
const unidades = modo === "dialogo" ? partir(lineas, cfg.dialogo.maxCaracteres).map((b) => ({ clave: claveDialogo(b), chars: b.reduce((a, l) => a + textoVoz(l, true).length, 0) })) : lineas.map((l) => ({ clave: claveLinea(l), chars: textoVoz(l, false).length }));
const pendientes = unidades.filter((u) => sinCache || !enCache(u.clave)).reduce((a, u) => a + u.chars, 0);
const palabrasTotal = lineas.reduce((a, l) => a + palabrasDe(l.texto).length, 0);
const seg = Math.round(palabrasTotal / 2.5);
console.log(`Texto: ${fmt(caracteres)} caracteres · ${fmt(palabrasTotal)} palabras (≈ ${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, "0")} min de voz)`);
if (pendientes < caracteres) console.log(`Ya generado antes (caché): ${fmt(caracteres - pendientes)} · por generar ahora: ${fmt(pendientes)} caracteres`);
if (!conClave) {
  console.log(`\n${MENSAJE_SIN_CLAVE.replaceAll("<id>", id)}`);
  process.exit(soloPlan ? 0 : 1);
}
const c = await creditos();
if (c.ok) {
  console.log(`Créditos disponibles: ${fmt(c.restantes)} caracteres`);
  if (c.restantes < pendientes) {
    console.error("✖ No te alcanzan los créditos para este guion. Acórtalo o espera la renovación.");
    process.exit(1);
  }
} else console.log(`Créditos: no disponibles (${c.error})`);
if (soloPlan) process.exit(0);

// ── Generar ─────────────────────────────────────────────────
console.log(`\nGenerando voces para "${id}"…`);
let res = null;
if (modo === "dialogo") {
  res = await generarDialogo();
  if (!res.ok && res.fatal) {
    console.error(`✖ ${res.error}`);
    process.exit(1);
  }
  if (!res.ok) {
    console.log(`⚠ Text to Dialogue (${cfg.dialogo.modelo}) no funcionó con tu cuenta: ${res.error}`);
    console.log("  Sigo con el modo por líneas (una llamada por línea). Para usarlo siempre: npm run voces -- --modo lineas");
    modo = "lineas";
  }
}
if (modo === "lineas") {
  res = await generarLineas();
  if (!res.ok) {
    console.error(`✖ ${res.error}`);
    process.exit(1);
  }
}

const audioPath = path.join(ROOT, "public", "audio", `${id}.mp3`);
codificarMp3(Buffer.concat([res.pcm, silencio(300)]), audioPath);
const captions = alinearPorLinea(lineas, res.detectadas);
const capPath = writeCaptions(id, captions);
const dur = duracionMs(res.pcm) / 1000;
console.log(`\n✔ Audio:      ${path.relative(ROOT, audioPath)} (${dur.toFixed(1)} s · modo ${modo})`);
console.log(`✔ Subtítulos: ${path.relative(ROOT, capPath)} (sincronizados, con quién habla)`);
console.log(resumenEscenas(spec, captions));
console.log(`\nSiguiente paso: npm run render -- ${id}`);
