// Utilidades para la API de ElevenLabs (tu cuenta). La clave va en .env; la voz por defecto en config/voz.json.
import fs from "node:fs";
import path from "node:path";
import { ROOT, loadEnv } from "./common.mjs";

const API = "https://api.elevenlabs.io";
const CONFIG = path.join(ROOT, "config", "voz.json");

loadEnv();

export const leerConfigVoz = () => {
  const base = { proveedor: "elevenlabs", voiceId: "", modelo: "eleven_multilingual_v2", ajustes: {} };
  try {
    return { ...base, ...JSON.parse(fs.readFileSync(CONFIG, "utf8")) };
  } catch {
    return base;
  }
};

export const guardarConfigVoz = (cambios) => {
  const actual = leerConfigVoz();
  const nueva = { ...actual, ...cambios };
  fs.mkdirSync(path.dirname(CONFIG), { recursive: true });
  fs.writeFileSync(CONFIG, JSON.stringify(nueva, null, 2) + "\n", "utf8");
  return nueva;
};

/** Voz a usar: --voz <id>  >  ELEVENLABS_VOICE_ID en .env  >  config/voz.json */
export const vozElegida = (argVoz) => argVoz || process.env.ELEVENLABS_VOICE_ID || leerConfigVoz().voiceId;

export const clave = () => {
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) {
    console.error(
      "SIN_CLAVE · Falta tu clave de ElevenLabs.\n" +
        "  Para usar voz IA: abre el archivo .env de esta carpeta y pega la clave en ELEVENLABS_API_KEY=\n" +
        "  (se crea en elevenlabs.io → Developers → API Keys; si no existe .env, corre: npm run estado).\n" +
        "  Sin clave también puedes:\n" +
        "   · usar tu propio audio: guárdalo como public/audio/<id>.mp3 y corre npm run sincronizar -- <id>\n" +
        "   · exportar el video sin voz: npm run render -- <id>"
    );
    process.exit(1);
  }
  return k;
};

export const explicarError = (status, cuerpo) => {
  const t = String(cuerpo || "");
  if (status === 401) {
    if (/missing_permissions|permission/i.test(t)) return "La clave no tiene permiso para esta acción (revisa los permisos de la API key en ElevenLabs).";
    return "La clave de ElevenLabs no es válida (revisa ELEVENLABS_API_KEY en .env).";
  }
  if (status === 402 || /quota|credits|insufficient/i.test(t)) return "No te alcanzan los créditos de ElevenLabs para este texto.";
  if (status === 404)
    return "No encontré esa voz en tu cuenta. Si es una voz de otra cuenta, elige una tuya: npm run voces (lista) y npm run voces -- --usar <voiceId>.";
  if (status === 422) return `ElevenLabs rechazó los parámetros: ${t.slice(0, 300)}`;
  if (status === 429) return "ElevenLabs está limitando las solicitudes; espera un momento y vuelve a intentar.";
  return `ElevenLabs respondió ${status}: ${t.slice(0, 300)}`;
};

/** GET a la API. Devuelve { ok, status, data, error } sin lanzar excepciones. */
export const apiGet = async (ruta) => {
  try {
    const r = await fetch(`${API}${ruta}`, { headers: { "xi-api-key": clave() } });
    const txt = await r.text();
    if (!r.ok) return { ok: false, status: r.status, error: explicarError(r.status, txt) };
    return { ok: true, status: r.status, data: JSON.parse(txt) };
  } catch (e) {
    return { ok: false, status: 0, error: `No pude conectar con ElevenLabs: ${e?.message ?? e}` };
  }
};

export const infoVoz = async (voiceId) => {
  const r = await apiGet(`/v1/voices/${voiceId}`);
  if (!r.ok) return r;
  const v = r.data;
  const etiquetas = v.labels ? Object.values(v.labels).filter(Boolean).join(", ") : "";
  return { ok: true, nombre: v.name, categoria: v.category, etiquetas };
};

export const creditos = async () => {
  const r = await apiGet("/v1/user/subscription");
  if (!r.ok) return r;
  const { character_count: usados, character_limit: limite, tier, next_character_count_reset_unix: reset } = r.data;
  return { ok: true, usados, limite, restantes: limite - usados, plan: tier, reset };
};

export const listarVoces = async () => {
  const r = await apiGet("/v1/voices");
  if (!r.ok) return r;
  return { ok: true, voces: (r.data.voices || []).map((v) => ({ id: v.voice_id, nombre: v.name, categoria: v.category })) };
};

export const etiquetaVoz = (voiceId, info) =>
  info?.ok ? `${info.nombre} (${voiceId}${info.categoria ? ` · ${info.categoria}` : ""})` : voiceId;
