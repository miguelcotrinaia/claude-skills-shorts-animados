// Revisión visual rápida: una toma por cada línea del diálogo (la toma de cámara de esa línea).
// Uso: npm run revisar -- <id>
//   → out/revisar/<id>-hoja.png : TODAS las tomas en una sola imagen pequeña (es la que mira Claude: menos tokens)
//   → out/revisar/<id>/NN.png + out/revisar/<id>.html : cada toma más grande (para revisarlas tú en el navegador)
// Sirve para detectar textos que se salen, solapes o tomas mal encuadradas sin exportar el video entero.
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, tokensArgs } from "./lib/common.mjs";

const id = tokensArgs()[0];
if (!id) {
  console.error("Uso: npm run revisar -- <id-del-video>");
  process.exit(1);
}
const browserExecutable = process.env.REMOTION_BROWSER || null;
console.log("Preparando…");
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts"), publicDir: path.join(ROOT, "public") });
// Un solo navegador para todas las imágenes
const puppeteerInstance = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id, inputProps: {}, browserExecutable, puppeteerInstance });
if (!composition.props.timeline) {
  console.error(`No pude armar el video "${id}".`);
  process.exit(1);
}
const tl = composition.props.timeline;
const fps = composition.fps;
const toF = (ms) => Math.round((ms / 1000) * fps);

// Un frame por línea: a 60 % de la línea (ya hizo su movimiento de cámara y su gesto)
const frames = tl.lineas.map((l) => ({
  f: Math.min(composition.durationInFrames - 1, toF(l.startMs + (l.endMs - l.startMs) * 0.6)),
  txt: `${l.idx + 1}. escena ${l.escena + 1} (${tl.encuadres[l.escena]}) · ${l.quien}: ${l.linea.texto}`,
}));
const dir = path.join(ROOT, "out", "revisar", id);
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
for (const [k, { f, txt }] of frames.entries()) {
  const out = path.join(dir, `${String(k + 1).padStart(2, "0")}.png`);
  await renderStill({ serveUrl, composition, frame: f, output: out, scale: 0.4, browserExecutable, puppeteerInstance });
  console.log(`  ${path.relative(ROOT, out)}  frame ${f}  ${txt.slice(0, 70)}`);
}
const html = `<!doctype html><meta charset="utf-8"><title>Revisar ${id}</title>
<body style="margin:0;background:#222;color:#ddd;font:13px monospace;display:flex;flex-wrap:wrap;gap:10px;padding:10px">
${frames.map(({ f, txt }, k) => `<figure style="margin:0;width:300px"><img src="${id}/${String(k + 1).padStart(2, "0")}.png" style="width:300px;display:block"><figcaption>${txt.replace(/</g, "&lt;")} · f${f}</figcaption></figure>`).join("\n")}
</body>`;
fs.writeFileSync(path.join(ROOT, "out", "revisar", `${id}.html`), html, "utf8");

// Hoja con todas las tomas (una sola imagen)
const hoja = await selectComposition({ serveUrl, id: "Revision", inputProps: { id }, browserExecutable, puppeteerInstance });
const hojaPath = path.join(ROOT, "out", "revisar", `${id}-hoja.png`);
await renderStill({ serveUrl, composition: hoja, frame: 0, output: hojaPath, inputProps: { id }, browserExecutable, puppeteerInstance });
await puppeteerInstance.close({ silent: true });
console.log(`✔ ${frames.length} tomas · hoja: out/revisar/${id}-hoja.png · detalle: out/revisar/${id}.html`);
