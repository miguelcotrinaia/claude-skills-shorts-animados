// Renderiza un video a out/<id>.mp4
//   npm run render -- <id>       → un MP4 (con voz) o out/<id>-SIN-VOZ.mp4 (vista previa en silencio)
//   npm run render -- --todos    → todos los videos
// En PowerShell también vale sin guiones: npm run render <id>
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT, bandera, loadVideos, tokensArgs } from "./lib/common.mjs";

const tokens = tokensArgs();
const todos = bandera(tokens, "todos");
const videos = await loadVideos();
const arg = todos ? "--todos" : tokens.find((t) => t !== "todos");
if (!arg) {
  console.error(`Uso: npm run render -- <id>   ·   Videos: ${videos.map((v) => v.id).join(", ")}`);
  process.exit(1);
}
const ids = arg === "--todos" ? videos.map((v) => v.id) : [arg];

// Evita exportar con voz sin sincronizar (la voz iría a otro ritmo que el video)
const audioDe = (id) => ["mp3", "wav", "m4a"].map((e) => path.join(ROOT, "public", "audio", `${id}.${e}`)).find((p) => fs.existsSync(p));
const revisarVoz = (id) => {
  const audio = audioDe(id);
  if (!audio) return true; // sin voz: vista previa con tiempos estimados
  const caps = path.join(ROOT, "public", "captions", `${id}.json`);
  if (!fs.existsSync(caps)) {
    console.error(`\n✖ ${id}: hay voz (${path.basename(audio)}) pero no está sincronizada.`);
    console.error(`  Corre primero: npm run sincronizar -- ${id}`);
    return false;
  }
  if (fs.statSync(audio).mtimeMs > fs.statSync(caps).mtimeMs + 1000) {
    console.error(`\n✖ ${id}: el audio cambió después de la última sincronización.`);
    console.error(`  Corre de nuevo: npm run sincronizar -- ${id}`);
    return false;
  }
  return true;
};

let fallo = false;
for (const id of ids) {
  if (!videos.find((v) => v.id === id)) {
    console.error(`No encontré el video "${id}". Disponibles: ${videos.map((x) => x.id).join(", ")}`);
    fallo = true;
    continue;
  }
  if (!revisarVoz(id)) {
    fallo = true;
    continue;
  }
  // Sin voz, el MP4 sale en silencio: se nombra distinto para no confundirlo con el video final
  const conVoz = Boolean(audioDe(id));
  const salida = conVoz ? `out/${id}.mp4` : `out/${id}-SIN-VOZ.mp4`;
  if (!conVoz) {
    console.log(`\n⚠ ${id} no tiene voz (falta public/audio/${id}.mp3): el MP4 sale EN SILENCIO, como vista previa.`);
    console.log(`  Para el video final: npm run voz:ia -- ${id}  (o tu audio + npm run sincronizar -- ${id}) y vuelve a exportar.`);
  }
  console.log(`\n▶ Renderizando ${id}…`);
  // --log=error: sin la barra de progreso línea por línea (menos texto en la conversación con Claude)
  execSync(`npx remotion render ${id} ${salida} --codec=h264 --crf=18 --log=error`, { stdio: "inherit", cwd: ROOT });
  console.log(`✔ ${salida}${conVoz ? " (con voz)" : " (sin voz, en silencio)"}`);
}
process.exit(fallo ? 1 : 0);
