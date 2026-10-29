// Renderiza un video a out/<id>.mp4   ·   Uso: npm run render -- <id>   (o --todos)
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT, loadVideos } from "./lib/common.mjs";

const arg = process.argv[2];
const videos = await loadVideos();
if (!arg) {
  console.error(`Uso: npm run render -- <id>   ·   Videos: ${videos.map((v) => v.id).join(", ")}`);
  process.exit(1);
}
const ids = arg === "--todos" ? videos.map((v) => v.id) : [arg];

// Evita exportar con voz sin sincronizar (la voz iría a otro ritmo que el video)
const revisarVoz = (id) => {
  const audio = ["mp3", "wav", "m4a"].map((e) => path.join(ROOT, "public", "audio", `${id}.${e}`)).find((p) => fs.existsSync(p));
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
  if (!revisarVoz(id)) {
    fallo = true;
    continue;
  }
  console.log(`\n▶ Renderizando ${id}…`);
  execSync(`npx remotion render ${id} out/${id}.mp4 --codec=h264 --crf=18`, { stdio: "inherit", cwd: ROOT });
  console.log(`✔ out/${id}.mp4`);
}
process.exit(fallo ? 1 : 0);
