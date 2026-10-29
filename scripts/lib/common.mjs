// Utilidades compartidas por los scripts de voz.
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

/** Lee los videos definidos en src/videos (TypeScript) */
export const loadVideos = async () => {
  const outfile = path.join(ROOT, "node_modules", ".cache", "videos.mjs");
  await build({
    entryPoints: [path.join(ROOT, "src", "videos", "index.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
  });
  const mod = await import(pathToFileURL(outfile).href + `?t=${Date.now()}`);
  return mod.VIDEOS;
};

export const getVideo = async (id) => {
  const videos = await loadVideos();
  const v = videos.find((x) => x.id === id);
  if (!v) {
    console.error(`No encontré el video "${id}". Disponibles: ${videos.map((x) => x.id).join(", ")}`);
    process.exit(1);
  }
  return v;
};

export const scriptText = (spec) => spec.escenas.map((e) => e.dice.trim()).join(" ");

/** Lee un JSON de perfiles/ (personajes.json o canal.json). Devuelve {} si no existe. */
export const leerPerfil = (nombre) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "perfiles", nombre), "utf8"));
  } catch {
    return {};
  }
};

const CANAL = leerPerfil("canal.json");
const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Idioma de 2 letras para la transcripción (es, en, pt…) */
export const idiomaVoz = () => String(CANAL.idioma || "es").slice(0, 2).toLowerCase();

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
  // retroceso
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
  // tiempos (interpolando palabras del guion que no se detectaron)
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
    const from = p >= 0 ? out[p].endMs : 0;
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

export const writeCaptions = (id, captions) => {
  const dir = path.join(ROOT, "public", "captions");
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, `${id}.json`);
  fs.writeFileSync(p, JSON.stringify(captions, null, 1));
  return p;
};
