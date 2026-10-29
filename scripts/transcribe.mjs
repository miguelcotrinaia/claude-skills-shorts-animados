// Sincroniza una voz que ya tienes (grabada por ti o generada en ElevenLabs web, CapCut, etc.)
// con el guion: escenas y subtítulos siguen el ritmo real del audio.
//
// 1) Guarda el audio como public/audio/<id>.mp3 (o .wav / .m4a)
// 2) npm run sincronizar -- <id>        (equivale a: npm run voz:propia -- <id>)
//
// Método:
//   - Por defecto usa las PAUSAS del audio (rápido, sin internet). Ideal si la voz lee el guion tal cual.
//   - Si las pausas no calzan con el guion, intenta con Whisper (transcripción palabra por palabra).
//   Forzar uno:  npm run sincronizar -- <id> --whisper   |   --pausas
//   Whisper: WHISPER_MODEL=small|medium|large-v3 (por defecto medium)
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT, alignScriptToTimings, getVideo, idiomaVoz, scriptText, writeCaptions } from "./lib/common.mjs";
import { alinearPorPausas, detectarSilencios } from "./lib/pausas.mjs";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
const forzarWhisper = args.includes("--whisper");
const forzarPausas = args.includes("--pausas");
if (!id) {
  console.error("Uso: npm run sincronizar -- <id-del-video> [--whisper | --pausas]");
  process.exit(1);
}
const spec = await getVideo(id);

const audio = ["mp3", "wav", "m4a"].map((ext) => path.join(ROOT, "public", "audio", `${id}.${ext}`)).find((p) => fs.existsSync(p));
if (!audio) {
  console.error(`No encontré public/audio/${id}.mp3 (ni .wav / .m4a).`);
  console.error(`Guarda ahí tu audio (grabado o de cualquier app de voz) con ese nombre exacto y vuelve a correr esto.`);
  process.exit(1);
}

const dices = spec.escenas.map((e) => e.dice);
const palabras = scriptText(spec).split(/\s+/).filter(Boolean);

const resumen = (captions) => {
  let k = 0;
  return spec.escenas
    .map((e, i) => {
      const n = e.dice.split(/\s+/).filter(Boolean).length;
      const c = captions[k];
      k += n;
      return `   escena ${i + 1} empieza en ${(c.startMs / 1000).toFixed(2)} s`;
    })
    .join("\n");
};

const guardar = (captions, metodo) => {
  const p = writeCaptions(id, captions);
  const fin = captions[captions.length - 1].endMs / 1000;
  console.log(`\n✔ Sincronizado con ${metodo}: ${path.relative(ROOT, p)} (voz de ${fin.toFixed(1)} s)`);
  console.log(resumen(captions));
  console.log(`\nSiguiente paso: npm run render -- ${id}`);
};

// ── 1) Por pausas ───────────────────────────────────────────
let porPausas = null;
if (!forzarWhisper) {
  const det = detectarSilencios(audio);
  if (!det.duracion) {
    console.error("No pude leer el audio con ffmpeg. ¿El archivo está completo?");
    process.exit(1);
  }
  porPausas = alinearPorPausas(dices, det);
  const ratio = porPausas.limites ? porPausas.emparejados / porPausas.limites : 1;
  const ppm = palabras.length / det.duracion;
  console.log(`Pausas: ${porPausas.emparejados}/${porPausas.limites} puntos del guion encontrados en el audio · ${ppm.toFixed(1)} palabras/s`);
  if (forzarPausas || (ratio >= 0.6 && ppm > 1.2 && ppm < 5)) {
    guardar(porPausas.captions, "las pausas del audio");
    process.exit(0);
  }
  console.log("Las pausas no calzan del todo con el guion; pruebo con Whisper…");
}

// ── 2) Whisper ──────────────────────────────────────────────
try {
  const { downloadWhisperModel, installWhisperCpp, toCaptions, transcribe } = await import("@remotion/install-whisper-cpp");
  const WHISPER_DIR = path.join(ROOT, "whisper.cpp");
  const VERSION = "1.5.5";
  const MODEL = process.env.WHISPER_MODEL || "medium";
  console.log("Preparando Whisper (la primera vez descarga el motor y el modelo, puede tardar)…");
  await installWhisperCpp({ to: WHISPER_DIR, version: VERSION });
  await downloadWhisperModel({ model: MODEL, folder: WHISPER_DIR });
  const tmp = path.join(ROOT, "node_modules", ".cache", `${id}-16k.wav`);
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  execSync(`npx remotion ffmpeg -y -i "${audio}" -ar 16000 -ac 1 "${tmp}"`, { stdio: "ignore", cwd: ROOT });
  console.log(`Transcribiendo con el modelo ${MODEL}…`);
  const out = await transcribe({
    inputPath: tmp,
    whisperPath: WHISPER_DIR,
    whisperCppVersion: VERSION,
    model: MODEL,
    tokenLevelTimestamps: true,
    language: idiomaVoz(),
  });
  const { captions: raw } = toCaptions({ whisperCppOutput: out });
  const timed = raw.map((c) => ({ text: c.text.trim(), startMs: c.startMs, endMs: c.endMs })).filter((c) => c.text.length > 0);
  guardar(alignScriptToTimings(palabras, timed), "Whisper");
} catch (e) {
  console.error(`\nWhisper no pudo correr: ${e?.message ?? e}`);
  if (porPausas) {
    console.log("Uso igual la sincronización por pausas (revisa el resultado en el Studio).");
    guardar(porPausas.captions, "las pausas del audio");
  } else {
    process.exit(1);
  }
}
