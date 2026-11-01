// API de ElevenLabs (tu cuenta). La clave va en .env.
// La voz de cada personaje está en perfiles/personajes.json ("voz" de cada uno); el modo y los modelos, en config/voces.json.
import fs from "node:fs";
import path from "node:path";
import { EXTRA_POR_DEFECTO, NOMBRE_ROL, ROLES, ROOT, loadEnv } from "./common.mjs";

const API = process.env.ELEVENLABS_API_BASE || "https://api.elevenlabs.io";
const CONFIG = path.join(ROOT, "config", "voces.json");
const PERSONAJES = path.join(ROOT, "perfiles", "personajes.json");

loadEnv();

/** Voz que se usa si un personaje no tiene una propia */
export const VOZ_POR_DEFECTO = "l1zE9xgNpUTaQCZzpNJa";

const BASE = {
  proveedor: "elevenlabs",
  modo: "lineas",
  vozPorDefecto: VOZ_POR_DEFECTO,
  dialogo: { modelo: "eleven_v3", estabilidad: 0.5, maxCaracteres: 1800 },
  lineas: {
    modelo: "eleven_multilingual_v2",
    ajustes: { stability: 0.45, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true },
    pausaMs: { mismoHablante: 180, cambioHablante: 320, cambioEscena: 450 },
  },
};

const leerJson = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
};
const escribirJson = (p, data) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
};

/** Dónde está la voz de cada rol dentro de perfiles/personajes.json */
const vozEn = (pj, rol) => (rol === "narrador" ? pj.narrador?.voz : rol === "extra" ? pj.vozExtras : pj[rol]?.voz);

/**
 * Configuración de voces: modo y modelos (config/voces.json) + la voz de cada rol (perfiles/personajes.json).
 * cfg.roles[rol] = { nombre, voiceId, modelo?, ajustes? } · cfg.extras[nombre] = voz propia de ese extra (si tiene)
 */
export const leerConfigVoces = () => {
  const c = leerJson(CONFIG) || {};
  const cfg = {
    ...BASE,
    ...c,
    dialogo: { ...BASE.dialogo, ...(c.dialogo || {}) },
    lineas: { ...BASE.lineas, ...(c.lineas || {}), pausaMs: { ...BASE.lineas.pausaMs, ...(c.lineas?.pausaMs || {}) } },
  };
  const pj = leerJson(PERSONAJES) || {};
  // v1: si existe config/voz.json (una sola voz en off), esa voz pasa a ser la de todos los que no tengan una propia
  const v1 = leerJson(path.join(ROOT, "config", "voz.json"));
  const porDefecto = v1?.voiceId || cfg.vozPorDefecto || VOZ_POR_DEFECTO;
  cfg.roles = {};
  for (const r of ROLES) {
    const v = vozEn(pj, r) || {};
    cfg.roles[r] = { nombre: NOMBRE_ROL[r], ...v, voiceId: v.voiceId || porDefecto };
  }
  cfg.extras = {};
  for (const [nombre, look] of Object.entries(pj.extras || {})) if (look?.voz?.voiceId) cfg.extras[nombre] = look.voz;
  cfg.idioma = String(leerJson(path.join(ROOT, "perfiles", "canal.json"))?.idioma || "es").slice(0, 2);
  return cfg;
};

/** Guarda modo y modelos (config/voces.json). Las voces de los personajes van en perfiles/personajes.json. */
export const guardarConfigVoces = (cfg) => {
  const { roles, extras, idioma, ...resto } = cfg;
  escribirJson(CONFIG, resto);
  return cfg;
};

/**
 * Cambia la voz de un rol (narrador | principal | secundario | extra) o de un extra concreto, en perfiles/personajes.json.
 * `cambios`: { voiceId?, nombre?, modelo?, ajustes? }
 */
export const guardarVoz = (quien, cambios) => {
  const pj = leerJson(PERSONAJES);
  if (!pj) throw new Error("No encontré perfiles/personajes.json");
  const fusionar = (v) => ({ ...(v || {}), ...cambios });
  if (quien === "narrador") pj.narrador = { nombre: pj.narrador?.nombre ?? "Voz en off", ...(pj.narrador || {}), voz: fusionar(pj.narrador?.voz) };
  else if (quien === "extra") pj.vozExtras = fusionar(pj.vozExtras);
  else if (quien === "principal" || quien === "secundario") pj[quien].voz = fusionar(pj[quien].voz);
  else if (pj.extras?.[quien]) pj.extras[quien].voz = fusionar(pj.extras[quien].voz);
  else throw new Error(`No hay un personaje "${quien}"`);
  escribirJson(PERSONAJES, pj);
};

/** Convierte "Sofi", "chispa", "principal", "profe"… en el rol o el extra al que se refiere */
export const resolverQuien = (t) => {
  if (!t) return null;
  const n = t.toLowerCase();
  if (ROLES.includes(n)) return n;
  for (const r of ROLES) if ((NOMBRE_ROL[r] || "").toLowerCase() === n) return r;
  if (n === "voz-en-off" || n === "voz en off" || n === "off") return "narrador";
  const pj = leerJson(PERSONAJES) || {};
  if (pj.extras?.[n]) return n;
  return null;
};

/** Voces por rol, con cambios por línea de comandos (--principal <voiceId>, --secundario …) */
export const vocesElegidas = (args = []) => {
  const cfg = leerConfigVoces();
  const out = {};
  for (const r of ROLES) {
    const i = args.indexOf(`--${r}`);
    out[r] = i >= 0 && args[i + 1] ? args[i + 1] : cfg.roles[r]?.voiceId;
  }
  return out;
};

/** Voz de una línea del guion (un extra puede tener voz propia) */
export const vozDeLinea = (cfg, voces, l) => (l.quien === "extra" ? cfg.extras[l.extra ?? EXTRA_POR_DEFECTO]?.voiceId ?? voces.extra : voces[l.quien]);

export const tieneClave = () => Boolean(process.env.ELEVENLABS_API_KEY);

export const MENSAJE_SIN_CLAVE =
  "SIN_CLAVE · Falta tu clave de ElevenLabs.\n" +
  "  Para usar voz IA: abre el archivo .env de esta carpeta y pega la clave en ELEVENLABS_API_KEY=\n" +
  "  (se crea en elevenlabs.io → Developers → API Keys; si no existe .env, corre: npm run estado).\n" +
  "  Sin clave también puedes:\n" +
  "   · usar tu propio audio: guárdalo como public/audio/<id>.mp3 y corre npm run sincronizar -- <id>\n" +
  "   · exportar el video sin voz: npm run render -- <id>";

export const clave = () => {
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) {
    console.error(MENSAJE_SIN_CLAVE);
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
    return "ElevenLabs no encontró esa voz en tu cuenta (puede ser de otra cuenta) o la función no está en tu plan. Elige una voz tuya: npm run voces";
  if (status === 422) return `ElevenLabs rechazó los parámetros: ${t.slice(0, 300)}`;
  if (status === 429) return "ElevenLabs está limitando las solicitudes; espera un momento y vuelve a intentar.";
  return `ElevenLabs respondió ${status}: ${t.slice(0, 300)}`;
};

/** Errores que no se arreglan cambiando de modo (clave, créditos, límite) */
export const errorFatal = (status, cuerpo) =>
  status === 401 || status === 402 || status === 429 || /quota|credits|insufficient|invalid_api_key/i.test(String(cuerpo || ""));

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

/** POST a la API. Devuelve { ok, status, data, error, cuerpo } sin lanzar excepciones. */
export const apiPost = async (ruta, body) => {
  try {
    const r = await fetch(`${API}${ruta}`, {
      method: "POST",
      headers: { "xi-api-key": clave(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const txt = await r.text();
    if (!r.ok) return { ok: false, status: r.status, error: explicarError(r.status, txt), cuerpo: txt };
    return { ok: true, status: r.status, data: JSON.parse(txt) };
  } catch (e) {
    return { ok: false, status: 0, error: `No pude conectar con ElevenLabs: ${e?.message ?? e}` };
  }
};

/** Detalle de una voz: tipo de clon, etiquetas (acento), ajustes guardados e idiomas verificados */
export const detalleVoz = async (voiceId) => {
  const r = await apiGet(`/v1/voices/${voiceId}?with_settings=true`);
  if (!r.ok) return r;
  const v = r.data;
  return {
    ok: true,
    nombre: v.name,
    categoria: v.category,
    etiquetas: v.labels || {},
    ajustes: v.settings || null,
    idiomas: (v.verified_languages || []).map((l) => [l.language, l.accent, l.locale, l.model_id].filter(Boolean).join(" · ")),
    pvc: v.fine_tuning?.state ? Object.entries(v.fine_tuning.state).map(([m, e]) => `${m}: ${e}`).join(", ") : "",
  };
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

export const etiquetaVoz = (voiceId, info) => (info?.ok ? `${info.nombre} (${voiceId}${info.categoria ? ` · ${info.categoria}` : ""})` : voiceId);

/**
 * Alineación por caracteres → palabras con tiempos (ms).
 * `cortes`: índices de carácter donde empieza otra línea (fuerza un corte de palabra).
 */
export const palabrasDeAlineacion = (al, { offsetMs = 0, cortes = [] } = {}) => {
  if (!al?.characters) return [];
  const corte = new Set(cortes);
  const words = [];
  let cur = null;
  al.characters.forEach((ch, i) => {
    if (corte.has(i) && cur) {
      words.push(cur);
      cur = null;
    }
    if (/\s/.test(ch)) {
      if (cur) words.push(cur);
      cur = null;
      return;
    }
    const s = Math.round(al.character_start_times_seconds[i] * 1000) + offsetMs;
    const e = Math.round(al.character_end_times_seconds[i] * 1000) + offsetMs;
    if (!cur) cur = { text: ch, startMs: s, endMs: e };
    else {
      cur.text += ch;
      cur.endMs = e;
    }
  });
  if (cur) words.push(cur);
  // Etiquetas de tono de v3 ([laughs], [excited]…) no son palabras del guion
  return words.filter((w) => !/^\[[^\]]*\]$/.test(w.text));
};

/** Modelos que aceptan language_code (fijar el idioma) */
export const aceptaIdioma = (modelo) => /eleven_v3|eleven_v4|flash_v2_5|turbo_v2_5/.test(modelo || "");

/**
 * Texto a voz de una línea (con tiempos por carácter).
 * ajustes: objeto de voice_settings, o "voz" / null para usar los ajustes guardados de esa voz en ElevenLabs.
 */
export const tts = (voiceId, texto, { modelo, ajustes, previo, siguiente, idioma }) =>
  apiPost(`/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    text: texto,
    model_id: modelo,
    ...(ajustes && typeof ajustes === "object" ? { voice_settings: ajustes } : {}),
    ...(idioma && aceptaIdioma(modelo) ? { language_code: idioma } : {}),
    ...(previo ? { previous_text: previo } : {}),
    ...(siguiente ? { next_text: siguiente } : {}),
  });

/** Modelo y ajustes de una voz en el modo por líneas (cada personaje puede tener los suyos) */
export const configLinea = (cfg, rol, extra) => {
  const r = (rol === "extra" && extra && cfg.extras[extra]) || cfg.roles[rol] || {};
  return {
    modelo: r.modelo || cfg.lineas.modelo,
    ajustes: r.ajustes !== undefined ? r.ajustes : cfg.lineas.ajustes,
    idioma: cfg.idioma || "es",
  };
};

/** Diálogo con varias voces en una sola llamada (Text to Dialogue · eleven_v3) */
export const dialogo = (inputs, { modelo, estabilidad }) =>
  apiPost(`/v1/text-to-dialogue/with-timestamps?output_format=mp3_44100_128`, {
    inputs,
    model_id: modelo,
    ...(typeof estabilidad === "number" ? { settings: { stability: estabilidad } } : {}),
  });
