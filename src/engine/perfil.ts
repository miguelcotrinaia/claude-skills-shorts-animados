import React from "react";
import { color } from "../theme";
import { animCfg } from "../lib/anim";
import { CANAL, type EstiloVisual, type PlataformaCfg } from "../perfiles";

// ─────────────────────────────────────────────────────────────
// Perfiles por plataforma. Colores y estilo salen de perfiles/canal.json.
// Hay dos estilos de animación:
//   agil  → subtítulos grandes en mayúsculas, golpe de zoom entre escenas, aviso "+ Sígueme", cierre con pregunta
//   clase → subtítulos medianos subrayados, transiciones suaves, contador "03/07", cierre con enlace
// ─────────────────────────────────────────────────────────────

export type Canal = "tiktok" | "youtube";

export type Perfil = {
  canal: Canal;
  estilo: EstiloVisual;
  paleta: {
    acento: string;
    acento2: string;
    alerta: string;
    fondo: string;
    fondoProfundo: string;
    grid: string;
    piso: string;
    lineaPiso: string;
    borde: string;
    panel: string;
    gridFino: string;
    acentoSuave: string;
    texto: string;
    apagado: string;
    tinta: string;
  };
  /** Multiplica la duración estimada de cada palabra en modo preview (sin voz) */
  ritmo: number;
  subtitulos: {
    tamano: number;
    agruparMs: number; // más bajo = menos palabras por pantalla
    mayusculas: boolean;
    estilo: "pildora" | "subrayado";
  };
  titulo: { tamano: number };
  movimiento: {
    rebote: number; // damping de los resortes (más bajo = más rebote)
    golpeEntrada: boolean; // zoom + destello al cambiar de escena
    sacudida: boolean; // sacudida en el dato sorpresa
  };
  capitulos: boolean; // "3/7" junto a la serie
  recordatorioSigueme: boolean; // aviso "+ Sígueme" a mitad del video
  cierre: { curso: boolean; pregunta: boolean };
};

type Preset = Omit<Perfil, "canal" | "estilo" | "paleta">;

const PRESETS: Record<EstiloVisual, Preset> = {
  agil: {
    ritmo: 0.88,
    subtitulos: { tamano: 76, agruparMs: 650, mayusculas: true, estilo: "pildora" },
    titulo: { tamano: 88 },
    movimiento: { rebote: 10, golpeEntrada: true, sacudida: true },
    capitulos: false,
    recordatorioSigueme: true,
    cierre: { curso: false, pregunta: true },
  },
  clase: {
    ritmo: 1.08,
    subtitulos: { tamano: 58, agruparMs: 1700, mayusculas: false, estilo: "subrayado" },
    titulo: { tamano: 76 },
    movimiento: { rebote: 18, golpeEntrada: false, sacudida: false },
    capitulos: true,
    recordatorioSigueme: false,
    cierre: { curso: true, pregunta: false },
  },
};

// ── utilidades de color ──────────────────────────────────────
const hex = (h: string) => {
  const s = h.replace("#", "");
  const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s.slice(0, 6);
  const n = parseInt(f, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (rgb: number[]) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
/** Mezcla a → b (t = 0..1) */
export const mezclar = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
};
export const rgba = (h: string, a: number) => {
  const [r, g, b] = hex(h);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const paletaDe = (p: PlataformaCfg): Perfil["paleta"] => {
  const fondo = p.fondo || "#0E1116";
  const texto = "#EEF0F4";
  return {
    acento: p.acento,
    acento2: p.acento2,
    alerta: p.alerta || "#FF6B5C",
    fondo,
    fondoProfundo: mezclar(fondo, "#000000", 0.4),
    grid: rgba(p.acento, 0.045),
    piso: mezclar(mezclar(fondo, "#FFFFFF", 0.03), p.acento, 0.04),
    lineaPiso: rgba(p.acento, 0.22),
    borde: rgba(p.acento, 0.28),
    panel: mezclar(mezclar(fondo, "#FFFFFF", 0.04), p.acento, 0.05),
    gridFino: rgba(p.acento, 0.022),
    acentoSuave: rgba(p.acento, 0.15),
    texto,
    apagado: mezclar(texto, fondo, 0.42),
    tinta: mezclar(fondo, "#000000", 0.25),
  };
};

const armar = (canal: Canal): Perfil => {
  const cfg = CANAL.plataformas[canal];
  const estilo: EstiloVisual = cfg.estilo === "agil" ? "agil" : "clase";
  return { canal, estilo, paleta: paletaDe(cfg), ...PRESETS[estilo] };
};

export const PERFILES: Record<Canal, Perfil> = {
  tiktok: armar("tiktok"),
  youtube: armar("youtube"),
};

export const perfilDe = (canal?: Canal) => PERFILES[canal ?? "youtube"];

export const PerfilContext = React.createContext<Perfil>(PERFILES.youtube);
export const usePerfil = () => React.useContext(PerfilContext);

/**
 * Aplica la paleta del perfil al tema compartido. Se llama al inicio de cada
 * render de un video (cada render dibuja un solo video a la vez).
 */
export const aplicarPerfil = (p: Perfil) => {
  const c = p.paleta;
  color.lime = c.acento;
  color.teal = c.acento2;
  color.coral = c.alerta;
  color.gridFine = c.gridFino;
  color.accentSoft = c.acentoSuave;
  color.bg = c.fondo;
  color.bgDeep = c.fondoProfundo;
  color.grid = c.grid;
  color.floor = c.piso;
  color.floorLine = c.lineaPiso;
  color.panelEdge = c.borde;
  color.panel = c.panel;
  color.text = c.texto;
  color.muted = c.apagado;
  color.dim = rgba(c.texto, 0.32);
  color.ink = c.tinta;
  animCfg.damping = p.movimiento.rebote;
};
