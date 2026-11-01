// Revisa los perfiles (personajes, canal y línea editorial) y muestra un resumen.
//   npm run perfiles                         → valida y resume
//   npm run perfiles -- --restaurar <qué>    → vuelve a la plantilla de ejemplo
//                                              <qué> = personajes | canal | editorial | todo
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/common.mjs";

const DIR = path.join(ROOT, "perfiles");
const EJEMPLO = path.join(ROOT, "plantillas", "ejemplo");
const ARCHIVOS = { personajes: "personajes.json", canal: "canal.json", editorial: "linea-editorial.md" };

const args = process.argv.slice(2);
if (args.includes("--restaurar")) {
  const que = args[args.indexOf("--restaurar") + 1];
  const lista = que === "todo" ? Object.keys(ARCHIVOS) : [que];
  if (!lista.every((k) => ARCHIVOS[k])) {
    console.error("Uso: npm run perfiles -- --restaurar personajes|canal|editorial|todo");
    process.exit(1);
  }
  fs.mkdirSync(DIR, { recursive: true });
  for (const k of lista) {
    fs.copyFileSync(path.join(EJEMPLO, ARCHIVOS[k]), path.join(DIR, ARCHIVOS[k]));
    console.log(`✔ perfiles/${ARCHIVOS[k]} restaurado con la plantilla de ejemplo`);
  }
  process.exit(0);
}

export const OPCIONES = {
  hairStyle: ["peinado", "corto", "rulos", "cresta", "largo", "calvo", "mono", "cola"],
  beard: ["ninguna", "candado", "barba", "bigote", "sombra"],
  glasses: ["ninguno", "rectangulares", "redondos"],
  outfit: ["blazer", "polo", "hoodie", "camisa"],
  accessory: ["ninguno", "corbata", "audifonos"],
  tipoSecundario: ["robot", "foco", "panda", "humano"],
  especie: ["persona", "perro"],
  base: ["orugas", "ruedas", "flotante"],
  estilo: ["agil", "clase"],
  fondos: ["rotar", "marca", "mezclar"],
};

const errores = [];
const avisos = [];
const esHex = (v) => typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);
const esVoiceId = (v) => typeof v === "string" && /^[A-Za-z0-9]{20}$/.test(v);
const revisarVoz = (voz, donde, obligatoria = false) => {
  if (voz === undefined) {
    if (obligatoria) avisos.push(`${donde}: sin voz propia (usa la voz por defecto de config/voces.json)`);
    return;
  }
  if (!voz || typeof voz !== "object") return errores.push(`${donde} debe ser { "voiceId": "..." }`);
  if (!esVoiceId(voz.voiceId)) errores.push(`${donde}.voiceId "${voz.voiceId ?? ""}" no parece un ID de voz de ElevenLabs (20 letras y números)`);
};

const leer = (nombre) => {
  const p = path.join(DIR, nombre);
  if (!fs.existsSync(p)) {
    errores.push(`Falta perfiles/${nombre}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    errores.push(`perfiles/${nombre} no es un JSON válido: ${e.message}`);
    return null;
  }
};

const revisarLook = (look, donde) => {
  if (!look || typeof look !== "object") {
    errores.push(`${donde}: falta "look"`);
    return;
  }
  for (const k of ["skin", "hair", "top", "pants"]) {
    if (!esHex(look[k])) errores.push(`${donde}.${k} debe ser un color #RRGGBB (tiene: ${look[k] ?? "nada"})`);
  }
  for (const k of ["beardColor", "glassesColor", "inner", "shoes", "accent"]) {
    if (look[k] !== undefined && !esHex(look[k])) errores.push(`${donde}.${k} debe ser un color #RRGGBB`);
  }
  const enums = { hairStyle: OPCIONES.hairStyle, beard: OPCIONES.beard, glasses: OPCIONES.glasses, outfit: OPCIONES.outfit, accessory: OPCIONES.accessory };
  for (const [k, ops] of Object.entries(enums)) {
    const req = k === "hairStyle" || k === "outfit";
    if (look[k] === undefined) {
      if (req) errores.push(`${donde}.${k} es obligatorio (${ops.join(", ")})`);
      continue;
    }
    if (!ops.includes(look[k])) errores.push(`${donde}.${k} = "${look[k]}" no existe. Opciones: ${ops.join(", ")}`);
  }
  if (look.especie !== undefined && !OPCIONES.especie.includes(look.especie)) {
    errores.push(`${donde}.especie = "${look.especie}" no existe. Opciones: ${OPCIONES.especie.join(", ")}`);
  }
};

// ── personajes ──────────────────────────────────────────────
const P = leer(ARCHIVOS.personajes);
if (P) {
  if (!P.principal?.nombre) errores.push("principal.nombre es obligatorio");
  revisarLook(P.principal?.look, "principal.look");
  if (P.principal?.lookAlterno) {
    revisarLook({ ...P.principal.look, ...P.principal.lookAlterno }, "principal.lookAlterno");
  }
  const s = P.secundario;
  if (!s?.nombre) errores.push("secundario.nombre es obligatorio");
  if (!OPCIONES.tipoSecundario.includes(s?.tipo)) errores.push(`secundario.tipo debe ser: ${OPCIONES.tipoSecundario.join(", ")}`);
  if (s?.tipo === "humano") revisarLook(s.look, "secundario.look");
  if (s?.tipo === "robot" || s?.tipo === "foco" || s?.tipo === "panda") {
    for (const k of ["cuerpo", "luz", "manchas"]) {
      if (s.colores?.[k] !== undefined && !esHex(s.colores[k])) errores.push(`secundario.colores.${k} debe ser #RRGGBB`);
    }
  }
  if (s?.tipo === "robot" && s.colores?.base !== undefined && !OPCIONES.base.includes(s.colores.base)) {
    errores.push(`secundario.colores.base debe ser: ${OPCIONES.base.join(", ")}`);
  }
  for (const [k, look] of Object.entries(P.extras ?? {})) {
    if (!/^[a-z0-9-]+$/.test(k)) errores.push(`extras: el nombre "${k}" debe ir en minúsculas, sin tildes ni espacios`);
    revisarLook(look, `extras.${k}`);
    revisarVoz(look.voz, `extras.${k}.voz`);
  }
  revisarVoz(P.narrador?.voz, "narrador.voz", true);
  revisarVoz(P.principal?.voz, "principal.voz", true);
  revisarVoz(P.secundario?.voz, "secundario.voz", true);
  revisarVoz(P.vozExtras, "vozExtras", true);
  if (Object.keys(P.extras ?? {}).length > 6) avisos.push("Hay más de 6 extras: la hoja de personajes solo muestra 6 (en los videos se usan todos).");
  for (const c of P.miniBots ?? []) if (!esHex(c)) errores.push(`miniBots: "${c}" debe ser #RRGGBB`);
}

// ── canal ───────────────────────────────────────────────────
const C = leer(ARCHIVOS.canal);
if (C) {
  for (const k of ["nombre", "handle", "lema"]) if (!C[k]) errores.push(`canal.${k} es obligatorio`);
  if (C.handle && !C.handleHablado) avisos.push(`canal.handleHablado vacío: la voz leerá "${C.handle}" tal cual.`);
  if (!Array.isArray(C.redes)) errores.push("canal.redes debe ser una lista, ej. [\"TikTok\", \"YouTube\"]");
  for (const pl of ["tiktok", "youtube"]) {
    const x = C.plataformas?.[pl];
    if (!x) {
      errores.push(`canal.plataformas.${pl} es obligatorio`);
      continue;
    }
    if (!OPCIONES.estilo.includes(x.estilo)) errores.push(`canal.plataformas.${pl}.estilo debe ser: agil o clase`);
  }
  const fo = C.fondos ?? {};
  if (fo.usar !== undefined && !OPCIONES.fondos.includes(fo.usar)) errores.push(`canal.fondos.usar debe ser: ${OPCIONES.fondos.join(", ")}`);
  if ((fo.usar === "marca" || fo.usar === "mezclar") && !esHex(fo.marca?.acento)) errores.push("canal.fondos.marca.acento (#RRGGBB) es obligatorio para usar tus colores de marca");
  for (const k of ["acento", "acento2", "oscuro", "claro"]) if (fo.marca?.[k] !== undefined && !esHex(fo.marca[k])) errores.push(`canal.fondos.marca.${k} debe ser #RRGGBB`);
}

// ── línea editorial ─────────────────────────────────────────
const edPath = path.join(DIR, ARCHIVOS.editorial);
const ed = fs.existsSync(edPath) ? fs.readFileSync(edPath, "utf8") : null;
if (!ed) errores.push("Falta perfiles/linea-editorial.md");
const edPlantilla = ed ? /^plantilla:\s*true\s*$/m.test(ed.split(/^---\s*$/m)[1] ?? "") : true;

// ── resumen ─────────────────────────────────────────────────
const marca = (plantilla) => (plantilla ? "EJEMPLO (todavía no es el tuyo)" : "propio");
if (P) {
  const s = P.secundario ?? {};
  console.log(`Personajes: ${marca(P.plantilla)}`);
  console.log(`  principal:  ${P.principal?.nombre} — ${P.principal?.rol ?? ""}`);
  console.log(`  secundario: ${s.nombre} (${s.tipo}${s.tipo === "robot" ? ` · ${s.colores?.base ?? "ruedas"}` : ""}) — ${s.rol ?? ""}`);
  console.log(`  extras:     ${Object.keys(P.extras ?? {}).join(", ") || "ninguno"}`);
  const voces = [P.narrador?.voz?.voiceId, P.principal?.voz?.voiceId, P.secundario?.voz?.voiceId, P.vozExtras?.voiceId].filter(Boolean);
  console.log(`  voces:      voz en off ${P.narrador?.voz?.voiceId ?? "(por defecto)"} · ${P.principal?.nombre} ${P.principal?.voz?.voiceId ?? "(por defecto)"} · ${s.nombre} ${s.voz?.voiceId ?? "(por defecto)"} · extras ${P.vozExtras?.voiceId ?? "(por defecto)"}`);
  if (voces.length > 1 && new Set(voces).size === 1) console.log("              (todos con la misma voz: se distinguen por el color y la cara del subtítulo)");
}
if (C) {
  console.log(`Canal: ${marca(C.plantilla)}`);
  console.log(`  ${C.nombre} · ${C.handle} (se lee "${C.handleHablado ?? C.handle}") · lema "${C.lema}" · idioma ${C.idioma ?? "es-PE"}`);
  for (const pl of ["tiktok", "youtube"]) {
    const x = C.plataformas?.[pl];
    if (x) console.log(`  ${pl.padEnd(8)} estilo ${x.estilo}`);
  }
  console.log(`  fondos:  ${C.fondos?.usar ?? "rotar"}${C.fondos?.marca ? ` · marca ${C.fondos.marca.acento ?? ""} ${C.fondos.marca.acento2 ?? ""}` : ""}`);
}
if (ed) console.log(`Línea editorial: ${marca(edPlantilla)} (perfiles/linea-editorial.md)`);

for (const a of avisos) console.log(`⚠ ${a}`);
if (errores.length) {
  console.error(`\n✖ ${errores.length} problema(s):`);
  for (const e of errores) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("\n✔ Perfiles válidos");
