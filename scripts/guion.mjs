// Guion en texto plano, listo para pegar en CapCut (texto a voz) u otro lector de voz.
// Uso: npm run guion -- <id-del-video>
// Escribe out/<id>-guion-voz.txt y lo muestra en pantalla. Una línea por escena = una pausa natural.
import fs from "node:fs";
import path from "node:path";
import { ROOT, getVideo, paraVoz } from "./lib/common.mjs";

const id = process.argv[2];
if (!id) {
  console.error("Uso: npm run guion -- <id-del-video>");
  process.exit(1);
}
const spec = await getVideo(id);

const texto = spec.escenas.map((e) => paraVoz(e.dice)).join("\n");
const palabras = texto.split(/\s+/).filter(Boolean).length;

const outDir = path.join(ROOT, "out");
fs.mkdirSync(outDir, { recursive: true });
const p = path.join(outDir, `${id}-guion-voz.txt`);
fs.writeFileSync(p, texto + "\n", "utf8");

console.log(`\n${texto}\n`);
console.log(`✔ ${palabras} palabras (~${Math.round(palabras / 2.6)} s) · guardado en out/${id}-guion-voz.txt`);
console.log("Después de generar la voz: guárdala como public/audio/" + id + ".mp3 y corre npm run sincronizar -- " + id);
