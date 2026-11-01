// Fondos que rotan entre videos (claros y oscuros).
//   npm run ambientes                          → out/ambientes.html con los fondos + tabla de contraste + siguiente por plataforma
//   npm run ambientes -- --siguiente tiktok     → solo el nombre del siguiente fondo para esa plataforma (lo usa /nuevo-video)
// Qué fondos rotan lo decide perfiles/canal.json → fondos.usar ("rotar", "marca" o "mezclar");
// el orden de los 6 fondos fijos está en config/rotacion.json.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { NOMBRE_ROL, ROOT, bandera, loadTs, loadVideos, tokensArgs } from "./lib/common.mjs";

const tokens = tokensArgs();
const videos = await loadVideos();
const { AMBIENTES, contraste, rotacionDe } = await loadTs("src/engine/ambientes.ts", "ambientes");

const siguiente = (canal) => {
  const lista = rotacionDe(canal);
  const usados = videos.filter((v) => v.canal === canal && v.ambiente);
  const ultimo = usados[usados.length - 1]?.ambiente;
  const i = lista.indexOf(ultimo);
  return lista[(i + 1) % lista.length];
};

if (bandera(tokens, "siguiente")) {
  const canal = tokens.find((t) => t === "tiktok" || t === "youtube");
  if (!canal) {
    console.error("Uso: npm run ambientes -- --siguiente tiktok|youtube");
    process.exit(1);
  }
  console.log(siguiente(canal));
  process.exit(0);
}

const ids = [...new Set([...rotacionDe("tiktok"), ...rotacionDe("youtube")])];

// Tabla de contraste (WCAG): texto ≥ 4.5 ideal; acentos y colores de voz ≥ 3 para palabras grandes
const fila = (n, v) => `${n.padEnd(18)}${v}`;
console.log("Contraste con el fondo (≥ 4.5 texto · ≥ 3 títulos y subtítulos grandes)\n");
console.log(fila("", ids.map((i) => AMBIENTES[i].nombre.slice(0, 12).padEnd(13)).join("")));
const filaDe = (nombre, f) =>
  console.log(
    fila(
      nombre,
      ids
        .map((i) => {
          const c = contraste(f(AMBIENTES[i]), AMBIENTES[i].bg);
          return `${c.toFixed(1)}${c < 3 ? "!" : ""}`.padEnd(13);
        })
        .join("")
    )
  );
filaDe("Texto", (a) => a.texto);
filaDe("Acento", (a) => a.acento);
filaDe(`Voz ${NOMBRE_ROL.principal}`.slice(0, 17), (a) => a.hablantes.principal);
filaDe(`Voz ${NOMBRE_ROL.secundario}`.slice(0, 17), (a) => a.hablantes.secundario);
filaDe("Voz extra", (a) => a.hablantes.extra);
console.log("\n(!) = contraste bajo. En fondos oscuros los personajes llevan borde de luz; en claros, contorno oscuro.");
console.log(`\nSiguiente fondo · TikTok: ${siguiente("tiktok")} · YouTube: ${siguiente("youtube")}`);

// Hoja visual
if (!bandera(tokens, "sin-imagen")) {
  const dir = path.join(ROOT, "out", "ambientes");
  fs.mkdirSync(dir, { recursive: true });
  console.log("\nGenerando las imágenes de cada fondo…");
  for (const id of ids) {
    const f = path.join(dir, `${id}.png`);
    const props = path.join(dir, `${id}.json`);
    fs.writeFileSync(props, JSON.stringify({ ambiente: id }));
    execSync(`npx remotion still Ambiente "${f}" --frame=10 --scale=0.5 --props="${props}" --log=error`, { cwd: ROOT, stdio: "inherit" });
  }
  const html = `<!doctype html><meta charset="utf-8"><title>Fondos</title>
<body style="margin:0;background:#222;display:flex;gap:8px;padding:8px;overflow-x:auto">
${ids.map((id) => `<figure style="margin:0;color:#ddd;font:14px monospace;text-align:center"><img src="ambientes/${id}.png" style="height:92vh;display:block">${id}</figure>`).join("\n")}
</body>`;
  fs.writeFileSync(path.join(ROOT, "out", "ambientes.html"), html, "utf8");
  console.log("✔ out/ambientes.html (ábrelo en el navegador) · imágenes en out/ambientes/");
}
