import React, { useContext } from "react";
import { useCurrentFrame } from "remotion";
import type { Encuadre, LineaT, Palabra, Rol } from "./types";
import type { Distribucion } from "./encuadres";
import { normalize } from "./timeline";

// ─────────────────────────────────────────────────────────────
// Contexto de la escena: tiempos de cada línea y palabra, distribución en pantalla.
// Las escenas usan estos hooks para sincronizar gestos y apariciones con la voz.
// ─────────────────────────────────────────────────────────────

export type EscenaCtx = {
  idx: number;
  absFrom: number;
  dur: number;
  fps: number;
  lineas: LineaT[]; // líneas de esta escena
  palabras: Palabra[]; // palabras de esta escena
  todas: Palabra[]; // todas las palabras del video
  dist: Distribucion;
  distPrev?: Distribucion;
  encuadre: Encuadre;
};

export const EscenaContext = React.createContext<EscenaCtx | null>(null);

export const useEscena = () => {
  const c = useContext(EscenaContext);
  if (!c) throw new Error("useEscena fuera de una escena");
  return c;
};

const msToLocal = (ms: number, ctx: EscenaCtx) => Math.round((ms / 1000) * ctx.fps) - ctx.absFrom;

/** Línea en curso (la última que empezó) y si se está diciendo ahora */
export const lineaEn = (ctx: EscenaCtx, frame: number): { linea: LineaT | null; k: number; activa: boolean; local: number } => {
  let k = -1;
  ctx.lineas.forEach((l, i) => {
    if (msToLocal(l.startMs, ctx) - 3 <= frame) k = i;
  });
  if (k < 0) return { linea: null, k: -1, activa: false, local: 0 };
  const l = ctx.lineas[k];
  const ini = msToLocal(l.startMs, ctx) - 3;
  const fin = msToLocal(l.endMs, ctx) + 8;
  return { linea: l, k, activa: frame <= fin, local: frame - ini };
};

export const useLinea = () => {
  const frame = useCurrentFrame();
  const ctx = useEscena();
  return lineaEn(ctx, frame);
};

/** ¿Este rol está pronunciando una palabra ahora? (para mover la boca) */
export const hablaEn = (ctx: EscenaCtx, frame: number, rol: Rol) => {
  const t = ((ctx.absFrom + frame) / ctx.fps) * 1000;
  for (const p of ctx.todas) {
    if (p.startMs - 30 > t) break;
    if (p.quien === rol && t >= p.startMs - 30 && t <= p.endMs + 40) return true;
  }
  return false;
};

/** Frame local de inicio y fin de cada línea de la escena */
export const tramosDeLineas = (ctx: EscenaCtx) =>
  ctx.lineas.map((l) => ({ l, ini: Math.max(0, msToLocal(l.startMs, ctx) - 3), fin: msToLocal(l.endMs, ctx) + 8 }));

/**
 * Momento (frame local) en que se dice una palabra clave dentro de la escena.
 * Si no se encuentra, usa una fracción de la duración de la escena.
 */
export const momentoDe = (ctx: EscenaCtx, clave: string | undefined, fraccion: number) => {
  const fallback = Math.round(4 + fraccion * Math.max(10, ctx.dur - 10));
  if (!clave) return fallback;
  const kw = clave.split(/\s+/).map(normalize).filter(Boolean);
  if (!kw.length) return fallback;
  const ws = ctx.palabras.map((p) => normalize(p.text));
  const igual = (w: string, k: string) => w === k || (k.length >= 4 && w.startsWith(k));
  for (let j = 0; j < ws.length; j++) {
    if (kw.every((k, i) => ws[j + i] !== undefined && igual(ws[j + i], k))) {
      return Math.max(0, msToLocal(ctx.palabras[j].startMs, ctx) - 2);
    }
  }
  return fallback;
};

/** Frame local de la primera palabra con un número (para contadores) */
export const momentoNumero = (ctx: EscenaCtx) => {
  const p = ctx.palabras.find((w) => /\d/.test(w.text));
  return p ? Math.max(0, msToLocal(p.startMs, ctx) - 2) : null;
};

/** Inicio (frame local) de la línea k de la escena */
export const inicioLinea = (ctx: EscenaCtx, k: number) => {
  const l = ctx.lineas[k];
  return l ? Math.max(0, msToLocal(l.startMs, ctx) - 3) : null;
};
