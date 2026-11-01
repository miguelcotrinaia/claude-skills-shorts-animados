import type { Arms, Expression } from "../characters/Human";
import type { SecArms, SecExpression } from "../characters/Secundario";
import type { AmbienteId } from "./ambientes";

// ─────────────────────────────────────────────────────────────
// Formato de un video. Cada video es un archivo en src/videos/.
// Cada escena tiene un DIÁLOGO: quién habla y qué dice. Cada personaje habla con su propia voz
// (perfiles/personajes.json). Los personajes se nombran por su ROL; sus nombres están en el perfil.
// ─────────────────────────────────────────────────────────────

/** Quién habla: voz en off, personaje principal, secundario o un extra */
export type Rol = "narrador" | "principal" | "secundario" | "extra";

export type Gesto =
  | "explicar"
  | "senalar"
  | "senalar-arriba"
  | "asentir"
  | "negar"
  | "encoger"
  | "pensar"
  | "celebrar"
  | "saltar"
  | "facepalm"
  | "saludo"
  | "quieto";

export type Linea = {
  quien: Rol;
  /** Lo que dice (es también el subtítulo). Voz en off: datos, contexto o transiciones. */
  texto: string;
  /** Si quien = "extra": qué extra (los nombres de "extras" en perfiles/personajes.json) */
  extra?: string;
  /** Expresión de quien habla (por defecto se elige sola) */
  cara?: Expression | SecExpression;
  /** Gesto de quien habla (por defecto se elige solo) */
  gesto?: Gesto;
  /** Tono para la voz (solo modo diálogo con eleven_v3), en inglés: "laughs", "whispers", "excited"… Úsalo poco. */
  tono?: string;
  /** Quien habla camina hacia… durante esta línea */
  ir?: "objeto" | "centro" | "izq" | "der";
  /** El objeto de la escena brilla mientras se dice esta línea */
  resalta?: boolean;
};

/** Distribución de personajes y objeto en pantalla */
export type Encuadre = "duo" | "invertido" | "solo-principal" | "solo-secundario" | "pequenos" | "pantalla" | "trio";

/** Movimiento de cámara. "auto" decide según quién habla y qué se explica. */
export type Camara = "auto" | "general" | "hablante" | "objeto" | "paneo" | "empuje";

export type PosePrincipal = { expresion?: Expression; brazos?: Arms; vestuario?: "principal" | "alterno" };
export type PoseSecundario = { expresion?: SecExpression; brazos?: SecArms };

/** acento = color principal del fondo · acento2 = secundario · alerta = costos, errores, peligro */
export type ColorEscena = "acento" | "acento2" | "alerta";

/** Elemento que aparece cuando se dice su palabra clave */
export type Revelable = { texto: string; aparece?: string };
type ItemTexto = string | Revelable;

export type Icono = "doc" | "db" | "nube" | "chip" | "usuario" | "servidor" | "robot" | "app" | "candado" | "lupa" | "alerta" | "check";

export type PropCentro =
  | { tipo: "recibo"; titulo?: string; lineas: string[]; total: string }
  | { tipo: "chat"; mensajes: string[] }
  | { tipo: "laptop"; lineas: string[]; etiqueta?: string }
  | { tipo: "monedas"; etiqueta?: string; simbolo?: string }
  | { tipo: "documentos"; etiqueta?: string }
  | { tipo: "icono"; texto: string; sub?: string }
  | { tipo: "objeto"; icono: Icono; etiqueta?: string };

type Base = {
  /** Título grande. La parte importante entre *asteriscos*. */
  titulo: string;
  /** "grande" (por defecto), "etiqueta" (pequeño, deja más espacio) u "oculto" */
  tituloModo?: "grande" | "etiqueta" | "oculto";
  /** Diálogo de la escena, en orden. 1–3 líneas normalmente. */
  dialogo: Linea[];
  /** Distribución en pantalla (si no se indica, se elige sola y varía entre escenas) */
  encuadre?: Encuadre;
  camara?: Camara;
  /** Extra presente en la escena (si habla, se pone solo) */
  extra?: string;
  /** Poses base (las líneas las animan encima) o false para ocultar */
  principal?: PosePrincipal | false;
  secundario?: PoseSecundario | false;
  globo?: { quien: "principal" | "secundario"; texto: string };
  inicioMs?: number;
};

export type Escena =
  | (Base & { tipo: "duo"; prop?: PropCentro })
  | (Base & {
      tipo: "contador";
      etiqueta: string;
      desde?: number;
      hasta: number;
      prefijo?: string;
      sufijo?: string;
      color?: ColorEscena;
      /** Palabra que dispara el conteo (por defecto, la primera palabra con un número) */
      aparece?: string;
    })
  | (Base & { tipo: "pila"; items: string[]; etiqueta?: string })
  | (Base & {
      tipo: "multitud";
      cantidad?: number;
      etiqueta: string;
      con?: "bots" | "personas";
      /** Extras concretos; con 5 o menos salen grandes en una fila */
      quienes?: string[];
      /** Saludan con la mano al aparecer */
      saludan?: boolean;
    })
  | (Base & { tipo: "pasos"; pasos: ItemTexto[] })
  | (Base & { tipo: "terminal"; lineas: string[]; etiqueta?: string })
  | (Base & { tipo: "cita"; fuente: string; texto: string; pie?: string })
  | (Base & { tipo: "comparar"; items: { etiqueta: string; valor: number; nota?: string; color?: ColorEscena; aparece?: string }[] })
  | (Base & {
      tipo: "diagrama";
      nodos: { id: string; texto: string; icono?: Icono; aparece?: string }[];
      /** Si no se indican, se conectan en orden */
      flechas?: { de: string; a: string; texto?: string; aparece?: string }[];
      direccion?: "vertical" | "horizontal";
      /** Un dato viaja por las flechas al final */
      flujo?: boolean;
    })
  | (Base & { tipo: "pizarra"; encabezado?: string; lineas: ItemTexto[] })
  | (Base & { tipo: "linea"; eventos: { fecha: string; texto: string; aparece?: string }[] })
  | (Base & { tipo: "cta"; llamada?: string; pregunta?: string; curso?: string })
  /** La duda del público en grande (normalmente la dice el secundario) */
  | (Base & { tipo: "pregunta"; pregunta: string; de?: "secundario" | "extra" | "publico" })
  /** Tabla comparativa que se llena fila a fila; con `previas` las primeras filas ya están llenas */
  | (Base & {
      tipo: "tabla";
      columnas: string[];
      filas: { celdas: string[]; aparece?: string }[];
      previas?: number;
      encabezado?: string;
    })
  /** Resumen: lista que se marca a medida que se dice */
  | (Base & { tipo: "resumen"; encabezado?: string; puntos: ItemTexto[] });

export type VideoSpec = {
  id: string;
  canal: "tiktok" | "youtube";
  /** Fondo del video. Si no se indica, se elige según la rotación de su plataforma. */
  ambiente?: AmbienteId;
  /** Texto pequeño arriba (serie): "<TEMA> · <LEMA>" */
  serie: string;
  /** Palabras que se pintan en color de acento en los subtítulos */
  resaltar?: string[];
  /** Música de fondo opcional (public/music/...) */
  musica?: string;
  volumenMusica?: number;
  escenas: Escena[];
};

/** Palabra con tiempos y quién la dice (formato de public/captions/<id>.json) */
export type Palabra = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
  quien: Rol;
  linea: number;
};

export type LineaT = {
  idx: number;
  escena: number;
  quien: Rol;
  extra?: string;
  startMs: number;
  endMs: number;
  linea: Linea;
};

export type SceneTiming = { from: number; duration: number };

export type Timeline = {
  scenes: SceneTiming[];
  palabras: Palabra[];
  lineas: LineaT[];
  encuadres: Encuadre[];
  durationInFrames: number;
  audio: string | null;
  musica: string | null;
  preview: boolean;
  /** Los subtítulos guardados no calzan con el guion actual (correr npm run subtitulos) */
  desfase?: boolean;
};

export type ShortProps = { spec: VideoSpec; timeline?: Timeline };
