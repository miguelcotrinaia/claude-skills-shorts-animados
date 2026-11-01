import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, getRemotionEnvironment, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Escenario, Fondo, Vineta } from "../layers/Background";
import { Kicker, SceneTitle } from "../layers/Header";
import { Captions } from "../layers/Captions";
import { Recordatorio, Watermark } from "../layers/Watermark";
import { SceneRenderer } from "../scenes/Scenes";
import { EscenaContext, type EscenaCtx } from "./context";
import { armarTimeline } from "./timeline";
import { PerfilContext, aplicarPerfil, perfilDe } from "./perfil";
import { aplicarAmbiente, ambientePorId } from "./ambientes";
import { distribucionDe } from "./encuadres";
import { planCamara, tomaEn, transformDe } from "./camara";
import type { ShortProps, Timeline } from "./types";
import { ensureFonts } from "../fonts";
import { clamp01 } from "../lib/anim";
import { color, font, lienzo } from "../theme";

ensureFonts();

const Aviso: React.FC<{ top: number; bg: string; fg?: string; children: React.ReactNode }> = ({ top, bg, fg = "#fff", children }) => (
  <div style={{ position: "absolute", top, right: 24, fontFamily: font.mono, fontSize: 22, color: fg, background: bg, padding: "6px 14px", borderRadius: 10 }}>{children}</div>
);

/** Composición principal: arma un short a partir de un VideoSpec con diálogo. */
export const Short: React.FC<ShortProps> = ({ spec, timeline }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const perfil = perfilDe(spec.canal);
  aplicarAmbiente(spec.ambiente ?? ambientePorId(spec.id, spec.canal));
  aplicarPerfil(perfil);

  // Respaldo por si no corrió calculateMetadata (no debería pasar)
  const tl: Timeline = useMemo(() => timeline ?? armarTimeline(spec, fps, null, null, null), [timeline, spec, fps]);
  const claves = useMemo(() => planCamara(spec, tl, perfil, fps), [spec, tl, perfil, fps]);
  const toma = tomaEn(claves, frame, durationInFrames, perfil);

  const total = spec.escenas.length;
  const current = Math.max(0, tl.scenes.findIndex((s) => frame >= s.from && frame < s.from + s.duration));
  const enCierre = spec.escenas[current]?.tipo === "cta";
  const isStudio = getRemotionEnvironment().isStudio;

  const ctxs: EscenaCtx[] = useMemo(
    () =>
      spec.escenas.map((e, i) => {
        const s = tl.scenes[i] ?? { from: 0, duration: 1 };
        const lineas = tl.lineas.filter((l) => l.escena === i);
        const ids = new Set(lineas.map((l) => l.idx));
        return {
          idx: i,
          absFrom: s.from,
          dur: s.duration,
          fps,
          lineas,
          palabras: tl.palabras.filter((p) => ids.has(p.linea)),
          todas: tl.palabras,
          dist: distribucionDe(tl.encuadres[i], e),
          distPrev: i > 0 ? distribucionDe(tl.encuadres[i - 1], spec.escenas[i - 1]) : undefined,
          encuadre: tl.encuadres[i],
        };
      }),
    [spec, tl, fps]
  );

  // El aviso "+ Sígueme" sale a mitad del video, al inicio de una escena "duo" (en barras o listas distraería del contenido)
  const mitad = Math.round(durationInFrames * 0.42);
  const escenaAviso = tl.scenes.findIndex((s, i) => s.from >= mitad && spec.escenas[i]?.tipo === "duo");
  const recordatorioDesde = escenaAviso >= 0 ? tl.scenes[escenaAviso].from + 6 : mitad;

  return (
    <PerfilContext.Provider value={perfil}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Fondo />
        {tl.audio && <Audio src={staticFile(tl.audio)} />}
        {tl.musica && <Audio src={staticFile(tl.musica)} volume={spec.volumenMusica ?? 0.08} loop />}

        {/* Mundo: se mueve con la cámara */}
        <div style={{ position: "absolute", left: 0, top: 0, width: lienzo.W, height: lienzo.H, transformOrigin: "0 0", transform: transformDe(toma) }}>
          <Escenario />
          {spec.escenas.map((e, i) => {
            const s = tl.scenes[i];
            if (!s || s.duration <= 0) return null;
            return (
              <Sequence key={i} from={s.from} durationInFrames={s.duration} layout="none" name={`${i + 1}. ${e.tipo} · ${tl.encuadres[i]}`}>
                <EscenaContext.Provider value={ctxs[i]}>
                  <SceneRenderer e={e} prev={spec.escenas[i - 1]} dur={s.duration} absFrom={s.from} />
                </EscenaContext.Provider>
              </Sequence>
            );
          })}
        </div>
        <Vineta />
        <Bandas z={toma.z} />

        {/* Capa fija: títulos, serie, firma y subtítulos */}
        {spec.escenas.map((e, i) => {
          const s = tl.scenes[i];
          if (!s || s.duration <= 0) return null;
          const prev = spec.escenas[i - 1];
          return (
            <Sequence key={`t${i}`} from={s.from} durationInFrames={s.duration} layout="none" name={`título ${i + 1}`}>
              <SceneTitle text={e.titulo} modo={e.tituloModo} animate={!prev || prev.titulo !== e.titulo || prev.tituloModo !== e.tituloModo} />
              {perfil.movimiento.golpeEntrada && i > 0 && <Destello />}
            </Sequence>
          );
        })}
        <Kicker
          serie={spec.serie}
          progress={frame / Math.max(1, durationInFrames - 1)}
          capitulo={perfil.capitulos ? `${String(current + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}` : undefined}
        />
        {perfil.recordatorioSigueme && <Recordatorio desde={recordatorioDesde} />}
        <Watermark ocultar={enCierre} />
        <Captions palabras={tl.palabras} lineas={tl.lineas} resaltar={spec.resaltar} />

        {isStudio && tl.preview && (
          <Aviso top={24} bg="#FFC24B" fg="#1A1A1A">
            PREVIEW · {perfil.canal.toUpperCase()} · tiempos estimados (sin voz)
          </Aviso>
        )}
        {isStudio && tl.preview && tl.audio && <Aviso top={64} bg="#D7263D">VOZ SIN SINCRONIZAR · npm run sincronizar -- {spec.id}</Aviso>}
        {isStudio && tl.desfase && <Aviso top={104} bg="#D7263D">SUBTÍTULOS DESACTUALIZADOS · npm run subtitulos -- {spec.id}</Aviso>}
      </AbsoluteFill>
    </PerfilContext.Provider>
  );
};

/** Destello blanco breve al cambiar de escena (estilo ágil) */
const Destello: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 3], [0.1, 0], clamp01);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} />;
};

/** En tomas cerradas, franjas del color de fondo detrás del título y de los subtítulos para que se lean bien */
const Bandas: React.FC<{ z: number }> = ({ z }) => {
  const o = interpolate(z, [1.04, 1.16], [0, 1], clamp01);
  if (o <= 0) return null;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: lienzo.tituloAlto + 80, opacity: o, background: `linear-gradient(180deg, ${color.bg} 0%, ${color.bg} 66%, ${color.bg}00 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: lienzo.pisoMax - 54, bottom: 0, opacity: o * 0.9, background: `linear-gradient(180deg, ${color.bg}00 0%, ${color.bg} 24%, ${color.bg} 100%)` }} />
    </>
  );
};
