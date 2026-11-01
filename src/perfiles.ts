import personajesJson from "../perfiles/personajes.json";
import canalJson from "../perfiles/canal.json";
import type { HumanLook } from "./characters/Human";

// ─────────────────────────────────────────────────────────────
// Perfiles editables (carpeta perfiles/). El video NO tiene datos fijos:
// personajes, voces, @usuario, fondos y textos de cierre salen de aquí.
//   perfiles/personajes.json → elenco y voz de cada personaje (los crea/edita /personajes)
//   perfiles/canal.json      → identidad del canal y fondos (la edita /nuevo-video editorial)
// ─────────────────────────────────────────────────────────────

/** Voz de ElevenLabs de un personaje. `modelo` y `ajustes` son opcionales (los guarda "voces --elegir"). */
export type Voz = { voiceId: string; nombre?: string; modelo?: string; ajustes?: Record<string, unknown> | "voz" | null };

export type TipoSecundario = "robot" | "foco" | "panda" | "humano";
export type BaseRobot = "orugas" | "ruedas" | "flotante";

/** Un extra es una persona (mismo formato que el principal) y puede tener su propia voz */
export type Extra = HumanLook & { voz?: Voz };

export type PerfilPersonajes = {
  plantilla?: boolean;
  /** La voz en off (narrador): no aparece en pantalla */
  narrador?: { nombre?: string; voz?: Voz };
  principal: {
    nombre: string;
    rol?: string;
    personalidad?: string;
    look: HumanLook;
    /** Cambios sobre `look` para el vestuario alterno (ej. otro color o prenda) */
    lookAlterno?: Partial<HumanLook>;
    voz?: Voz;
  };
  secundario: {
    nombre: string;
    tipo: TipoSecundario;
    rol?: string;
    personalidad?: string;
    /** robot, foco y panda: color del cuerpo y de la luz (ojos, antena, brillo; en el panda, la bufanda) */
    colores?: { cuerpo?: string; luz?: string; base?: BaseRobot; manchas?: string };
    /** solo si tipo = "humano" */
    look?: HumanLook;
    voz?: Voz;
  };
  extras: Record<string, Extra>;
  /** Voz de los extras que no tienen una propia */
  vozExtras?: Voz;
  miniBots?: string[];
};

export type EstiloVisual = "agil" | "clase";

export type PerfilCanal = {
  plantilla?: boolean;
  nombre: string;
  handle: string;
  /** Cómo se lee el @usuario en voz alta */
  handleHablado?: string;
  /** Va después del tema en la cabecera: "<TEMA> · <LEMA>" */
  lema: string;
  idioma?: string;
  redes: string[];
  cierre?: { titulo?: string; recordatorio?: string; cursoPorDefecto?: string };
  /** agil = subtítulos grandes, golpes de cámara, cierre con pregunta · clase = movimientos suaves, cierre con tarjeta.
   *  (acento/acento2/fondo por plataforma vienen de perfiles de la v1: si no hay fondos.marca, se usan como colores de marca) */
  plataformas: {
    tiktok: { estilo: EstiloVisual; acento?: string; acento2?: string; fondo?: string };
    youtube: { estilo: EstiloVisual; acento?: string; acento2?: string; fondo?: string };
  };
  /**
   * Fondos de los videos:
   *   "rotar"   → 6 fondos claros y oscuros que rotan entre videos (por defecto)
   *   "marca"   → tus colores de marca, un fondo oscuro y uno claro que se alternan
   *   "mezclar" → los 6 fondos + los 2 de tu marca
   */
  fondos?: {
    usar?: "rotar" | "marca" | "mezclar";
    marca?: { acento: string; acento2?: string; oscuro?: string; claro?: string };
  };
};

export const PERSONAJES = personajesJson as unknown as PerfilPersonajes;
export const CANAL = canalJson as unknown as PerfilCanal;

export const IDIOMA = CANAL.idioma || "es-PE";
export const HANDLE = CANAL.handle;
export const REDES = CANAL.redes ?? [];
export const CIERRE = {
  titulo: CANAL.cierre?.titulo ?? "SÍGUEME EN TODAS LAS REDES",
  recordatorio: CANAL.cierre?.recordatorio ?? "+ Sígueme",
  cursoPorDefecto: CANAL.cierre?.cursoPorDefecto ?? "Más en el próximo video",
};

/** Nombre visible de cada rol (para etiquetas en pantalla) */
export const NOMBRES = {
  narrador: PERSONAJES.narrador?.nombre ?? "Voz en off",
  principal: PERSONAJES.principal.nombre,
  secundario: PERSONAJES.secundario.nombre,
  extra: "Extra",
};

/** Extra que se usa cuando una escena pide un extra sin decir cuál */
export const EXTRA_POR_DEFECTO = Object.keys(PERSONAJES.extras ?? {})[0] ?? "extra";
