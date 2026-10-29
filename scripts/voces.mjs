// Voces de tu cuenta de ElevenLabs.
//   npm run voces                     → voz por defecto, créditos y lista de voces de tu cuenta
//   npm run voces -- --info           → solo voz por defecto y créditos
//   npm run voces -- --usar <voiceId> → cambia la voz por defecto (config/voz.json)
import { creditos, etiquetaVoz, guardarConfigVoz, infoVoz, leerConfigVoz, listarVoces, vozElegida } from "./lib/elevenlabs.mjs";

const args = process.argv.slice(2);
const usar = args.includes("--usar") ? args[args.indexOf("--usar") + 1] : null;
const soloInfo = args.includes("--info");

if (usar) {
  const info = await infoVoz(usar);
  if (!info.ok && info.status === 404) {
    console.error(`✖ ${info.error}`);
    process.exit(1);
  }
  guardarConfigVoz({ voiceId: usar });
  console.log(`✔ Voz por defecto: ${etiquetaVoz(usar, info)}  (guardada en config/voz.json)`);
  if (!info.ok) console.log(`  (No pude verificar el nombre: ${info.error})`);
  process.exit(0);
}

const cfg = leerConfigVoz();
const id = vozElegida();
const info = await infoVoz(id);
console.log(`Voz por defecto: ${etiquetaVoz(id, info)}${info.ok && info.etiquetas ? ` — ${info.etiquetas}` : ""}`);
if (!info.ok) console.log(`  (${info.error})`);
console.log(`Modelo: ${cfg.modelo}`);

const c = await creditos();
if (c.ok) {
  const reset = c.reset ? new Date(c.reset * 1000).toLocaleDateString("es-PE") : "—";
  console.log(`Créditos: ${c.restantes.toLocaleString("es-PE")} caracteres disponibles de ${c.limite.toLocaleString("es-PE")} (plan ${c.plan}, se renuevan el ${reset})`);
} else {
  console.log(`Créditos: no disponibles (${c.error})`);
}

if (!soloInfo) {
  const l = await listarVoces();
  if (!l.ok) {
    console.log(`\nNo pude listar tus voces: ${l.error}`);
  } else {
    console.log(`\nVoces en tu cuenta (${l.voces.length}):`);
    for (const v of l.voces) console.log(`  ${v.id === id ? "●" : " "} ${v.nombre.padEnd(28)} ${v.id}  ${v.categoria ?? ""}`);
    console.log("\nPara cambiar la voz por defecto: npm run voces -- --usar <voiceId>");
  }
}
