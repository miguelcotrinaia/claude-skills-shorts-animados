// Utilidades compartidas por los scripts (guion con diálogo: cada personaje con su voz).
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Carga variables de .env (sin dependencias) */
export const loadEnv = () => {
  const p = path.join(ROOT, ".env");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
};

/** Importa un archivo TypeScript del proyecto (lo empaqueta con esbuild) */
export const loadTs = async (entry, nombre) => {
  const outfile = path.join(ROOT, "node_modules", ".cache", `${nombre}.mjs`);
  await build({
    entryPoints: [path.join(ROOT, entry)],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
  });
  return import(pathToFileURL(outfile).href + `?t=${Date.now()}`);
};

/** Lee los videos definidos en src/videos (TypeScript) */
export const loadVideos = async () => (await loadTs("src/videos/index.ts", "videos")).VIDEOS;

export const getVideo = async (id) => {
  const videos = await loadVideos();
  const v = videos.find((x) => x.id === id);
  if (!v) {
    console.error(`No encontré el video "${id}". Disponibles: ${videos.map((x) => x.id).join(", ")}`);
    process.exit(1);
  }
  return v;
};

/** Lee un JSON de perfiles/ (personajes.json o canal.json). Devuelve {} si no existe. */
export const leerPerfil = (nombre) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "perfiles", nombre), "utf8"));
  } catch {
    return {};
  }
};

const PJ = leerPerfil("personajes.json");
const CANAL = leerPerfil("canal.json");

export const ROLES = ["narrador", "principal", "secundario", "extra"];
/** Extra que se usa cuando una línea dice quien: "extra" sin decir cuál */
export const EXTRA_POR_DEFECTO = Object.keys(PJ.extras ?? {})[0] ?? "extra";
/** Idioma de 2 letras para la transcripción y la voz (es, en, pt…) */
export const idiomaVoz = () => String(CANAL.idioma || "es").slice(0, 2).toLowerCase();

// ── Argumentos tolerantes ───────────────────────────────────
// En la terminal PowerShell de Windows, "npm run x -- --bandera valor" pierde el "--": npm se queda con
// --bandera (la convierte en la variable npm_config_bandera) y al script solo le llega "valor".
// Por eso aceptamos "--bandera valor", "bandera valor", "bandera=valor" y ese caso de PowerShell.
export const tokensArgs = () =>
  process.argv
    .slice(2)
    .flatMap((a) => a.replace(/^--?/, "").split("="))
    .filter(Boolean);
export const bandera = (tokens, nombre) => tokens.includes(nombre) || process.env[`npm_config_${nombre.replace(/-/g, "_")}`] !== undefined;
export const esVoiceId = (t) => /^(?=.*[A-Z])(?=.*[a-z])[A-Za-z0-9]{20}$/.test(t);
export const esRol = (t) => ROLES.includes(t);
export const NOMBRE_ROL = { narrador: PJ.narrador?.nombre ?? "Voz en off", principal: PJ.principal?.nombre ?? "Principal", secundario: PJ.secundario?.nombre ?? "Secundario", extra: "Extra" };

/** Todas las líneas del diálogo en orden: { idx, escena, quien, extra, texto, tono } */
export const lineasDe = (spec) => {
  const out = [];
  spec.escenas.forEach((e, ei) =>
    e.dialogo.forEach((l) =>
      out.push({
        idx: out.length,
        escena: ei,
        quien: l.quien,
        extra: l.quien === "extra" ? l.extra ?? e.extra ?? EXTRA_POR_DEFECTO : undefined,
        texto: l.texto.trim(),
        tono: l.tono,
      })
    )
  );
  return out;
};

export const palabrasDe = (texto) => texto.split(/\s+/).filter(Boolean);

export const scriptText = (spec) => lineasDe(spec).map((l) => l.texto).join(" ");

/** Etiqueta para el guion: nombre del personaje, "Voz en off" o el nombre del extra */
export const etiquetaLinea = (l) => (l.quien === "extra" ? (l.extra ?? "extra").replace(/^./, (c) => c.toUpperCase()) : NOMBRE_ROL[l.quien]);

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Cómo se lee en voz alta: el @usuario se cambia por su versión hablada (los subtítulos siguen mostrando el @usuario) */
export const paraVoz = (t) => {
  let out = t;
  if (CANAL.handle && CANAL.handleHablado) out = out.replace(new RegExp(escapar(CANAL.handle), "gi"), CANAL.handleHablado);
  return out.replace(/\s+/g, " ").trim();
};

export const normalize = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

/**
 * Alinea las palabras del guion con las palabras detectadas (con tiempos).
 * Devuelve subtítulos con el TEXTO del guion (bien escrito) y los TIEMPOS reales.
 */
export const alignScriptToTimings = (scriptWords, timed) => {
  const a = scriptWords.map(normalize);
  const b = timed.map((t) => normalize(t.text));
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sub = dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      dp[i][j] = Math.min(sub, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
    }
  }
  const map = new Array(n).fill(-1);
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    const sub = dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
    if (dp[i][j] === sub) {
      map[i - 1] = j - 1;
      i--;
      j--;
    } else if (dp[i][j] === dp[i - 1][j] + 1) {
      i--;
    } else {
      j--;
    }
  }
  const out = scriptWords.map((w, k) => {
    const t = map[k] >= 0 ? timed[map[k]] : null;
    return { text: w, startMs: t ? t.startMs : null, endMs: t ? t.endMs : null };
  });
  for (let k = 0; k < out.length; k++) {
    if (out[k].startMs !== null) continue;
    let p = k - 1;
    while (p >= 0 && out[p].endMs === null) p--;
    let q = k + 1;
    while (q < out.length && out[q].startMs === null) q++;
    const from = p >= 0 ? out[p].endMs : timed[0]?.startMs ?? 0;
    const to = q < out.length ? out[q].startMs : from + 400 * (q - p);
    const span = q - p - 1;
    const idx = k - p - 1;
    const step = (to - from) / Math.max(1, span);
    out[k].startMs = Math.round(from + step * idx);
    out[k].endMs = Math.round(from + step * (idx + 1));
  }
  for (let k = 1; k < out.length; k++) {
    if (out[k].startMs < out[k - 1].startMs) out[k].startMs = out[k - 1].startMs;
    if (out[k].endMs < out[k].startMs) out[k].endMs = out[k].startMs + 80;
  }
  return out.map((w, k) => ({
    text: (k === 0 ? "" : " ") + w.text,
    startMs: w.startMs,
    endMs: w.endMs,
    timestampMs: Math.round((w.startMs + w.endMs) / 2),
    confidence: 1,
  }));
};

/** Agrega a cada palabra quién la dice y en qué línea (por orden, palabra a palabra) */
export const etiquetar = (captions, lineas) => {
  const plan = lineas.flatMap((l) => palabrasDe(l.texto).map(() => ({ quien: l.quien, linea: l.idx })));
  return captions.map((c, k) => ({ ...c, ...(plan[Math.min(k, plan.length - 1)] ?? { quien: "principal", linea: 0 }) }));
};

/** Alinea línea por línea: palabras detectadas (con tiempos) de cada línea → subtítulos etiquetados */
export const alinearPorLinea = (lineas, detectadasPorLinea) =>
  lineas.flatMap((l, i) =>
    alignScriptToTimings(palabrasDe(l.texto), detectadasPorLinea[i] ?? []).map((c) => ({
      ...c,
      text: " " + c.text.trim(),
      quien: l.quien,
      linea: l.idx,
    }))
  ).map((c, k) => (k === 0 ? { ...c, text: c.text.trim() } : c));

export const writeCaptions = (id, captions) => {
  const dir = path.join(ROOT, "public", "captions");
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, `${id}.json`);
  fs.writeFileSync(p, JSON.stringify(captions, null, 1));
  return p;
};

/** Resumen: cuándo empieza cada escena */
export const resumenEscenas = (spec, captions) => {
  const lineas = lineasDe(spec);
  return spec.escenas
    .map((e, i) => {
      const primera = lineas.find((l) => l.escena === i);
      const c = captions.find((w) => w.linea === primera?.idx);
      return `   escena ${i + 1} (${e.tipo}) empieza en ${c ? (c.startMs / 1000).toFixed(2) : "?"} s`;
    })
    .join("\n");
};
