import React from "react";
import { animCfg } from "../lib/anim";
import { CANAL, type EstiloVisual } from "../perfiles";

// ─────────────────────────────────────────────────────────────
// Personalidad de cada plataforma. Los COLORES los pone el fondo del video;
// aquí se define ritmo, subtítulos, cámara y gestos. Cada plataforma usa el estilo de perfiles/canal.json:
//   agil  → cortes, zoom marcado, subtítulos grandes, aviso "+ Sígueme", cierre con pregunta
//   clase → cámara suave, frases completas, contador "03/07", cierre con tarjeta "Más en el próximo video"
// La duración, las palabras y la estructura del guion están en perfiles/linea-editorial.md.
// ─────────────────────────────────────────────────────────────

export type Canal = "tiktok" | "youtube";

export type Perfil = {
  canal: Canal;
  estilo: EstiloVisual;
  /** Multiplica la duración estimada de cada palabra en modo preview (sin voz) */
  ritmo: number;
  subtitulos: {
    tamano: number;
    palabras: number; // máximo de palabras por pantalla
    mayusculas: boolean;
    estilo: "pildora" | "subrayado";
  };
  titulo: { tamano: number };
  movimiento: {
    rebote: number; // damping de los resortes (más bajo = más rebote)
    golpeEntrada: boolean; // destello + golpe de zoom al cambiar de escena
    sacudida: boolean; // sacudida en el dato sorpresa
    saltitos: boolean; // pequeño salto al empezar a hablar
    asiente: boolean; // quien escucha asiente a mitad de la frase del otro
  };
  camara: {
    zoomHablante: number;
    zoomObjeto: number;
    transicion: number; // frames para moverse entre tomas dentro de una escena
    empuje: number; // acercamiento lento durante cada toma (0.04 = 4 %)
  };
  capitulos: boolean; // "3/7" junto a la serie
  recordatorioSigueme: boolean; // aviso "+ Sígueme" a mitad del video
  cierre: { curso: boolean; pregunta: boolean };
};

type Preset = Omit<Perfil, "canal" | "estilo">;

const PRESETS: Record<EstiloVisual, Preset> = {
  agil: {
    ritmo: 0.9,
    subtitulos: { tamano: 74, palabras: 3, mayusculas: true, estilo: "pildora" },
    titulo: { tamano: 86 },
    movimiento: { rebote: 10, golpeEntrada: true, sacudida: true, saltitos: true, asiente: false },
    camara: { zoomHablante: 1.32, zoomObjeto: 1.3, transicion: 7, empuje: 0.05 },
    capitulos: false,
    recordatorioSigueme: true,
    cierre: { curso: false, pregunta: true },
  },
  clase: {
    ritmo: 1.06,
    subtitulos: { tamano: 56, palabras: 6, mayusculas: false, estilo: "subrayado" },
    titulo: { tamano: 74 },
    movimiento: { rebote: 18, golpeEntrada: false, sacudida: false, saltitos: false, asiente: true },
    camara: { zoomHablante: 1.16, zoomObjeto: 1.18, transicion: 22, empuje: 0.035 },
    capitulos: true,
    recordatorioSigueme: false,
    cierre: { curso: true, pregunta: false },
  },
};

const armar = (canal: Canal): Perfil => {
  const estilo: EstiloVisual = CANAL.plataformas?.[canal]?.estilo === "agil" ? "agil" : "clase";
  return { canal, estilo, ...PRESETS[estilo] };
};

export const PERFILES: Record<Canal, Perfil> = { tiktok: armar("tiktok"), youtube: armar("youtube") };

export const perfilDe = (canal?: Canal) => PERFILES[canal ?? "youtube"];

export const PerfilContext = React.createContext<Perfil>(PERFILES.youtube);
export const usePerfil = () => React.useContext(PerfilContext);

/** Ajusta el movimiento compartido al perfil (cada render dibuja un solo video a la vez). */
export const aplicarPerfil = (p: Perfil) => {
  animCfg.damping = p.movimiento.rebote;
};
