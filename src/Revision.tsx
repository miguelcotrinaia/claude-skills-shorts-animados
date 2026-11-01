import React from "react";
import { AbsoluteFill, Freeze, type CalculateMetadataFunction } from "remotion";
import { Short } from "./engine/Short";
import { buildTimeline } from "./engine/timeline";
import type { Timeline, VideoSpec } from "./engine/types";
import { VIDEOS } from "./videos";
import { FPS, H, W } from "./theme";
import { NOMBRES } from "./perfiles";
import { ensureFonts } from "./fonts";

ensureFonts();

// Hoja de revisión: una toma por línea del diálogo, todas en una sola imagen pequeña.
// La usa "npm run revisar -- <id>" para que Claude revise el video completo mirando UNA imagen
// (menos tokens que mirar una imagen por línea).

const ESCALA = 0.25;
const CW = W * ESCALA;
const CH = H * ESCALA;
const PIE = 46;
const GAP = 12;
const COLS = 5;

export type RevisionProps = { id: string; spec?: VideoSpec; timeline?: Timeline; tomas?: { f: number; txt: string }[] };

export const calcularRevision: CalculateMetadataFunction<RevisionProps> = async ({ props }) => {
  const spec = VIDEOS.find((v) => v.id === props.id) ?? VIDEOS[0];
  const timeline = await buildTimeline(spec, FPS);
  const toF = (ms: number) => Math.round((ms / 1000) * FPS);
  const tomas = timeline.lineas.map((l) => ({
    f: Math.min(timeline.durationInFrames - 1, toF(l.startMs + (l.endMs - l.startMs) * 0.6)),
    txt: `${l.idx + 1} · esc ${l.escena + 1} · ${l.quien === "extra" ? l.extra ?? "extra" : NOMBRES[l.quien]}: ${l.linea.texto}`,
  }));
  const filas = Math.max(1, Math.ceil(tomas.length / COLS));
  return {
    durationInFrames: timeline.durationInFrames,
    width: Math.round(COLS * CW + (COLS + 1) * GAP),
    height: Math.round(filas * (CH + PIE) + (filas + 1) * GAP),
    props: { ...props, spec, timeline, tomas },
  };
};

export const Revision: React.FC<RevisionProps> = ({ spec, timeline, tomas = [] }) => {
  if (!spec || !timeline) return null;
  return (
    <AbsoluteFill style={{ background: "#1E1E1E" }}>
      {tomas.map((t, k) => {
        const col = k % COLS;
        const fila = Math.floor(k / COLS);
        return (
          <div key={k} style={{ position: "absolute", left: GAP + col * (CW + GAP), top: GAP + fila * (CH + PIE + GAP), width: CW }}>
            <div style={{ position: "relative", width: CW, height: CH, overflow: "hidden", borderRadius: 6 }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${ESCALA})`, transformOrigin: "0 0" }}>
                <Freeze frame={t.f}>
                  <Short spec={spec} timeline={timeline} />
                </Freeze>
              </div>
            </div>
            <div style={{ height: PIE, marginTop: 3, color: "#DDD", fontFamily: "monospace", fontSize: 12, lineHeight: 1.25, overflow: "hidden" }}>{t.txt}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
