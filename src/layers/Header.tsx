import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { color, font, layout } from "../theme";
import { clamp01, ease } from "../lib/anim";
import { usePerfil } from "../engine/perfil";

/** Convierte "Texto *acento* normal" en spans con color de acento */
export const Accented: React.FC<{ text: string; accent?: string }> = ({ text, accent = color.lime }) => {
  const parts = text.split("*");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} style={{ color: accent }}>
            {p}
          </span>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </>
  );
};

export const Kicker: React.FC<{ serie: string; progress: number; capitulo?: string }> = ({ serie, progress, capitulo }) => (
  <div style={{ position: "absolute", top: layout.kickerY - 40, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div
      style={{
        fontFamily: font.mono,
        fontWeight: 500,
        fontSize: 26,
        letterSpacing: 6,
        color: color.muted,
        textTransform: "uppercase",
        display: "flex",
        gap: 18,
        alignItems: "center",
      }}
    >
      <span>{serie}</span>
      {capitulo && (
        <span style={{ color: color.ink, background: color.lime, borderRadius: 8, padding: "2px 10px", letterSpacing: 2, fontWeight: 700 }}>{capitulo}</span>
      )}
    </div>
    <div style={{ marginTop: 14, width: 720, height: 4, background: "rgba(238,243,234,0.10)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${progress * 100}%`, height: "100%", background: color.lime, borderRadius: 4 }} />
    </div>
  </div>
);

/** Título de escena; si es igual al de la escena anterior no se re-anima. */
export const SceneTitle: React.FC<{ text: string; animate: boolean }> = ({ text, animate }) => {
  const frame = useCurrentFrame();
  const perfil = usePerfil();
  const p = animate ? ease(frame, 0, 12) : 1;
  const y = interpolate(p, [0, 1], [40, 0], clamp01);
  return (
    <div
      style={{
        position: "absolute",
        top: layout.titleY,
        left: 70,
        right: 70,
        textAlign: "center",
        fontFamily: font.title,
        fontWeight: 800,
        fontSize: perfil.titulo.tamano,
        lineHeight: 1.08,
        letterSpacing: -1.5,
        color: color.text,
        opacity: p,
        transform: `translateY(${y}px)`,
        textShadow: "0 6px 0 rgba(0,0,0,0.35)",
        textWrap: "balance" as React.CSSProperties["textWrap"],
      }}
    >
      <Accented text={text} />
    </div>
  );
};
