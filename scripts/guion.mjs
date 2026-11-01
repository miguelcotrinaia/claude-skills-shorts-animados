// Guion en texto plano, listo para pegar en CapCut, ElevenLabs web u otro lector de voz.
// Uso: npm run guion -- <id-del-video>
// Escribe dos archivos:
//   out/<id>-guion-voz.txt   → una línea por intervención, con quién la dice ("Sofi: …", "Chispa: …", "Voz en off: …")
//   out/<id>-guion-plano.txt → solo el texto, una línea por intervención (para una sola voz)
import fs from "node:fs";
import path from "node:path";
import { ROOT, etiquetaLinea, getVideo, lineasDe, paraVoz, tokensArgs } from "./lib/common.mjs";

const id = tokensArgs()[0];
if (!id) {
  console.error("Uso: npm run guion -- <id-del-video>");
  process.exit(1);
}
const spec = await getVideo(id);
const lineas = lineasDe(spec);

const conVoces = lineas
  .map((l, i) => {
    const nuevaEscena = i > 0 && lineas[i - 1].escena !== l.escena;
    return `${nuevaEscena ? "\n" : ""}${etiquetaLinea(l)}: ${paraVoz(l.texto)}`;
  })
  .join("\n");
const plano = lineas.map((l) => paraVoz(l.texto)).join("\n");
const palabras = plano.split(/\s+/).filter(Boolean).length;

const outDir = path.join(ROOT, "out");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `${id}-guion-voz.txt`), conVoces + "\n", "utf8");
fs.writeFileSync(path.join(outDir, `${id}-guion-plano.txt`), plano + "\n", "utf8");

console.log(`\n${conVoces}\n`);
const seg = Math.round(palabras / 2.5);
console.log(`✔ ${palabras} palabras (~${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, "0")} min) · ${lineas.length} intervenciones`);
console.log(`  out/${id}-guion-voz.txt   (con quién habla)`);
console.log(`  out/${id}-guion-plano.txt (solo texto)`);
console.log(`Si generas la voz por tu cuenta: respeta el orden, deja una pausa corta entre intervenciones,`);
console.log(`guarda el audio en public/audio/${id}.mp3 y corre npm run sincronizar -- ${id}`);
