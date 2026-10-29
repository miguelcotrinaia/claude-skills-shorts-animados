import React from "react";
import type { Caption } from "@remotion/captions";

export type SpeakCtx = { captions: Caption[]; fps: number };
export const SpeakContext = React.createContext<SpeakCtx>({ captions: [], fps: 30 });

/** ¿Hay voz sonando en este frame (absoluto)? */
export const isVoiceActive = (captions: Caption[], absFrame: number, fps: number) => {
  const t = (absFrame / fps) * 1000;
  // búsqueda lineal suficiente para shorts (< 300 palabras)
  for (const c of captions) {
    if (t >= c.startMs - 30 && t <= c.endMs + 40) return true;
    if (c.startMs > t) break;
  }
  return false;
};
