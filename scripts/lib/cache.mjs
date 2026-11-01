// Caché de la voz: cada línea (o bloque de diálogo) generada se guarda en .cache/voz/.
// Si vuelves a generar la voz después de cambiar una parte del guion, solo se paga lo que cambió.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./common.mjs";

const DIR = path.join(ROOT, ".cache", "voz");

export const claveCache = (obj) => crypto.createHash("sha256").update(JSON.stringify(obj)).digest("hex").slice(0, 32);

export const leerCache = (clave) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(DIR, `${clave}.json`), "utf8"));
  } catch {
    return null;
  }
};

export const enCache = (clave) => fs.existsSync(path.join(DIR, `${clave}.json`));

export const guardarCache = (clave, data) => {
  fs.mkdirSync(DIR, { recursive: true });
  const { audio_base64, alignment, normalized_alignment, voice_segments } = data;
  fs.writeFileSync(path.join(DIR, `${clave}.json`), JSON.stringify({ audio_base64, alignment, normalized_alignment, voice_segments }));
};
