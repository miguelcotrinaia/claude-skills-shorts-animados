// Voces de los personajes (perfiles/personajes.json) y de tu cuenta de ElevenLabs.
//   npm run voces -- --info                          → voz de cada personaje, modo y créditos
//   npm run voces                                    → lo anterior + lista de voces de tu cuenta
//   npm run voces -- --usar <personaje> <voiceId>    → cambia la voz de un personaje por defecto
//                                                      (<personaje> = su nombre, principal | secundario | narrador | extra, o el nombre de un extra)
//   npm run voces -- --escuchar <personaje>          → genera una frase corta con su voz (~80 caracteres) en out/voces/
//   npm run voces -- --modo lineas|dialogo           → cambia el modo por defecto
//   npm run voces -- --probar                        → diálogo corto de prueba (~90 caracteres) para ver si tu cuenta tiene Text to Dialogue
//   npm run voces -- --comparar [personaje]          → la misma frase con 6 modelos/ajustes (~700 caracteres) en out/comparar/
//   npm run voces -- --elegir <personaje> <1-6>      → guarda esa variante para ese personaje (y pasa al modo por líneas si hace falta)
import fs from "node:fs";
import path from "node:path";
import { NOMBRE_ROL, ROLES, ROOT, esVoiceId, tokensArgs } from "./lib/common.mjs";
import { codificarMp3, decodificar } from "./lib/audio.mjs";
import { clave, creditos, detalleVoz, dialogo, etiquetaVoz, guardarConfigVoces, guardarVoz, infoVoz, leerConfigVoces, listarVoces, resolverQuien, tieneClave, tts, MENSAJE_SIN_CLAVE } from "./lib/elevenlabs.mjs";

const cfg = leerConfigVoces();
// Acción: funciona con "--comparar principal", "comparar principal" y también si PowerShell se come el "--"
const tokens = tokensArgs();
const ACCIONES = ["comparar", "elegir", "usar", "escuchar", "modo", "probar", "info"];
const accion = tokens.find((t) => ACCIONES.includes(t)) ?? ACCIONES.find((a) => process.env[`npm_config_${a}`] !== undefined);
const resto = tokens.filter((t) => t !== accion);
/** Voz actual de un personaje (rol o extra) */
const vozActual = (q) => (ROLES.includes(q) ? cfg.roles[q] : cfg.extras[q] ?? cfg.roles.extra);
const nombreDe = (q) => (ROLES.includes(q) ? NOMBRE_ROL[q] : q);
const quienDe = () => resto.map(resolverQuien).find(Boolean);
const USO_QUIEN = `${[NOMBRE_ROL.principal, NOMBRE_ROL.secundario].join(" | ")} | narrador | extra | <nombre de un extra>`;

// Variantes para comparar acento y parecido (misma frase, distinto modelo/ajustes)
const VARIANTES = [
  { n: 1, nombre: "multilingual-v2-tus-ajustes", modelo: "eleven_multilingual_v2", ajustes: "voz", nota: "Multilingual v2 con los ajustes guardados de tu voz en ElevenLabs" },
  { n: 2, nombre: "multilingual-v2-fiel", modelo: "eleven_multilingual_v2", ajustes: { stability: 0.7, similarity_boost: 1, style: 0, use_speaker_boost: true }, nota: "Multilingual v2, máximo parecido, sin estilo" },
  { n: 3, nombre: "multilingual-v2-actual", modelo: "eleven_multilingual_v2", ajustes: cfg.lineas.ajustes, nota: "Multilingual v2 con los ajustes actuales de la plantilla" },
  { n: 4, nombre: "v3-robusto", modelo: "eleven_v3", ajustes: { stability: 1 }, nota: "Eleven v3 en modo Robust (el más estable)" },
  { n: 5, nombre: "v4", modelo: "eleven_v4", ajustes: "voz", nota: "Eleven v4 (el más nuevo; recomendado para clones)" },
  { n: 6, nombre: "flash-v2.5-es", modelo: "eleven_flash_v2_5", ajustes: { stability: 0.6, similarity_boost: 1, style: 0, use_speaker_boost: true }, nota: "Flash v2.5 con idioma fijado en español" },
];
const FRASE = (q) => `Hola, soy ${nombreDe(q)}. Hoy te explico algo que usas todos los días, pero que casi nadie conoce de verdad.`;

if (!["modo", "usar"].includes(accion) && !tieneClave()) {
  console.log(MENSAJE_SIN_CLAVE);
  if (accion === "info" || !accion) {
    console.log(`\nModo: ${cfg.modo === "lineas" ? `por líneas (${cfg.lineas.modelo})` : `diálogo (${cfg.dialogo.modelo})`}`);
    for (const r of ROLES) console.log(`  ${NOMBRE_ROL[r].padEnd(14)} → ${cfg.roles[r].voiceId}`);
    for (const [n, v] of Object.entries(cfg.extras)) console.log(`  ${n.padEnd(14)} → ${v.voiceId}`);
  }
  process.exit(accion === "info" || !accion ? 0 : 1);
}

if (accion === "comparar") {
  const rol = quienDe() ?? "principal";
  const voiceId = vozActual(rol).voiceId;
  const d = await detalleVoz(voiceId);
  if (d.ok) {
    console.log(`Voz de ${nombreDe(rol)}: ${d.nombre} (${voiceId}) · tipo: ${d.categoria}`);
    console.log(`  Etiquetas: ${Object.entries(d.etiquetas).map(([k, v]) => `${k}=${v}`).join(", ") || "—"}`);
    if (d.idiomas.length) console.log(`  Idiomas verificados: ${d.idiomas.join(" | ")}`);
    if (d.pvc) console.log(`  Entrenamiento (PVC): ${d.pvc}`);
    console.log(`  Ajustes guardados: ${d.ajustes ? JSON.stringify(d.ajustes) : "—"}`);
  } else console.log(`(No pude leer el detalle de la voz: ${d.error})`);
  const dir = path.join(ROOT, "out", "comparar");
  fs.mkdirSync(dir, { recursive: true });
  console.log(`\nFrase: "${FRASE(rol)}"\n`);
  for (const v of VARIANTES) {
    process.stdout.write(`  ${v.n}. ${v.nota}… `);
    const r = await tts(voiceId, FRASE(rol), { modelo: v.modelo, ajustes: v.ajustes, idioma: cfg.idioma || "es" });
    if (!r.ok) {
      console.log(`✖ ${r.error}`);
      continue;
    }
    const f = path.join(dir, `${rol}-${v.n}-${v.nombre}.mp3`);
    fs.writeFileSync(f, Buffer.from(r.data.audio_base64, "base64"));
    console.log(`✔ out/comparar/${path.basename(f)}`);
  }
  console.log(`\nEscúchalos y elige el que mejor suena: npm run voces -- --elegir ${rol} <número>`);
  process.exit(0);
}

if (accion === "elegir") {
  const rol = quienDe();
  const v = VARIANTES.find((x) => resto.includes(String(x.n)));
  if (!rol || !v) {
    console.error(`Uso: npm run voces -- --elegir <${USO_QUIEN}> <1-${VARIANTES.length}>`);
    process.exit(1);
  }
  guardarVoz(rol, { modelo: v.modelo, ajustes: v.ajustes });
  // El diálogo junto usa un solo modelo para todos: si este personaje necesita otro, se pasa al modo por líneas
  const cambiaModo = v.modelo !== cfg.dialogo.modelo && cfg.modo !== "lineas";
  if (cambiaModo) guardarConfigVoces({ ...cfg, modo: "lineas" });
  console.log(`✔ ${nombreDe(rol)}: ${v.nota} (guardado en perfiles/personajes.json)`);
  if (cambiaModo) console.log("  Modo por defecto: por líneas (cada personaje con su modelo y ajustes).");
  process.exit(0);
}

if (accion === "usar") {
  const rol = quienDe();
  const voiceId = resto.find(esVoiceId) ?? resto.find((t) => !resolverQuien(t));
  if (!rol || !voiceId) {
    console.error(`Uso: npm run voces -- --usar <${USO_QUIEN}> <voiceId>`);
    process.exit(1);
  }
  const info = tieneClave() ? await infoVoz(voiceId) : { ok: false, error: "sin clave de ElevenLabs: no pude verificar la voz" };
  if (!info.ok && info.status === 404) {
    console.error(`✖ ${info.error}`);
    process.exit(1);
  }
  // Al cambiar de voz se descartan el modelo y los ajustes elegidos para la voz anterior
  guardarVoz(rol, { voiceId, nombre: info.ok ? info.nombre : undefined, modelo: undefined, ajustes: undefined });
  console.log(`✔ ${nombreDe(rol)}: ${etiquetaVoz(voiceId, info)}  (guardado en perfiles/personajes.json)`);
  if (!info.ok) console.log(`  (No pude verificar el nombre: ${info.error})`);
  process.exit(0);
}

if (accion === "escuchar") {
  const rol = quienDe() ?? "principal";
  const v = vozActual(rol);
  const salida = path.join(ROOT, "out", "voces", `${rol}.mp3`);
  const modelo = v.modelo || cfg.lineas.modelo;
  const ajustes = v.ajustes !== undefined ? v.ajustes : cfg.lineas.ajustes;
  console.log(`Generando una muestra de ${nombreDe(rol)} (${v.voiceId}, ~80 caracteres)…`);
  const r = await tts(v.voiceId, FRASE(rol), { modelo, ajustes, idioma: cfg.idioma || "es" });
  if (!r.ok) {
    console.error(`✖ ${r.error}`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(salida), { recursive: true });
  fs.writeFileSync(salida, Buffer.from(r.data.audio_base64, "base64"));
  console.log(`✔ Escúchala: out/voces/${rol}.mp3`);
  process.exit(0);
}

if (accion === "modo") {
  const m = resto.find((t) => t === "dialogo" || t === "lineas");
  if (!["dialogo", "lineas"].includes(m)) {
    console.error("Uso: npm run voces -- --modo dialogo|lineas");
    process.exit(1);
  }
  guardarConfigVoces({ ...cfg, modo: m });
  console.log(`✔ Modo por defecto: ${m}`);
  process.exit(0);
}

if (accion === "probar") {
  console.log(`Probando Text to Dialogue (${cfg.dialogo.modelo}) con ${NOMBRE_ROL.principal} y ${NOMBRE_ROL.secundario}…`);
  const r = await dialogo(
    [
      { text: `${NOMBRE_ROL.secundario}, ¿estás listo para grabar?`, voice_id: cfg.roles.principal.voiceId },
      { text: "[excited] ¡Listo! Cuando quieras empezamos.", voice_id: cfg.roles.secundario.voiceId },
    ],
    cfg.dialogo
  );
  if (!r.ok) {
    console.log(`✖ No funcionó: ${r.error}`);
    console.log('  Usa el modo por líneas: npm run voces -- --modo lineas  (cada línea con eleven_multilingual_v2).');
    process.exit(1);
  }
  const salida = path.join(ROOT, "out", "prueba-dialogo.mp3");
  codificarMp3(decodificar(Buffer.from(r.data.audio_base64, "base64")), salida);
  console.log(`✔ Funciona. Escucha la prueba: out/prueba-dialogo.mp3`);
  console.log(`  Segmentos con tiempos: ${(r.data.voice_segments || []).length} · alineación: ${r.data.alignment ? "sí" : "no"}`);
  process.exit(0);
}

console.log(`Modo: ${cfg.modo === "lineas" ? `por líneas (${cfg.lineas.modelo})` : `diálogo (${cfg.dialogo.modelo}; si falla, pasa solo a líneas)`}`);
for (const r of ROLES) {
  const v = cfg.roles[r];
  const info = await infoVoz(v.voiceId);
  console.log(`  ${NOMBRE_ROL[r].padEnd(14)} → ${etiquetaVoz(v.voiceId, info)}${info.ok && info.etiquetas ? ` — ${info.etiquetas}` : ""}${info.ok ? "" : `  (⚠ ${info.error})`}`);
}
for (const [n, v] of Object.entries(cfg.extras)) {
  const info = await infoVoz(v.voiceId);
  console.log(`  ${n.padEnd(14)} → ${etiquetaVoz(v.voiceId, info)}${info.ok ? "" : `  (⚠ ${info.error})`}`);
}
const c = await creditos();
if (c.ok) {
  const reset = c.reset ? new Date(c.reset * 1000).toLocaleDateString("es-PE") : "—";
  console.log(`Créditos: ${c.restantes.toLocaleString("es-PE")} caracteres disponibles de ${c.limite.toLocaleString("es-PE")} (plan ${c.plan}, se renuevan el ${reset})`);
} else {
  console.log(`Créditos: no disponibles (${c.error})`);
}

if (accion !== "info") {
  const l = await listarVoces();
  if (!l.ok) {
    console.log(`\nNo pude listar tus voces: ${l.error}`);
  } else {
    const usadas = new Set([...ROLES.map((r) => cfg.roles[r].voiceId), ...Object.values(cfg.extras).map((v) => v.voiceId)]);
    console.log(`\nVoces en tu cuenta (${l.voces.length}):`);
    for (const v of l.voces) console.log(`  ${usadas.has(v.id) ? "●" : " "} ${v.nombre.padEnd(28)} ${v.id}  ${v.categoria ?? ""}`);
    console.log(`\nPara cambiar una voz: npm run voces -- --usar <${USO_QUIEN}> <voiceId>`);
  }
}
