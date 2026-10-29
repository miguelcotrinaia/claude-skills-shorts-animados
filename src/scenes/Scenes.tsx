import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Actor } from "../characters/Actor";
import { Human } from "../characters/Human";
import { MiniBot } from "../characters/MiniBot";
import { MINIBOT_COLORS, PERSONAS } from "../characters/cast";
import { clamp01, ease, pop } from "../lib/anim";
import { ChatStack, Coins, Display, Docs, IconCard, Laptop, Panel, Receipt } from "../props/Props";
import { color, font, layout } from "../theme";
import type { Escena } from "../engine/types";
import { Cast, type SceneProps } from "./common";
import { usePerfil } from "../engine/perfil";
import { HANDLE, MiniCara, REDES } from "../layers/Watermark";
import { CIERRE, IDIOMA } from "../perfiles";
import type { ColorEscena } from "../engine/types";

const accentOf = (c?: ColorEscena) => (c === "alerta" ? color.coral : c === "acento2" ? color.teal : color.lime);
const STAGE_TOP = 500;

// ── duo: principal + secundario + prop opcional al centro ────
export const DuoScene: React.FC<SceneProps<"duo">> = ({ e, prev, absFrom, dur }) => {
  const frame = useCurrentFrame();
  const prop = e.prop;
  return (
    <>
      {prop?.tipo === "recibo" && <Receipt x={540} y={STAGE_TOP + 10} titulo={prop.titulo} lineas={prop.lineas} total={prop.total} />}
      {prop?.tipo === "chat" && (
        <ChatStack
          x={250}
          y={STAGE_TOP}
          width={580}
          mensajes={prop.mensajes}
          visibles={interpolate(frame, [4, dur * 0.7], [0.2, prop.mensajes.length], clamp01)}
        />
      )}
      {prop?.tipo === "laptop" && (
        <Laptop x={540} y={STAGE_TOP} scale={0.8} lineas={prop.lineas} etiqueta={prop.etiqueta} progreso={interpolate(frame, [6, dur * 0.75], [0, 1], clamp01)} />
      )}
      {prop?.tipo === "monedas" && <Coins x={540} y={880} n={7} delay={6} simbolo={prop.simbolo} />}
      {prop?.tipo === "documentos" && <Docs x={540} y={880} n={6} delay={4} />}
      {prop?.tipo === "icono" && <IconCard x={540} y={STAGE_TOP + 40} texto={prop.texto} sub={prop.sub} />}
      <Cast e={e} prev={prev} absFrom={absFrom} />
    </>
  );
};

// ── contador: número grande que sube ─────────────────────────
export const CounterScene: React.FC<SceneProps<"contador">> = ({ e, prev, absFrom, dur }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [6, Math.max(20, dur * 0.6)], [e.desde ?? 0, e.hasta], {
    ...clamp01,
    easing: Easing.out(Easing.cubic),
  });
  const decimals = Number.isInteger(e.hasta) && Number.isInteger(e.desde ?? 0) ? 0 : 1;
  const txt = `${e.prefijo ?? ""}${v.toLocaleString(IDIOMA, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${e.sufijo ?? ""}`;
  const done = frame > dur * 0.6;
  const { fps } = useVideoConfig();
  const perfil = usePerfil();
  const bump = done ? 1 + 0.06 * (1 - pop(frame, fps, Math.round(dur * 0.6))) : 1;
  const tDone = frame - Math.round(dur * 0.6);
  const shake = perfil.movimiento.sacudida && tDone >= 0 && tDone < 10 ? Math.sin(tDone * 2.6) * (10 - tDone) * 1.4 : 0;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${shake}px)` }}>
        <Display x={540} y={STAGE_TOP + 20} etiqueta={e.etiqueta} valor={txt} c={accentOf(e.color)} scale={bump} />
      </div>
      <Cast
        e={e}
        prev={prev}
        absFrom={absFrom}
        principalDefault={{ expresion: done ? "sorprendido" : "neutral" }}
        secundarioDefault={{ expresion: done ? "sorprendido" : "cargando", brazos: "escribir" }}
      />
    </>
  );
};

// ── pila: el secundario relee una conversación que crece ─────
export const StackScene: React.FC<SceneProps<"pila">> = ({ e, prev, absFrom, dur }) => {
  const frame = useCurrentFrame();
  const n = Math.min(e.items.length, 8);
  const vis = interpolate(frame, [4, dur * 0.75], [0.2, n], clamp01);
  return (
    <>
      <ChatStack x={60} y={STAGE_TOP - 20} width={560} mensajes={e.items.slice(0, n)} visibles={vis} />
      {e.etiqueta && (
        <div style={{ position: "absolute", left: 650, top: 600, width: 300, textAlign: "center" }}>
          <Panel style={{ padding: "12px 18px" }}>
            <div style={{ fontFamily: font.mono, fontSize: 22, color: color.muted, letterSpacing: 3, textTransform: "uppercase" }}>{e.etiqueta}</div>
            <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 56, color: color.lime }}>{Math.ceil(vis)}</div>
          </Panel>
        </div>
      )}
      <Cast e={e} prev={prev} absFrom={absFrom} secundarioDefault={{ expresion: "cargando", brazos: "sostener" }} />
    </>
  );
};

// ── multitud: muchos personajes (usuarios, agentes...) ───────
export const CrowdScene: React.FC<SceneProps<"multitud">> = ({ e, prev, absFrom, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = Math.min(e.cantidad ?? 15, 15);
  const rows = [800, 1010, 1220];
  const badge = pop(frame, fps, Math.round(dur * 0.45));
  const items = Array.from({ length: count }).map((_, i) => {
    const r = Math.floor(i / 5);
    const c = i % 5;
    return { x: 150 + c * 195 + (r % 2 ? 40 : 0), y: rows[r], i };
  });
  const personas = Object.values(PERSONAS);
  return (
    <>
      {items.map(({ x, y, i }) => (
        <Actor key={i} x={x} y={y} scale={e.con === "personas" ? 0.72 : 1.05} delay={Math.round((i / count) * dur * 0.4)} box={{ x: -110, y: -250, w: 240, h: 262 }}>
          {e.con === "personas" ? (
            <Human look={personas[i % personas.length]} frame={absFrom + frame} expression={i % 3 ? "neutral" : "feliz"} seed={i} />
          ) : (
            <MiniBot frame={absFrom + frame} c={MINIBOT_COLORS[i % MINIBOT_COLORS.length]} seed={i} mood={i % 4 === 1 ? "feliz" : "neutral"} />
          )}
        </Actor>
      ))}
      <div
        style={{
          position: "absolute",
          top: STAGE_TOP + 20,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${badge})`,
        }}
      >
        <div
          style={{
            background: color.lime,
            color: color.ink,
            fontFamily: font.title,
            fontWeight: 800,
            fontSize: 72,
            padding: "14px 40px",
            borderRadius: 24,
            boxShadow: "0 10px 0 rgba(0,0,0,0.35)",
            transform: "rotate(-2deg)",
          }}
        >
          {e.etiqueta}
        </div>
      </div>
      <Cast e={e} prev={prev} absFrom={absFrom} />
    </>
  );
};

// ── pasos: lista numerada que aparece paso a paso ────────────
export const StepsScene: React.FC<SceneProps<"pasos">> = ({ e, prev, absFrom, dur }) => {
  const frame = useCurrentFrame();
  const n = e.pasos.length;
  const gap = n > 4 ? 14 : 22;
  const h = n > 4 ? 112 : 128;
  return (
    <>
      <div style={{ position: "absolute", left: 470, top: STAGE_TOP, width: 560, display: "flex", flexDirection: "column", gap }}>
        {e.pasos.map((p, i) => {
          const at = 4 + (i / n) * dur * 0.75;
          const o = ease(frame, at, 9);
          const current = frame >= at && (i === n - 1 || frame < 4 + ((i + 1) / n) * dur * 0.75);
          return (
            <div key={i} style={{ opacity: o, transform: `translateX(${(1 - o) * 80}px)` }}>
              <Panel style={{ height: h, display: "flex", alignItems: "center", gap: 22, padding: "0 26px" }} edge={current ? color.lime : undefined}>
                <div
                  style={{
                    minWidth: 64,
                    height: 64,
                    borderRadius: 16,
                    background: current ? color.lime : color.accentSoft,
                    color: current ? color.ink : color.lime,
                    fontFamily: font.mono,
                    fontWeight: 700,
                    fontSize: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontFamily: font.title, fontWeight: 700, fontSize: 40, color: color.text, lineHeight: 1.1 }}>{p}</div>
              </Panel>
            </div>
          );
        })}
      </div>
      <Cast e={e} prev={prev} absFrom={absFrom} principalDefault={{ expresion: "confiado", brazos: "senalar" }} />
    </>
  );
};

// ── terminal: laptop que escribe sola ────────────────────────
export const TerminalScene: React.FC<SceneProps<"terminal">> = ({ e, prev, absFrom, dur }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Laptop x={540} y={STAGE_TOP - 10} scale={0.95} lineas={e.lineas} etiqueta={e.etiqueta} progreso={interpolate(frame, [6, dur * 0.7], [0, 1], clamp01)} />
      <Cast e={e} prev={prev} absFrom={absFrom} secundarioDefault={{ expresion: "neutral", brazos: "escribir" }} principalDefault={{ expresion: "pensando" }} />
    </>
  );
};

// ── cita: tarjeta con una fuente ─────────────────────────────
export const QuoteScene: React.FC<SceneProps<"cita">> = ({ e, prev, absFrom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, 3);
  return (
    <>
      <div style={{ position: "absolute", left: 90, right: 90, top: STAGE_TOP, transform: `scale(${0.6 + 0.4 * p})`, opacity: p }}>
        <Panel style={{ padding: "34px 44px" }}>
          <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: color.teal, textTransform: "uppercase" }}>{e.fuente}</div>
          <div style={{ fontFamily: font.title, fontWeight: 800, fontSize: 56, color: color.text, lineHeight: 1.12, margin: "18px 0" }}>“{e.texto}”</div>
          {e.pie && <div style={{ fontFamily: font.mono, fontSize: 22, letterSpacing: 3, color: color.muted, textTransform: "uppercase" }}>{e.pie}</div>}
        </Panel>
      </div>
      <Cast e={e} prev={prev} absFrom={absFrom} principalDefault={{ expresion: "confiado" }} secundarioDefault={{ expresion: "feliz" }} />
    </>
  );
};

// ── comparar: barras de bloques ──────────────────────────────
export const CompareScene: React.FC<SceneProps<"comparar">> = ({ e, prev, absFrom, dur }) => {
  const frame = useCurrentFrame();
  const max = Math.max(...e.items.map((i) => i.valor));
  const unit = Math.min(64, 640 / max);
  return (
    <>
      <div style={{ position: "absolute", left: 110, right: 110, top: STAGE_TOP, display: "flex", flexDirection: "column", gap: 26 }}>
        {e.items.map((it, i) => {
          const start = 4 + i * (dur * 0.25);
          const g = interpolate(frame, [start, start + 18], [0, 1], { ...clamp01, easing: Easing.out(Easing.cubic) });
          const shown = Math.round(it.valor * g);
          const c = accentOf(it.color);
          return (
            <div key={i} style={{ opacity: Math.min(1, g * 3) }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: font.mono, fontSize: 28, color: color.muted, letterSpacing: 2, marginBottom: 8 }}>
                <span style={{ textTransform: "uppercase" }}>{it.etiqueta}</span>
                <span style={{ color: c, fontWeight: 700 }}>
                  {shown} {it.nota ?? ""}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {Array.from({ length: shown }).map((_, k) => (
                  <div key={k} style={{ width: unit - 6, height: 54, background: c, borderRadius: 8, boxShadow: `inset 0 -8px 0 rgba(0,0,0,0.25)` }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Cast e={e} prev={prev} absFrom={absFrom} />
    </>
  );
};

// ── cta: cierre con el @usuario y las redes del canal ────────
export const CtaScene: React.FC<SceneProps<"cta">> = ({ e, prev, absFrom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const perfil = usePerfil();
  const p = pop(frame, fps, 3);
  const pulse = 1 + Math.sin(frame / 5) * (perfil.canal === "tiktok" ? 0.04 : 0.015);
  const curso = perfil.cierre.curso ? e.curso ?? CIERRE.cursoPorDefecto : null;
  const pregunta = perfil.cierre.pregunta ? e.pregunta : undefined;
  return (
    <>
      <div style={{ position: "absolute", left: 60, right: 60, top: STAGE_TOP - 40, display: "flex", justifyContent: "center", transform: `scale(${p})`, opacity: Math.min(1, p * 2) }}>
        <Panel style={{ padding: "20px 30px 22px", width: "100%", textAlign: "center" }} edge={color.lime}>
          <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 28, letterSpacing: 5, color: color.lime }}>{CIERRE.titulo}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, margin: "10px 0 12px", transform: `scale(${pulse})` }}>
            <MiniCara size={74} frame={absFrom + frame} borde={color.lime} />
            <div style={{ fontFamily: font.title, fontWeight: 800, fontSize: 58, color: color.text, letterSpacing: -1 }}>{HANDLE}</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            {REDES.map((r, i) => {
              const o = ease(frame, 8 + i * 3, 6);
              return (
                <span
                  key={r}
                  style={{
                    opacity: o,
                    transform: `translateY(${(1 - o) * 12}px)`,
                    fontFamily: font.mono,
                    fontWeight: 700,
                    fontSize: 24,
                    color: color.text,
                    padding: "6px 14px",
                    borderRadius: 12,
                    border: `2px solid ${color.panelEdge}`,
                    background: "rgba(0,0,0,0.25)",
                  }}
                >
                  {r}
                </span>
              );
            })}
          </div>
          {e.llamada && <div style={{ fontFamily: font.title, fontWeight: 600, fontSize: 28, color: color.muted, marginTop: 16 }}>{e.llamada}</div>}
          {pregunta && (
            <div
              style={{
                marginTop: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: color.teal,
                color: color.ink,
                fontFamily: font.title,
                fontWeight: 800,
                fontSize: 32,
                padding: "10px 24px",
                borderRadius: 16,
                transform: `rotate(-1.5deg) scale(${ease(frame, 18, 8)})`,
              }}
            >
              {pregunta}
            </div>
          )}
          {curso && (
            <div
              style={{
                marginTop: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: color.lime,
                color: color.ink,
                fontFamily: font.title,
                fontWeight: 800,
                fontSize: 32,
                padding: "10px 26px",
                borderRadius: 16,
                opacity: ease(frame, 22, 8),
              }}
            >
              <span style={{ fontSize: 26 }}>▶</span> {curso}
            </div>
          )}
        </Panel>
      </div>
      <Cast
        e={e}
        prev={prev}
        absFrom={absFrom}
        principalDefault={{ expresion: "feliz", brazos: "saludo" }}
        secundarioDefault={{ expresion: "feliz", brazos: "celebrar" }}
      />
    </>
  );
};

export const SceneRenderer: React.FC<{ e: Escena; prev?: Escena; dur: number; absFrom: number }> = (props) => {
  const { e } = props;
  switch (e.tipo) {
    case "duo":
      return <DuoScene {...props} e={e} />;
    case "contador":
      return <CounterScene {...props} e={e} />;
    case "pila":
      return <StackScene {...props} e={e} />;
    case "multitud":
      return <CrowdScene {...props} e={e} />;
    case "pasos":
      return <StepsScene {...props} e={e} />;
    case "terminal":
      return <TerminalScene {...props} e={e} />;
    case "cita":
      return <QuoteScene {...props} e={e} />;
    case "comparar":
      return <CompareScene {...props} e={e} />;
    case "cta":
      return <CtaScene {...props} e={e} />;
  }
};
