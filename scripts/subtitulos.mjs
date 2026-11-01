// Corrige los textos de los subtítulos SIN volver a generar ni transcribir la voz.
// 1) Edita los textos del diálogo en src/videos/<id>.ts (mismas líneas, mismo orden)
// 2) npm run subtitulos -- <id>
// Cada palabra nueva toma el tiempo de la palabra que reemplaza, línea por línea.
import fs from "node:fs";
import path from "node:path";
import { ROOT, alinearPorLinea, alignScriptToTimings, etiquetar, getVideo, lineasDe, palabrasDe, scriptText, writeCaptions } from "./lib/common.mjs";

const id = process.argv[2];
if (!id) {
  console.error("Uso: npm run subtitulos -- <id-del-video>");
  process.exit(1);
}
const spec = await getVideo(id);
const p = path.join(ROOT, "public", "captions", `${id}.json`);
if (!fs.existsSync(p)) {
  console.log("Este video aún no tiene voz: los subtítulos salen directo de los textos del diálogo. No hace falta correr nada.");
  process.exit(0);
}

const lineas = lineasDe(spec);
const old = JSON.parse(fs.readFileSync(p, "utf8"));
const timed = old.map((c) => ({ text: c.text.trim(), startMs: c.startMs, endMs: c.endMs, linea: c.linea }));
const maxLinea = Math.max(...timed.map((c) => (typeof c.linea === "number" ? c.linea : -1)));

let captions;
let aviso = "";
if (maxLinea + 1 === lineas.length) {
  // Mismo número de líneas: corrijo cada línea con sus propios tiempos
  const porLinea = lineas.map((l) => timed.filter((c) => c.linea === l.idx));
  captions = alinearPorLinea(lineas, porLinea);
  const difs = lineas.filter((l, i) => Math.abs(palabrasDe(l.texto).length - porLinea[i].length) > 3);
  if (difs.length) aviso = `⚠ En ${difs.length} línea(s) cambió bastante el texto respecto a lo que se dice en el audio.`;
} else {
  // Cambió la cantidad de líneas: alineo todo el texto y reparto por orden
  const words = scriptText(spec).split(/\s+/).filter(Boolean);
  captions = etiquetar(alignScriptToTimings(words, timed), lineas);
  aviso =
    maxLinea < 0
      ? "Subtítulos de la v1 convertidos a la v2 (cada palabra con su línea y quién la dice)."
      : `⚠ El diálogo ahora tiene ${lineas.length} líneas y el audio se sincronizó con ${maxLinea + 1}.`;
}

fs.copyFileSync(p, p.replace(/\.json$/, ".backup.json"));
writeCaptions(id, captions);
console.log(`✔ Subtítulos actualizados: public/captions/${id}.json (copia de respaldo: ${id}.backup.json)`);
if (aviso) {
  console.log(aviso);
  if (maxLinea >= 0) console.log("  Si cambiaste lo que se dice, vuelve a generar la voz (npm run voz:ia) o regrábala y sincroniza (npm run sincronizar).");
}
