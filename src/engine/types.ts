import type { Caption } from "@remotion/captions";
import type { Arms, Expression } from "../characters/Human";
import type { SecArms, SecExpression } from "../characters/Secundario";

// ─────────────────────────────────────────────────────────────
// Formato de un video. Cada video es un archivo en src/videos/.
// Los personajes se nombran por su ROL (principal / secundario); sus nombres
// y su aspecto están en perfiles/personajes.json.
// ─────────────────────────────────────────────────────────────

export type PosePrincipal = { expresion?: Expression; brazos?: Arms; vestuario?: "principal" | "alterno" } | false;
export type PoseSecundario = { expresion?: SecExpression; brazos?: SecArms } | false;

export type Quien = "principal" | "secundario";

/** acento = color principal del canal · acento2 = secundario · alerta = costos, errores, peligro */
export type ColorEscena = "acento" | "acento2" | "alerta";

export type PropCentro =
  | { tipo: "recibo"; titulo?: string; lineas: string[]; total: string }
  | { tipo: "chat"; mensajes: string[] }
  | { tipo: "laptop"; lineas: string[]; etiqueta?: string }
  | { tipo: "monedas"; simbolo?: string }
  | { tipo: "documentos"; etiqueta?: string }
  | { tipo: "icono"; texto: string; sub?: string };

type Base = {
  /** Título grande de la escena. Encierra entre *asteriscos* la parte en color de acento. */
  titulo: string;
  /** Lo que se dice en voz en off durante esta escena (guion). */
  dice: string;
  /** Quién "habla" (mueve la boca). La voz en off es una sola. Por defecto: principal. */
  habla?: Quien;
  /** Forzar inicio en milisegundos (solo si la sincronía automática falla). */
  inicioMs?: number;
  principal?: PosePrincipal;
  secundario?: PoseSecundario;
  globo?: { quien: Quien; texto: string };
};

export type Escena =
  | (Base & { tipo: "duo"; prop?: PropCentro })
  | (Base & { tipo: "contador"; etiqueta: string; desde?: number; hasta: number; prefijo?: string; sufijo?: string; color?: ColorEscena })
  | (Base & { tipo: "pila"; items: string[]; etiqueta?: string })
  | (Base & { tipo: "multitud"; cantidad?: number; etiqueta: string; con?: "bots" | "personas" })
  | (Base & { tipo: "pasos"; pasos: string[] })
  | (Base & { tipo: "terminal"; lineas: string[]; etiqueta?: string })
  | (Base & { tipo: "cita"; fuente: string; texto: string; pie?: string })
  | (Base & { tipo: "comparar"; items: { etiqueta: string; valor: number; nota?: string; color?: ColorEscena }[] })
  | (Base & {
      tipo: "cta";
      /** Línea corta bajo el @usuario (opcional) */
      llamada?: string;
      /** Estilo ágil: pregunta para comentarios que aparece en un globo */
      pregunta?: string;
      /** Estilo clase: texto del enlace al video largo / playlist */
      curso?: string;
    });

export type VideoSpec = {
  /** Plataforma: cambia ritmo, colores, subtítulos y cierre según perfiles/canal.json */
  canal?: "tiktok" | "youtube";
  /** id único: también es el nombre del audio (public/audio/<id>.mp3) y subtítulos (public/captions/<id>.json) */
  id: string;
  /** Texto pequeño arriba (serie). Ej: "CIELO AZUL · CIENCIA DE BOLSILLO" */
  serie: string;
  /** Palabras que se pintan en color de acento en los subtítulos */
  resaltar?: string[];
  /** Música de fondo opcional (public/music/...) */
  musica?: string;
  volumenMusica?: number;
  escenas: Escena[];
};

export type SceneTiming = { from: number; duration: number };

export type Timeline = {
  scenes: SceneTiming[];
  captions: Caption[];
  durationInFrames: number;
  audio: string | null;
  musica: string | null;
  preview: boolean; // true = sin voz, tiempos estimados
};

export type ShortProps = {
  spec: VideoSpec;
  timeline?: Timeline;
};
