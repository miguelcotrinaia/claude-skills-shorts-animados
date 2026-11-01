// Audio con el ffmpeg que trae Remotion: decodificar, unir con pausas y exportar a mp3.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./common.mjs";

export const RATE = 44100;
const TMP = path.join(ROOT, "node_modules", ".cache", "audio");

const q = (a) => (/[\s"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);

export const ffmpeg = (args) => {
  const r = spawnSync(["npx", "remotion", "ffmpeg", "-hide_banner", "-loglevel", "error", ...args].map(q).join(" "), {
    shell: true,
    maxBuffer: 1024 * 1024 * 1024,
    encoding: "buffer",
    cwd: ROOT,
  });
  if (r.status !== 0) throw new Error(`ffmpeg falló: ${r.stderr?.toString().slice(0, 400)}`);
  return r.stdout;
};

const tmp = (nombre) => {
  fs.mkdirSync(TMP, { recursive: true });
  return path.join(TMP, nombre);
};

/** Datos PCM de un WAV (busca el bloque "data") */
const pcmDeWav = (wav) => {
  let o = 12;
  while (o + 8 <= wav.length) {
    const id = wav.toString("ascii", o, o + 4);
    const size = wav.readUInt32LE(o + 4);
    if (id === "data") return wav.subarray(o + 8, Math.min(wav.length, o + 8 + size));
    o += 8 + size + (size % 2);
  }
  throw new Error("WAV sin datos de audio");
};

/** mp3 (Buffer) → PCM 16 bits mono 44.1 kHz */
export const decodificar = (mp3) => {
  const base = tmp(`in-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  fs.writeFileSync(`${base}.mp3`, mp3);
  try {
    ffmpeg(["-y", "-i", `${base}.mp3`, "-ac", "1", "-ar", String(RATE), "-c:a", "pcm_s16le", `${base}.wav`]);
    return Buffer.from(pcmDeWav(fs.readFileSync(`${base}.wav`)));
  } finally {
    fs.rmSync(`${base}.mp3`, { force: true });
    fs.rmSync(`${base}.wav`, { force: true });
  }
};

export const silencio = (ms) => Buffer.alloc(Math.round((ms / 1000) * RATE) * 2);

export const duracionMs = (pcm) => (pcm.length / 2 / RATE) * 1000;

/** PCM → mp3 */
export const codificarMp3 = (pcm, salida) => {
  const f = tmp(`out-${Date.now()}.pcm`);
  fs.writeFileSync(f, pcm);
  try {
    fs.mkdirSync(path.dirname(salida), { recursive: true });
    ffmpeg(["-y", "-f", "s16le", "-ar", String(RATE), "-ac", "1", "-i", f, "-codec:a", "libmp3lame", "-b:a", "160k", salida]);
  } finally {
    fs.rmSync(f, { force: true });
  }
};
