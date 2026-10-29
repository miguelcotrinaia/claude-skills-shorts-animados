import React, { useMemo } from "react";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { color, font, layout } from "../theme";
import { normalize } from "../engine/timeline";
import { usePerfil } from "../engine/perfil";
import { IDIOMA } from "../perfiles";

// Subtítulos palabra por palabra.
// Estilo ágil: pocas palabras, grandes, en mayúsculas, palabra activa en "píldora".
// Estilo clase: frase corta, tamaño medio, palabra activa subrayada en el color de acento.

export const Captions: React.FC<{ captions: Caption[]; resaltar?: string[] }> = ({ captions, resaltar = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const perfil = usePerfil();
  const cfg = perfil.subtitulos;
  const t = (frame / fps) * 1000;
  const keys = useMemo(() => new Set(resaltar.map(normalize)), [resaltar]);
  const { pages } = useMemo(
    () => createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: cfg.agruparMs }),
    [captions, cfg.agruparMs]
  );
  const page = pages.find((p, i) => {
    const end = i < pages.length - 1 ? pages[i + 1].startMs : p.startMs + p.durationMs + 600;
    return t >= p.startMs && t < Math.min(end, p.startMs + p.durationMs + 700);
  });
  if (!page) return null;
  const local = Math.round(((t - page.startMs) / 1000) * fps);
  const enter = spring({ frame: local, fps, config: { damping: perfil.movimiento.rebote + 2, stiffness: 220 } });
  const pill = cfg.estilo === "pildora";

  return (
    <div
      style={{
        position: "absolute",
        top: layout.captionsY,
        left: layout.sidePad - 40,
        right: layout.sidePad - 40,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: pill ? "4px 6px" : "2px 14px",
        transform: `scale(${(pill ? 0.86 : 0.96) + (pill ? 0.14 : 0.04) * enter})`,
        opacity: enter,
      }}
    >
      {page.tokens.map((tok, i) => {
        const active = t >= tok.fromMs && t < tok.toMs;
        const past = t >= tok.toMs;
        const key = keys.has(normalize(tok.text));
        const raw = tok.text.trim();
        const txt = cfg.mayusculas ? raw.toLocaleUpperCase(IDIOMA) : raw;
        if (pill) {
          return (
            <span
              key={i}
              style={{
                fontFamily: font.title,
                fontWeight: 800,
                fontSize: cfg.tamano,
                lineHeight: 1.12,
                padding: "2px 14px 6px",
                borderRadius: 14,
                color: active ? color.ink : key ? color.lime : past ? color.text : color.dim,
                background: active ? (key ? color.teal : color.lime) : "transparent",
                transform: active ? "translateY(-4px) rotate(-2deg) scale(1.06)" : "none",
                textShadow: active ? "none" : "0 5px 0 rgba(0,0,0,0.5)",
                boxShadow: active ? "0 6px 0 rgba(0,0,0,0.35)" : "none",
              }}
            >
              {txt}
            </span>
          );
        }
        return (
          <span
            key={i}
            style={{
              fontFamily: font.title,
              fontWeight: 700,
              fontSize: cfg.tamano,
              lineHeight: 1.25,
              color: key || active ? color.lime : past ? color.text : color.dim,
              borderBottom: `5px solid ${active ? color.lime : "transparent"}`,
              paddingBottom: 2,
              textShadow: "0 4px 0 rgba(0,0,0,0.45)",
            }}
          >
            {txt}
          </span>
        );
      })}
    </div>
  );
};
