import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  getRemotionEnvironment,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../layers/Background";
import { Kicker, SceneTitle } from "../layers/Header";
import { Captions } from "../layers/Captions";
import { Recordatorio, Watermark } from "../layers/Watermark";
import { SceneRenderer } from "../scenes/Scenes";
import { SpeakContext } from "./context";
import { synthCaptions, alignScenes } from "./timeline";
import { PerfilContext, aplicarPerfil, perfilDe, type Perfil } from "./perfil";
import type { ShortProps, Timeline } from "./types";
import { ensureFonts } from "../fonts";
import { clamp01 } from "../lib/anim";
import { color, font } from "../theme";

ensureFonts();

/** Efecto de cambio de escena según el canal (TikTok: golpe de zoom + destello). */
const StageFx: React.FC<{ perfil: Perfil; first: boolean; children: React.ReactNode }> = ({ perfil, first, children }) => {
  const frame = useCurrentFrame();
  if (!perfil.movimiento.golpeEntrada || first) return <>{children}</>;
  const zoom = interpolate(frame, [0, 7], [1.07, 1], clamp01);
  const flash = interpolate(frame, [0, 3], [0.12, 0], clamp01);
  return (
    <>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 55%" }}>{children}</AbsoluteFill>
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />}
    </>
  );
};

/** Composición principal: arma un short a partir de un VideoSpec. */
export const Short: React.FC<ShortProps> = ({ spec, timeline }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const perfil = perfilDe(spec.canal);
  aplicarPerfil(perfil);

  // Respaldo por si no corrió calculateMetadata (no debería pasar)
  const tl: Timeline = useMemo(() => {
    if (timeline) return timeline;
    const caps = synthCaptions(spec.escenas, perfil.ritmo);
    const idx = alignScenes(spec.escenas, caps);
    const starts = idx.map((i, k) => (k === 0 ? 0 : Math.round((caps[i].startMs / 1000) * fps)));
    return {
      captions: caps,
      scenes: starts.map((s, i) => ({ from: s, duration: (starts[i + 1] ?? durationInFrames) - s })),
      durationInFrames,
      audio: null,
      musica: null,
      preview: true,
    };
  }, [timeline, spec, fps, durationInFrames, perfil.ritmo]);

  const total = spec.escenas.length;
  const current = Math.max(0, tl.scenes.findIndex((s) => frame >= s.from && frame < s.from + s.duration));
  const enCierre = spec.escenas[current]?.tipo === "cta";
  const recordatorioDesde = Math.round(durationInFrames * 0.42);

  return (
    <PerfilContext.Provider value={perfil}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Background />
        {tl.audio && <Audio src={staticFile(tl.audio)} />}
        {tl.musica && <Audio src={staticFile(tl.musica)} volume={spec.volumenMusica ?? 0.08} loop />}
        <SpeakContext.Provider value={{ captions: tl.captions, fps }}>
          {spec.escenas.map((e, i) => {
            const s = tl.scenes[i];
            if (!s || s.duration <= 0) return null;
            const prev = spec.escenas[i - 1];
            return (
              <Sequence key={i} from={s.from} durationInFrames={s.duration} layout="none" name={`${i + 1}. ${e.tipo}`}>
                <StageFx perfil={perfil} first={i === 0}>
                  <SceneRenderer e={e} prev={prev} dur={s.duration} absFrom={s.from} />
                </StageFx>
                <SceneTitle text={e.titulo} animate={!prev || prev.titulo !== e.titulo} />
              </Sequence>
            );
          })}
        </SpeakContext.Provider>
        <Kicker
          serie={spec.serie}
          progress={frame / Math.max(1, durationInFrames - 1)}
          capitulo={perfil.capitulos ? `${String(current + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}` : undefined}
        />
        {perfil.recordatorioSigueme && <Recordatorio desde={recordatorioDesde} />}
        <Watermark ocultar={enCierre} />
        <Captions captions={tl.captions} resaltar={spec.resaltar} />
        {tl.preview && tl.audio && getRemotionEnvironment().isStudio && (
          <div
            style={{
              position: "absolute",
              top: 64,
              right: 24,
              fontFamily: font.mono,
              fontSize: 22,
              color: "#fff",
              background: "#D7263D",
              padding: "6px 14px",
              borderRadius: 10,
            }}
          >
            VOZ SIN SINCRONIZAR · npm run sincronizar -- {spec.id}
          </div>
        )}
        {tl.preview && getRemotionEnvironment().isStudio && (
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              fontFamily: font.mono,
              fontSize: 22,
              color: color.ink,
              background: "#FFC24B",
              padding: "6px 14px",
              borderRadius: 10,
            }}
          >
            PREVIEW · {perfil.canal.toUpperCase()} · tiempos estimados (sin voz)
          </div>
        )}
      </AbsoluteFill>
    </PerfilContext.Provider>
  );
};
