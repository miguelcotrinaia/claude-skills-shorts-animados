// Estado del estudio: revisa lo necesario para crear videos y prepara lo que falte.
//   npm run estado
// - Revisa la versión de Node
// - Crea .env (desde .env.example) si no existe, para pegar ahí la clave de ElevenLabs
// - Dice si la clave está puesta (sin mostrarla), la voz por defecto y si los perfiles son propios o de ejemplo
import fs from "node:fs";
import path from "node:path";
import { ROOT, leerPerfil, loadEnv, loadVideos } from "./lib/common.mjs";

const ok = (t) => console.log(`✔ ${t}`);
const no = (t) => console.log(`✖ ${t}`);
const info = (t) => console.log(`· ${t}`);

// Node
const [mayor] = process.versions.node.split(".").map(Number);
if (mayor >= 20) ok(`Node ${process.versions.node}`);
else no(`Node ${process.versions.node}: necesitas Node 20 o superior (nodejs.org)`);

// Carpetas de trabajo
for (const d of ["public/audio", "public/captions", "public/music", "out"]) fs.mkdirSync(path.join(ROOT, d), { recursive: true });

// .env y clave
const envPath = path.join(ROOT, ".env");
if (!fs.existsSync(envPath)) {
  fs.copyFileSync(path.join(ROOT, ".env.example"), envPath);
  ok("Creé el archivo .env (ahí va tu clave de ElevenLabs, si usarás voz IA)");
}
loadEnv();
const clave = Boolean(process.env.ELEVENLABS_API_KEY);
if (clave) ok("Clave de ElevenLabs: configurada");
else info("Clave de ElevenLabs: no configurada → sin clave puedes usar tu propio audio o exportar sin voz");

// Voces
let voz = {};
try {
  voz = JSON.parse(fs.readFileSync(path.join(ROOT, "config", "voces.json"), "utf8"));
} catch {}
const PJ = leerPerfil("personajes.json");
const vozDe = (v) => v?.voiceId || voz.vozPorDefecto || "—";
info(
  `Voces (modo ${voz.modo || "lineas"}): voz en off ${vozDe(PJ.narrador?.voz)} · ${PJ.principal?.nombre ?? "principal"} ${vozDe(PJ.principal?.voz)} · ` +
    `${PJ.secundario?.nombre ?? "secundario"} ${vozDe(PJ.secundario?.voz)} · extras ${vozDe(PJ.vozExtras)}`
);

// Perfiles
const P = PJ;
const C = leerPerfil("canal.json");
const edPath = path.join(ROOT, "perfiles", "linea-editorial.md");
const ed = fs.existsSync(edPath) ? fs.readFileSync(edPath, "utf8") : "";
const edPlantilla = !ed || /^plantilla:\s*true\s*$/m.test(ed.split(/^---\s*$/m)[1] ?? "");

const estadoP = !P.principal ? "falta" : P.plantilla ? "ejemplo" : "propio";
const estadoC = !C.handle ? "falta" : C.plantilla ? "ejemplo" : "propio";
const estadoE = !ed ? "falta" : edPlantilla ? "ejemplo" : "propio";

const linea = (nombre, estado, detalle, comando) => {
  if (estado === "propio") ok(`${nombre}: propio (${detalle})`);
  else info(`${nombre}: ${estado === "falta" ? "no existe" : `de EJEMPLO (${detalle})`} → ${comando}`);
};
linea("Personajes", estadoP, `${P.principal?.nombre ?? "?"} y ${P.secundario?.nombre ?? "?"}`, "créalos con /personajes");
linea("Canal", estadoC, `${C.handle ?? "?"} · fondos: ${C.fondos?.usar ?? "rotar"}`, "configúralo con /nuevo-video editorial");
linea("Línea editorial", estadoE, "perfiles/linea-editorial.md", "configúrala con /nuevo-video editorial");

// Videos
try {
  const videos = await loadVideos();
  info(`Videos: ${videos.length ? videos.map((v) => v.id).join(", ") : "ninguno todavía"}`);
} catch (e) {
  no(`No pude leer los videos (src/videos): ${e?.message ?? e}`);
}

// Línea fácil de leer para el asistente
console.log(`\nESTADO personajes=${estadoP} canal=${estadoC} editorial=${estadoE} clave=${clave ? "si" : "no"} modo=${voz.modo || "lineas"}`);
