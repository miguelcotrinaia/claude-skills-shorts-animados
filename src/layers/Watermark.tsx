import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Human } from "../characters/Human";
import { PRINCIPAL } from "../characters/cast";
import { color, font, layout } from "../theme";
import { clamp01, pop } from "../lib/anim";
import { CIERRE, HANDLE as HANDLE_CANAL, REDES as REDES_CANAL } from "../perfiles";

// El @usuario y las redes salen de perfiles/canal.json
export const HANDLE = HANDLE_CANAL;
export const REDES = REDES_CANAL;

/** Cabecita voxel del personaje principal en un círculo */
export const MiniCara: React.FC<{ size: number; frame: number; borde?: string }> = ({ size, frame, borde = color.panelEdge }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", background: color.panel, border: `3px solid ${borde}`, flexShrink: 0 }}>
    <svg width={size} height={size} viewBox="-72 -222 150 150">
      <Human look={PRINCIPAL} expression="confiado" frame={frame} />
    </svg>
  </div>
);

/** Pastilla fija con el @usuario del canal, sobre el piso y encima de los subtítulos (zona segura). */
export const Watermark: React.FC<{ ocultar?: boolean }> = ({ ocultar }) => {
  const frame = useCurrentFrame();
  if (ocultar) return null;
  return (
    <div style={{ position: "absolute", top: layout.handleY, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "6px 22px 6px 8px",
          borderRadius: 40,
          background: "rgba(0,0,0,0.38)",
          border: `2px solid ${color.panelEdge}`,
        }}
      >
        <MiniCara size={44} frame={frame} />
        <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 28, color: color.text, letterSpacing: 1 }}>{HANDLE}</div>
      </div>
    </div>
  );
};

/** Aviso "+ Sígueme" a mitad del video (estilo ágil) */
export const Recordatorio: React.FC<{ desde: number; dur?: number }> = ({ desde, dur = 66 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - desde;
  if (local < 0 || local > dur) return null;
  const inn = pop(local, fps, 0, 220);
  const out = interpolate(local, [dur - 8, dur], [1, 0], clamp01);
  return (
    <div
      style={{
        position: "absolute",
        top: 448,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: out,
        transform: `translateY(${(1 - inn) * -40}px) scale(${0.7 + 0.3 * inn})`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 28px 10px 12px",
          borderRadius: 40,
          background: color.lime,
          boxShadow: "0 8px 0 rgba(0,0,0,0.35)",
        }}
      >
        <MiniCara size={52} frame={frame} borde={color.ink} />
        <div style={{ fontFamily: font.title, fontWeight: 800, fontSize: 38, color: color.ink }}>
          {CIERRE.recordatorio} {HANDLE}
        </div>
      </div>
    </div>
  );
};
