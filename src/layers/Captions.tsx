import React, { useMemo } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { color, font, layout } from "../theme";
import { normalize } from "../engine/timeline";
import { usePerfil } from "../engine/perfil";
import { textoSobre } from "../engine/ambientes";
import type { LineaT, Palabra, Rol } from "../engine/types";
import { Avatar } from "./Watermark";
import { IDIOMA } from "../perfiles";

// Subtítulos v2: cada pantalla es de UN solo hablante, con su cara y su color.
// Estilo ágil: pocas palabras, grandes, en mayúsculas, palabra activa en "píldora" del color de quien habla.
// Estilo clase: frase corta, tamaño medio, palabra activa subrayada. La voz en off va en cursiva.

const colorDe = (rol: Rol) =>
  rol === "principal" ? color.vozPrincipal : rol === "secundario" ? color.vozSecundario : rol === "extra" ? color.vozExtra : color.vozNarrador;

type Pagina = { quien: Rol; extra?: string; startMs: number; endMs: number; tokens: Palabra[] };

export const paginar = (palabras: Palabra[], lineas: LineaT[], max: number): Pagina[] => {
  // 1) Frases: se corta en cambio de línea, en punto/interrogación/exclamación y en pausas largas
  const frases: Palabra[][] = [];
  let cur: Palabra[] = [];
  palabras.forEach((p, i) => {
    cur.push(p);
    const sig = palabras[i + 1];
    const fuerte = /[.?!…:]["”)]?$/.test(p.text.trim());
    if (!sig || sig.linea !== p.linea || fuerte || sig.startMs - p.endMs > 650) {
      frases.push(cur);
      cur = [];
    }
  });
  // 2) Cada frase en pantallas parejas (7 palabras con máx. 3 → 3 + 2 + 2, no 3 + 3 + 1)
  const out: Pagina[] = [];
  frases.forEach((f) => {
    const n = Math.ceil(f.length / max);
    let k = 0;
    for (let j = 0; j < n; j++) {
      const t = Math.ceil((f.length - k) / (n - j));
      const tokens = f.slice(k, k + t);
      k += t;
      out.push({
        quien: tokens[0].quien,
        extra: lineas[tokens[0].linea]?.extra,
        startMs: tokens[0].startMs,
        endMs: tokens[tokens.length - 1].endMs,
        tokens,
      });
    }
  });
  return out;
};

export const Captions: React.FC<{ palabras: Palabra[]; lineas: LineaT[]; resaltar?: string[] }> = ({ palabras, lineas, resaltar = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const perfil = usePerfil();
  const cfg = perfil.subtitulos;
  const t = (frame / fps) * 1000;
  const keys = useMemo(() => new Set(resaltar.map(normalize)), [resaltar]);
  const pages = useMemo(() => paginar(palabras, lineas, cfg.palabras), [palabras, lineas, cfg.palabras]);
  const idx = pages.findIndex((p, i) => {
    const next = pages[i + 1];
    const end = next && next.startMs - p.endMs < 450 ? next.startMs : p.endMs + 500;
    return t >= p.startMs - 40 && t < end;
  });
  if (idx < 0) return null;
  const page = pages[idx];
  const prevPage = pages[idx - 1];
  const local = Math.round(((t - page.startMs + 40) / 1000) * fps);
  // Animación de entrada solo cuando cambia de hablante o tras una pausa; si sigue el mismo, cambio rápido
  const continua = prevPage && prevPage.quien === page.quien && page.startMs - prevPage.endMs < 450;
  const enter = continua ? 1 : spring({ frame: local, fps, config: { damping: perfil.movimiento.rebote + 2, stiffness: 220 } });
  const pill = cfg.estilo === "pildora";
  const c = colorDe(page.quien);
  const narrador = page.quien === "narrador";
  const hablando = page.tokens.some((tok) => t >= tok.startMs && t < tok.endMs);
  const avatar = pill ? 78 : 64;

  return (
    <div
      style={{
        position: "absolute",
        top: layout.captionsY,
        left: 40,
        right: 40,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        transform: `scale(${(pill ? 0.86 : 0.96) + (pill ? 0.14 : 0.04) * enter})`,
        opacity: enter,
      }}
    >
      <Avatar quien={page.quien} extra={page.extra} size={avatar} frame={frame} borde={c === color.vozNarrador ? color.muted : c} hablando={hablando} />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: pill ? "4px 6px" : "2px 14px",
          maxWidth: 1000 - avatar - 16 - 40,
        }}
      >
        {page.tokens.map((tok, i) => {
          const active = t >= tok.startMs && t < tok.endMs;
          const past = t >= tok.endMs;
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
                  fontStyle: narrador ? "italic" : "normal",
                  fontSize: cfg.tamano * (key ? 1.06 : 1),
                  lineHeight: 1.12,
                  padding: "2px 14px 6px",
                  borderRadius: 14,
                  color: active ? textoSobre(narrador ? color.text : c) : key ? color.lime : past ? color.text : color.dim,
                  background: active ? (narrador ? color.text : c) : "transparent",
                  transform: active ? `translateY(-4px) rotate(${key ? -3 : -2}deg) scale(${key ? 1.12 : 1.06})` : "none",
                  textShadow: active ? "none" : `0 4px 0 ${color.textShadow}`,
                  boxShadow: active ? `0 6px 0 ${color.sombra}` : "none",
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
                fontStyle: narrador ? "italic" : "normal",
                fontSize: cfg.tamano,
                lineHeight: 1.25,
                color: key ? (narrador ? color.lime : c) : active ? color.text : past ? color.text : color.dim,
                borderBottom: `5px solid ${active ? (narrador ? color.muted : c) : "transparent"}`,
                paddingBottom: 2,
                textShadow: `0 3px 0 ${color.textShadow}`,
              }}
            >
              {txt}
            </span>
          );
        })}
      </div>
    </div>
  );
};
