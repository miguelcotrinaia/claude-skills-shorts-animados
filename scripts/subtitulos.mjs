// Corrige los textos de los subtítulos SIN volver a generar ni transcribir la voz.
// 1) Edita los textos "dice" del video en src/videos/<id>.ts
// 2) npm run subtitulos -- <id>
// Cada palabra nueva toma el tiempo de la palabra que reemplaza.
import fs from "node:fs";
import path from "node:path";
import { ROOT, alignScriptToTimings, getVideo, scriptText, writeCaptions } from "./lib/common.mjs";

const id = process.argv[2];
if (!id) {
  console.error("Uso: npm run subtitulos -- <id-del-video>");
  process.exit(1);
}
const spec = await getVideo(id);
const p = path.join(ROOT, "public", "captions", `${id}.json`);
if (!fs.existsSync(p)) {
  console.log('Este video aún no tiene voz: los subtítulos salen directo de los textos "dice". No hace falta correr nada.');
  process.exit(0);
}

const old = JSON.parse(fs.readFileSync(p, "utf8"));
const timed = old.map((c) => ({ text: c.text.trim(), startMs: c.startMs, endMs: c.endMs }));
const words = scriptText(spec).split(/\s+/).filter(Boolean);
const captions = alignScriptToTimings(words, timed);

fs.copyFileSync(p, p.replace(/\.json$/, ".backup.json"));
writeCaptions(id, captions);

const diff = Math.abs(words.length - timed.length);
console.log(`✔ Subtítulos actualizados: public/captions/${id}.json (copia de respaldo: ${id}.backup.json)`);
if (diff > 3) {
  console.log(
    `⚠ El texto nuevo tiene ${diff} palabras de diferencia con lo que se dice en el audio. ` +
      "Si cambiaste frases enteras, vuelve a generar la voz (npm run voz:ia) o regrábala (npm run sincronizar)."
  );
}
