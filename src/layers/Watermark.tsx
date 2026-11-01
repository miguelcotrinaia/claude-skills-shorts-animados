import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Human } from "../characters/Human";
import { Secundario, CAJA_CARA_SECUNDARIO } from "../characters/Secundario";
import { PERSONAS, PRINCIPAL } from "../characters/cast";
import { color, font, layout } from "../theme";
import { clamp01, pop } from "../lib/anim";
import type { Rol } from "../engine/types";
import { CIERRE, EXTRA_POR_DEFECTO, HANDLE as HANDLE_CANAL, REDES as REDES_CANAL } from "../perfiles";

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

/** Cara de quien habla (subtítulos): principal, secundario, un extra o el micrófono de la voz en off */
export const Avatar: React.FC<{ quien: Rol; extra?: string; size: number; frame: number; borde: string; hablando?: boolean }> = ({
  quien,
  extra,
  size,
  frame,
  borde,
  hablando,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      overflow: "hidden",
      background: color.panel,
      border: `4px solid ${borde}`,
      flexShrink: 0,
      boxShadow: `0 5px 0 ${color.sombra}`,
    }}
  >
    {quien === "principal" && (
      <svg width={size} height={size} viewBox="-72 -222 150 150">
        <Human look={PRINCIPAL} expression="feliz" frame={frame} speaking={hablando} />
      </svg>
    )}
    {quien === "extra" && (
      <svg width={size} height={size} viewBox="-72 -222 150 150">
        <Human look={PERSONAS[extra ?? EXTRA_POR_DEFECTO] ?? Object.values(PERSONAS)[0] ?? PRINCIPAL} expression="neutral" frame={frame} speaking={hablando} seed={3} />
      </svg>
    )}
    {quien === "secundario" && (
      <svg width={size} height={size} viewBox={CAJA_CARA_SECUNDARIO}>
        <Secundario frame={frame} expression="feliz" speaking={hablando} />
      </svg>
    )}
    {quien === "narrador" && (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <rect x={38} y={18} width={24} height={40} rx={12} fill={borde} />
        <path d="M28 46 a22 22 0 0 0 44 0" fill="none" stroke={borde} strokeWidth={6} />
        <rect x={47} y={68} width={6} height={12} fill={borde} />
        <rect x={36} y={80} width={28} height={6} rx={3} fill={borde} />
      </svg>
    )}
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
          background: color.panel,
          border: `2px solid ${color.panelEdge}`,
          boxShadow: `0 4px 0 ${color.sombra}`,
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
        top: 112,
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
          boxShadow: `0 8px 0 ${color.sombra}`,
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
