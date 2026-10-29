import personajesJson from "../perfiles/personajes.json";
import canalJson from "../perfiles/canal.json";
import type { HumanLook } from "./characters/Human";

// ─────────────────────────────────────────────────────────────
// Perfiles editables (carpeta perfiles/). El video NO tiene datos fijos:
// personajes, @usuario, colores y textos de cierre salen de aquí.
//   perfiles/personajes.json → elenco (los crea/edita /personajes)
//   perfiles/canal.json      → identidad del canal (la edita /nuevo-video editorial)
// ─────────────────────────────────────────────────────────────

export type TipoSecundario = "robot" | "foco" | "humano";
export type BaseRobot = "orugas" | "ruedas" | "flotante";

export type PerfilPersonajes = {
  plantilla?: boolean;
  principal: {
    nombre: string;
    rol?: string;
    personalidad?: string;
    look: HumanLook;
    /** Cambios sobre `look` para el vestuario alterno (ej. otro color o prenda) */
    lookAlterno?: Partial<HumanLook>;
  };
  secundario: {
    nombre: string;
    tipo: TipoSecundario;
    rol?: string;
    personalidad?: string;
    /** robot y foco: color del cuerpo y de la luz (ojos, antena, brillo) */
    colores?: { cuerpo?: string; luz?: string; base?: BaseRobot };
    /** solo si tipo = "humano" */
    look?: HumanLook;
  };
  extras: Record<string, HumanLook>;
  miniBots?: string[];
};

export type EstiloVisual = "agil" | "clase";

export type PlataformaCfg = {
  /** agil = subtítulos grandes, golpes de zoom, cierre con pregunta · clase = subtítulos medianos, transiciones suaves, cierre con enlace */
  estilo: EstiloVisual;
  acento: string;
  acento2: string;
  alerta?: string;
  fondo?: string;
};

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
  plataformas: { tiktok: PlataformaCfg; youtube: PlataformaCfg };
};

export const PERSONAJES = personajesJson as unknown as PerfilPersonajes;
export const CANAL = canalJson as unknown as PerfilCanal;

export const IDIOMA = CANAL.idioma || "es-PE";
export const HANDLE = CANAL.handle;
export const REDES = CANAL.redes ?? [];
export const CIERRE = {
  titulo: CANAL.cierre?.titulo ?? "SÍGUEME EN TODAS LAS REDES",
  recordatorio: CANAL.cierre?.recordatorio ?? "+ Sígueme",
  cursoPorDefecto: CANAL.cierre?.cursoPorDefecto ?? "Más en el video relacionado",
};
