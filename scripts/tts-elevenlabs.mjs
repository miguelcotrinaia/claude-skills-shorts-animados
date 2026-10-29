// Voz en off con IA usando tu cuenta de ElevenLabs: genera public/audio/<id>.mp3 + public/captions/<id>.json
// (los tiempos de cada palabra vienen de ElevenLabs: sincronía exacta, sin Whisper).
//
//   npm run voz:ia -- <id>                 → usa la voz por defecto (config/voz.json)
//   npm run voz:ia -- <id> --voz <voiceId> → usa otra voz solo para este video
import fs from "node:fs";
import path from "node:path";
import { ROOT, alignScriptToTimings, getVideo, paraVoz, scriptText, writeCaptions } from "./lib/common.mjs";
import { clave, creditos, etiquetaVoz, explicarError, infoVoz, leerConfigVoz, vozElegida } from "./lib/elevenlabs.mjs";

const args = process.argv.slice(2);
const id = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--voz");
const argVoz = args.includes("--voz") ? args[args.indexOf("--voz") + 1] : null;
if (!id) {
  console.error("Uso: npm run voz:ia -- <id-del-video> [--voz <voiceId>]");
  process.exit(1);
}

const key = clave();
const cfg = leerConfigVoz();
const voice = vozElegida(argVoz);
const spec = await getVideo(id);
const text = scriptText(spec);
const hablado = paraVoz(text);

const info = await infoVoz(voice);
console.log(`Voz: ${etiquetaVoz(voice, info)} · modelo ${cfg.modelo}`);
console.log(`Texto: ${hablado.length} caracteres (${text.split(/\s+/).length} palabras)`);
const c = await creditos();
if (c.ok) {
  console.log(`Créditos disponibles: ${c.restantes.toLocaleString("es-PE")} caracteres`);
  if (c.restantes < hablado.length) {
    console.error("✖ No te alcanzan los créditos para este texto. Acorta el guion o espera la renovación.");
    process.exit(1);
  }
}

console.log(`Generando voz para "${id}"…`);
let res;
try {
  res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ text: hablado, model_id: cfg.modelo, voice_settings: cfg.ajustes }),
  });
} catch (e) {
  console.error(`✖ No pude conectar con ElevenLabs: ${e?.message ?? e}`);
  process.exit(1);
}
if (!res.ok) {
  console.error(`✖ ${explicarError(res.status, await res.text())}`);
  process.exit(1);
}
const data = await res.json();

const audioDir = path.join(ROOT, "public", "audio");
fs.mkdirSync(audioDir, { recursive: true });
const audioPath = path.join(audioDir, `${id}.mp3`);
fs.writeFileSync(audioPath, Buffer.from(data.audio_base64, "base64"));

// Alineación por caracteres -> palabras
const al = data.alignment || data.normalized_alignment;
const words = [];
let cur = null;
al.characters.forEach((ch, i) => {
  if (/\s/.test(ch)) {
    if (cur) words.push(cur);
    cur = null;
    return;
  }
  const s = Math.round(al.character_start_times_seconds[i] * 1000);
  const e = Math.round(al.character_end_times_seconds[i] * 1000);
  if (!cur) cur = { text: ch, startMs: s, endMs: e };
  else {
    cur.text += ch;
    cur.endMs = e;
  }
});
if (cur) words.push(cur);

// Subtítulos con el texto del guion (con el @usuario escrito) y los tiempos exactos de la voz
const captions = alignScriptToTimings(text.split(/\s+/).filter(Boolean), words);
const capPath = writeCaptions(id, captions);
const dur = captions.length ? captions[captions.length - 1].endMs / 1000 : 0;
console.log(`✔ Audio:       ${path.relative(ROOT, audioPath)} (${dur.toFixed(1)} s)`);
console.log(`✔ Subtítulos:  ${path.relative(ROOT, capPath)} (sincronizados)`);
console.log(`Siguiente paso: npm run render -- ${id}`);
