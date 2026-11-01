import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Actor } from "../characters/Actor";
import { Human } from "../characters/Human";
import { MiniBot } from "../characters/MiniBot";
import { MINIBOT_COLORS, PERSONAS } from "../characters/cast";
import { clamp01, ease, pop } from "../lib/anim";
import { ChatStack, Coins, Display, Docs, IconCard, Icono, Laptop, ObjetoGrande, Panel, Receipt } from "../props/Props";
import { color, font, layout, lienzo } from "../theme";
import type { Escena, Revelable } from "../engine/types";
import { Cast, Zona, useAltoZona, type SceneProps } from "./common";
import { usePerfil } from "../engine/perfil";
import { hablaEn, inicioLinea, lineaEn, momentoDe, momentoNumero, useEscena } from "../engine/context";
import { ambienteActual, textoSobre } from "../engine/ambientes";
import { HANDLE, MiniCara, REDES } from "../layers/Watermark";
import { Accented } from "../layers/Header";
import { CIERRE, IDIOMA, NOMBRES } from "../perfiles";
import type { ColorEscena } from "../engine/types";

const accentOf = (c?: ColorEscena) => (c === "alerta" ? color.coral : c === "acento2" ? color.teal : color.lime);
const textoDe = (x: string | Revelable) => (typeof x === "string" ? x : x.texto);
const claveDe = (x: string | Revelable) => (typeof x === "string" ? undefined : x.aparece);

const Etiqueta: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      fontFamily: font.mono,
      fontWeight: 700,
      fontSize: 26,
      letterSpacing: 4,
      color: color.text,
      background: color.panel,
      border: `3px solid ${color.panelEdge}`,
      padding: "8px 18px",
      borderRadius: 14,
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </div>
);

// ── duo: conversación con un objeto al centro ────────────────
export const DuoScene: React.FC<SceneProps<"duo">> = ({ e, prev, absFrom, dur }) => {
  const frame = useCurrentFrame();
  const ctx = useEscena();
  const prop = e.prop;
  // Los mensajes del chat aparecen al ritmo del diálogo (uno por línea) o repartidos en la escena
  const visiblesChat = (n: number) => {
    if (ctx.lineas.length >= n) {
      let v = 0;
      for (let k = 0; k < n; k++) {
        const ini = inicioLinea(ctx, k) ?? 0;
        v += interpolate(frame, [ini + 2, ini + 10], [0, 1], clamp01);
      }
      return Math.max(0.2, v);
    }
    return interpolate(frame, [4, dur * 0.7], [0.2, n], clamp01);
  };
  return (
    <>
      {prop && (
        <Zona ancho={760}>
          {prop.tipo === "recibo" && <Receipt titulo={prop.titulo} lineas={prop.lineas} total={prop.total} />}
          {prop.tipo === "chat" && <ChatStack width={640} mensajes={prop.mensajes} visibles={visiblesChat(prop.mensajes.length)} />}
          {prop.tipo === "laptop" && <Laptop width={560} lineas={prop.lineas} etiqueta={prop.etiqueta} progreso={interpolate(frame, [6, dur * 0.75], [0, 1], clamp01)} />}
          {prop.tipo === "monedas" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Coins n={7} delay={6} simbolo={prop.simbolo} />
              {prop.etiqueta && <Etiqueta>{prop.etiqueta}</Etiqueta>}
            </div>
          )}
          {prop.tipo === "documentos" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Docs n={6} delay={4} />
              {prop.etiqueta && <Etiqueta style={{ opacity: ease(frame, 30, 8) }}>{prop.etiqueta}</Etiqueta>}
            </div>
          )}
          {prop.tipo === "icono" && <IconCard texto={prop.texto} sub={prop.sub} />}
          {prop.tipo === "objeto" && <ObjetoGrande icono={prop.icono} etiqueta={prop.etiqueta} />}
        </Zona>
      )}
      <Cast e={e} prev={prev} absFrom={absFrom} />
    </>
  );
};

// ── contador: número grande que sube cuando se dice ──────────
export const CounterScene: React.FC<SceneProps<"contador">> = ({ e, prev, absFrom, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const perfil = usePerfil();
  const ctx = useEscena();
  const ini = Math.min(e.aparece ? momentoDe(ctx, e.aparece, 0.1) : momentoNumero(ctx) ?? 6, Math.max(6, dur - 30));
  const fin = Math.min(dur - 4, ini + Math.max(20, dur * 0.35));
  const v = interpolate(frame, [ini, fin], [e.desde ?? 0, e.hasta], { ...clamp01, easing: Easing.out(Easing.cubic) });
  const decimals = Number.isInteger(e.hasta) && Number.isInteger(e.desde ?? 0) ? 0 : 1;
  const txt = `${e.prefijo ?? ""}${v.toLocaleString(IDIOMA, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${e.sufijo ?? ""}`;
  const done = frame > fin;
  const bump = done ? 1 + 0.06 * (1 - pop(frame, fps, Math.round(fin))) : 1;
  const tDone = frame - Math.round(fin);
  const shake = perfil.movimiento.sacudida && tDone >= 0 && tDone < 10 ? Math.sin(tDone * 2.6) * (10 - tDone) * 1.4 : 0;
  return (
    <>
      <Zona ancho={700}>
        <div style={{ transform: `translateX(${shake}px)`, opacity: ease(frame, 0, 6) }}>
          <Display etiqueta={e.etiqueta} valor={txt} c={accentOf(e.color)} scale={bump} />
        </div>
      </Zona>
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

// ── pila: una lista/conversación que crece ───────────────────
export const StackScene: React.FC<SceneProps<"pila">> = ({ e, prev, absFrom, dur }) => {
  const frame = useCurrentFrame();
  const n = Math.min(e.items.length, 8);
  const vis = interpolate(frame, [4, dur * 0.75], [0.2, n], clamp01);
  return (
    <>
      <Zona ancho={lienzo.horizontal ? 860 : 640}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <ChatStack width={lienzo.horizontal ? 820 : 600} size={34} mensajes={e.items.slice(0, n)} visibles={vis} />
          {e.etiqueta && (
            <Panel style={{ padding: "10px 24px", display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ fontFamily: font.mono, fontSize: 22, color: color.muted, letterSpacing: 3, textTransform: "uppercase" }}>{e.etiqueta}</div>
              <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 50, color: color.lime }}>{Math.ceil(vis)}</div>
            </Panel>
          )}
        </div>
      </Zona>
      <Cast e={e} prev={prev} absFrom={absFrom} secundarioDefault={{ expresion: "cargando", brazos: "sostener" }} />
    </>
  );
};

// ── multitud: muchos personajes (usuarios, agentes...) ───────
export const CrowdScene: React.FC<SceneProps<"multitud">> = ({ e, prev, absFrom, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ctx = useEscena();
  const b = ctx.dist.objeto;
  const personas = Object.values(PERSONAS);
  const nombres = e.quienes?.filter((q) => PERSONAS[q]);
  const conPersonas = e.con === "personas" || !!nombres?.length;
  const count = Math.min(nombres?.length || e.cantidad || 15, 15);
  const fila = count <= 5; // pocos: grandes, en una fila sobre el piso
  const rows = [b.y + b.h * 0.5, b.y + b.h * 0.75, b.y + b.h];
  const badge = pop(frame, fps, Math.round(dur * 0.35));
  const items = Array.from({ length: count }).map((_, i) => {
    if (fila) {
      const paso = count > 1 ? (b.w - 170) / (count - 1) : 0;
      return { x: count > 1 ? b.x + 85 + i * paso : b.x + b.w / 2, y: layout.floorY, i };
    }
    const r = Math.floor(i / 5);
    const c = i % 5;
    return { x: b.x + 110 + c * ((b.w - 220) / 4) + (r % 2 ? 40 : 0), y: rows[r], i };
  });
  // Si habla un extra que está en la fila, mueve la boca
  const { linea, activa } = lineaEn(ctx, frame);
  const hablaExtra = hablaEn(ctx, frame, "extra");
  const escala = fila ? (conPersonas ? (count >= 5 ? 1.5 : 1.7) : 1.6) : conPersonas ? 0.72 : 1.05;
  // En fila, el cartel va justo encima de las cabezas
  const cartelY = fila ? layout.floorY - 262 * escala - 150 : b.y + 10;
  return (
    <>
      {items.map(({ x, y, i }) => {
        const delay = Math.round((i / count) * Math.min(dur * 0.4, 45));
        const t = frame - delay;
        const look = nombres?.length ? PERSONAS[nombres[i]] : personas[i % personas.length];
        const nombre = nombres?.[i];
        const habla = !!nombre && hablaExtra && activa && linea?.extra === nombre;
        const salto = e.saludan && t >= 0 && t < 14 ? Math.sin((t / 14) * Math.PI) * 0.35 : 0;
        return (
          <Actor key={i} x={x} y={y} scale={escala} delay={delay} flip={fila && x > layout.centerX} box={{ x: -110, y: -250, w: 240, h: 262 }}>
            {conPersonas ? (
              <Human
                look={look}
                frame={absFrom + frame + i * 9}
                expression={e.saludan ? "feliz" : i % 3 ? "neutral" : "feliz"}
                arms={e.saludan && t > 4 ? "saludo" : "abajo"}
                speaking={habla}
                salto={salto}
                seed={i}
              />
            ) : (
              <MiniBot frame={absFrom + frame} c={MINIBOT_COLORS[i % MINIBOT_COLORS.length]} seed={i} mood={e.saludan || i % 4 === 1 ? "feliz" : "neutral"} />
            )}
          </Actor>
        );
      })}
      <div style={{ position: "absolute", top: cartelY, left: b.x, width: b.w, display: "flex", justifyContent: "center", transform: `scale(${badge})` }}>
        <div
          style={{
            background: color.lime,
            color: color.ink,
            fontFamily: font.title,
            fontWeight: 800,
            fontSize: 72,
            padding: "14px 40px",
            borderRadius: 24,
            boxShadow: `0 10px 0 ${color.sombra}`,
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

// ── pasos: lista numerada; cada paso aparece cuando se dice ──
export const StepsScene: React.FC<SceneProps<"pasos">> = ({ e, prev, absFrom }) => {
  const frame = useCurrentFrame();
  const ctx = useEscena();
  const n = e.pasos.length;
  const alto = useAltoZona(620);
  const gap = n > 4 ? 14 : 20;
  const h = Math.min(132, (alto - gap * (n - 1)) / n);
  const tiempos = e.pasos.map((p, i) => momentoDe(ctx, claveDe(p), (i / n) * 0.75));
  return (
    <>
      <Zona ancho={620}>
        <div style={{ width: 600, display: "flex", flexDirection: "column", gap }}>
          {e.pasos.map((p, i) => {
            const at = tiempos[i];
            const o = ease(frame, at, 9);
            const current = frame >= at && (i === n - 1 || frame < tiempos[i + 1]);
            return (
              <div key={i} style={{ opacity: o, transform: `translateX(${(1 - o) * 80}px) scale(${current ? 1.03 : 1})` }}>
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
                  <div style={{ fontFamily: font.title, fontWeight: 700, fontSize: Math.min(40, h * 0.34), color: color.text, lineHeight: 1.1 }}>{textoDe(p)}</div>
                </Panel>
              </div>
            );
          })}
        </div>
      </Zona>
      <Cast e={e} prev={prev} absFrom={absFrom} principalDefault={{ expresion: "confiado", brazos: "senalar" }} secundarioDefault={{ brazos: "senalar" }} />
    </>
  );
};

// ── terminal: laptop que escribe sola ────────────────────────
export const TerminalScene: React.FC<SceneProps<"terminal">> = ({ e, prev, absFrom, dur }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Zona ancho={640}>
        <Laptop width={590} lineas={e.lineas} etiqueta={e.etiqueta} progreso={interpolate(frame, [6, dur * 0.7], [0, 1], clamp01)} />
      </Zona>
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
      <Zona ancho={840}>
        <div style={{ width: 800, transform: `scale(${0.6 + 0.4 * p})`, opacity: p }}>
          <Panel style={{ padding: "34px 44px" }}>
            <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: color.teal, textTransform: "uppercase" }}>{e.fuente}</div>
            <div style={{ fontFamily: font.title, fontWeight: 800, fontSize: 54, color: color.text, lineHeight: 1.12, margin: "18px 0" }}>“{e.texto}”</div>
            {e.pie && <div style={{ fontFamily: font.mono, fontSize: 22, letterSpacing: 3, color: color.muted, textTransform: "uppercase" }}>{e.pie}</div>}
          </Panel>
        </div>
      </Zona>
      <Cast e={e} prev={prev} absFrom={absFrom} principalDefault={{ expresion: "confiado" }} secundarioDefault={{ expresion: "feliz" }} />
    </>
  );
};

// ── comparar: barras de bloques ──────────────────────────────
export const CompareScene: React.FC<SceneProps<"comparar">> = ({ e, prev, absFrom }) => {
  const frame = useCurrentFrame();
  const ctx = useEscena();
  const max = Math.max(...e.items.map((i) => i.valor));
  const unit = Math.min(64, 760 / max);
  return (
    <>
      <Zona ancho={860}>
        <div style={{ width: 820, display: "flex", flexDirection: "column", gap: 26 }}>
          {e.items.map((it, i) => {
            const start = momentoDe(ctx, it.aparece, i * 0.3);
            const g = interpolate(frame, [start, start + 18], [0, 1], { ...clamp01, easing: Easing.out(Easing.cubic) });
            const shown = Math.round(it.valor * g);
            const c = accentOf(it.color);
            return (
              <div key={i} style={{ opacity: Math.min(1, g * 3) }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: font.mono, fontSize: 30, color: color.muted, letterSpacing: 2, marginBottom: 8 }}>
                  <span style={{ textTransform: "uppercase" }}>{it.etiqueta}</span>
                  <span style={{ color: c, fontWeight: 700 }}>
                    {shown} {it.nota ?? ""}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {Array.from({ length: shown }).map((_, k) => (
                    <div key={k} style={{ width: unit - 6, height: 56, background: c, borderRadius: 8, boxShadow: `inset 0 -8px 0 rgba(0,0,0,0.25)` }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Zona>
      <Cast e={e} prev={prev} absFrom={absFrom} />
    </>
  );
};

// ── diagrama: nodos con flechas que se dibujan; un dato viaja por el flujo ──
type Pt = { x: number; y: number };
const bezier = (a: Pt, c1: Pt, c2: Pt, b: Pt, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
    y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y,
  };
};

export const DiagramScene: React.FC<SceneProps<"diagrama">> = ({ e, prev, absFrom, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ctx = useEscena();
  const vertical = (e.direccion ?? (e.nodos.length > 4 || ctx.dist.objeto.w < 800 ? "vertical" : "horizontal")) === "vertical";
  const ancho = vertical ? 620 : 940;
  const alto = useAltoZona(ancho);
  const n = e.nodos.length;

  // Geometría de los nodos (unidades de diseño)
  const cajas = e.nodos.map((_, i) => {
    if (vertical) {
      const hn = Math.min(128, (alto - 44 * (n - 1)) / n);
      const gap = Math.min(96, (alto - n * hn) / Math.max(1, n - 1));
      const total = n * hn + (n - 1) * gap;
      const top = (alto - total) / 2;
      return { x: 70, y: top + i * (hn + gap), w: 480, h: hn };
    }
    const gap = 74;
    const wn = (ancho - 20 - (n - 1) * gap) / n;
    const hn = Math.min(250, alto * 0.62);
    return { x: 10 + i * (wn + gap), y: (alto - hn) / 2, w: wn, h: hn };
  });
  const idx = Object.fromEntries(e.nodos.map((nd, i) => [nd.id, i]));
  const flechas = e.flechas ?? e.nodos.slice(1).map((nd, i) => ({ de: e.nodos[i].id, a: nd.id, texto: undefined as string | undefined, aparece: undefined as string | undefined }));
  const tNodo = e.nodos.map((nd, i) => momentoDe(ctx, nd.aparece, (i / n) * 0.7));

  const geom = flechas
    .map((f) => {
      const ia = idx[f.de];
      const ib = idx[f.a];
      if (ia === undefined || ib === undefined) return null;
      const A = cajas[ia];
      const B = cajas[ib];
      let a: Pt, b: Pt, c1: Pt, c2: Pt;
      const vecinos = ib - ia === 1; // hacia atrás o saltando nodos → curva por el costado
      if (vertical) {
        if (vecinos) {
          const abajo = ib > ia;
          a = { x: A.x + A.w / 2, y: abajo ? A.y + A.h : A.y };
          b = { x: B.x + B.w / 2, y: abajo ? B.y : B.y + B.h };
          c1 = { x: a.x, y: a.y + (b.y - a.y) / 3 };
          c2 = { x: b.x, y: a.y + ((b.y - a.y) * 2) / 3 };
        } else {
          a = { x: A.x + A.w, y: A.y + A.h / 2 };
          b = { x: B.x + B.w, y: B.y + B.h / 2 };
          c1 = { x: a.x + 110, y: a.y };
          c2 = { x: b.x + 110, y: b.y };
        }
      } else if (vecinos) {
        const der = ib > ia;
        a = { x: der ? A.x + A.w : A.x, y: A.y + A.h / 2 };
        b = { x: der ? B.x : B.x + B.w, y: B.y + B.h / 2 };
        c1 = { x: a.x + (b.x - a.x) / 3, y: a.y };
        c2 = { x: a.x + ((b.x - a.x) * 2) / 3, y: b.y };
      } else {
        a = { x: A.x + A.w / 2, y: A.y + A.h };
        b = { x: B.x + B.w / 2, y: B.y + B.h };
        c1 = { x: a.x, y: a.y + 110 };
        c2 = { x: b.x, y: b.y + 110 };
      }
      const t0 = f.aparece ? momentoDe(ctx, f.aparece, 0) : Math.max(tNodo[ia], tNodo[ib] - 9);
      return { f, a, b, c1, c2, t0, ib };
    })
    .filter(Boolean) as { f: (typeof flechas)[number]; a: Pt; b: Pt; c1: Pt; c2: Pt; t0: number; ib: number }[];

  // Dato que recorre el flujo cuando ya está todo
  const tTodo = Math.max(...tNodo, ...geom.map((g) => g.t0)) + 14;
  const tramo = 16;
  let dato: Pt | null = null;
  let nodoActivo = -1;
  if (e.flujo && geom.length && frame > tTodo) {
    const ciclo = geom.length * tramo + 12;
    const t = (frame - tTodo) % ciclo;
    const k = Math.floor(t / tramo);
    if (k < geom.length) {
      const g = geom[k];
      const u = Easing.inOut(Easing.quad)((t - k * tramo) / tramo);
      dato = bezier(g.a, g.c1, g.c2, g.b, u);
      if (u > 0.85) nodoActivo = g.ib;
    }
  }

  return (
    <>
      <Zona ancho={ancho}>
        <div style={{ position: "relative", width: ancho, height: alto }}>
          <svg width={ancho} height={alto} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            {geom.map((g, i) => {
              const p = interpolate(frame, [g.t0, g.t0 + 10], [0, 1], clamp01);
              if (p <= 0) return null;
              const d = `M ${g.a.x} ${g.a.y} C ${g.c1.x} ${g.c1.y}, ${g.c2.x} ${g.c2.y}, ${g.b.x} ${g.b.y}`;
              const fin = bezier(g.a, g.c1, g.c2, g.b, 1);
              const casi = bezier(g.a, g.c1, g.c2, g.b, 0.92);
              const ang = (Math.atan2(fin.y - casi.y, fin.x - casi.x) * 180) / Math.PI;
              const mid = bezier(g.a, g.c1, g.c2, g.b, 0.5);
              return (
                <g key={i}>
                  <path d={d} fill="none" stroke={color.lime} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
                  <polygon points="0,-13 22,0 0,13" fill={color.lime} transform={`translate(${fin.x} ${fin.y}) rotate(${ang}) translate(-18 0)`} opacity={p > 0.9 ? 1 : 0} />
                  {g.f.texto && (
                    <foreignObject x={mid.x - 160} y={mid.y - 22} width={320} height={44} opacity={p}>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <span style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 22, color: color.ink, background: color.lime, borderRadius: 10, padding: "4px 12px" }}>{g.f.texto}</span>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
          {e.nodos.map((nd, i) => {
            const c = cajas[i];
            const p = pop(frame, fps, tNodo[i], 200);
            const recien = frame - tNodo[i] < 22 && frame >= tNodo[i];
            const activo = recien || nodoActivo === i;
            const icon = nd.icono;
            const ic = Math.min(c.h * 0.62, vertical ? 90 : 120);
            return (
              <div key={nd.id} style={{ position: "absolute", left: c.x, top: c.y, width: c.w, height: c.h, transform: `scale(${p * (activo ? 1.05 : 1)})`, opacity: Math.min(1, p * 2) }}>
                <Panel
                  edge={activo ? color.lime : undefined}
                  style={{
                    width: "100%",
                    height: "100%",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: vertical ? "row" : "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: vertical ? 22 : 12,
                    padding: vertical ? "0 24px" : "14px 10px",
                  }}
                >
                  {icon && <Icono id={icon} size={ic} />}
                  <div
                    style={{
                      fontFamily: font.title,
                      fontWeight: 800,
                      fontSize: Math.min(40, vertical ? c.h * 0.32 : c.w * 0.16),
                      color: color.text,
                      lineHeight: 1.08,
                      textAlign: vertical ? "left" : "center",
                    }}
                  >
                    {nd.texto}
                  </div>
                </Panel>
              </div>
            );
          })}
          {dato && (
            <div
              style={{
                position: "absolute",
                left: dato.x - 22,
                top: dato.y - 22,
                width: 44,
                height: 44,
                borderRadius: 12,
                background: color.amber,
                boxShadow: `0 0 26px ${color.amber}, 0 0 0 5px ${color.panel}`,
                transform: `rotate(${frame * 6}deg)`,
              }}
            />
          )}
        </div>
      </Zona>
      <Cast e={e} prev={prev} absFrom={absFrom} principalDefault={{ brazos: "explicar" }} secundarioDefault={{ brazos: "senalar" }} />
    </>
  );
};

// ── pizarra: el principal explica en una pizarra que se va escribiendo ──
export const PizarraScene: React.FC<SceneProps<"pizarra">> = ({ e, prev, absFrom }) => {
  const frame = useCurrentFrame();
  const ctx = useEscena();
  const ancho = lienzo.horizontal ? 920 : 640;
  const alto = useAltoZona(ancho);
  const n = e.lineas.length;
  // Con 5–6 líneas la letra baja para que todo quepa
  const letra = n >= 6 ? 38 : n === 5 ? 42 : 46;
  const hueco = n >= 6 ? 8 : n === 5 ? 12 : 16;
  // Fondo claro → pizarra de tiza; fondo oscuro → pizarra blanca
  const tiza = ambienteActual.claro;
  const tablero = tiza ? "#1F2B27" : "#F7F5EF";
  const tinta = tiza ? "#F2F2EA" : "#1E2421";
  const marcador = tiza ? "#FFD166" : "#1E5BD8";
  const tiempos = e.lineas.map((l, i) => momentoDe(ctx, claveDe(l), 0.05 + (i / n) * 0.7));
  const pIn = ease(frame, 0, 10);
  const actual = tiempos.reduce((acc, t, i) => (frame >= t ? i : acc), -1);
  return (
    <>
      <Zona ancho={ancho}>
        <div
          style={{
            width: ancho - 30,
            maxHeight: alto - 20,
            background: tablero,
            border: "12px solid #B9BEBA",
            borderRadius: 18,
            boxShadow: `0 14px 0 ${color.sombra}`,
            padding: "26px 30px 34px",
            boxSizing: "border-box",
            transform: `translateY(${(1 - pIn) * 40}px)`,
            opacity: pIn,
            position: "relative",
          }}
        >
          {e.encabezado && (
            <div style={{ fontFamily: font.title, fontWeight: 800, fontSize: 52, color: marcador, marginBottom: 18, borderBottom: `5px solid ${marcador}`, paddingBottom: 8, display: "inline-block" }}>
              {e.encabezado}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: hueco }}>
            {e.lineas.map((l, i) => {
              const txt = textoDe(l);
              const chars = Math.max(0, Math.floor((frame - tiempos[i]) * 1.8));
              if (chars <= 0) return <div key={i} style={{ height: 0 }} />;
              const shown = txt.slice(0, chars);
              const cur = i === actual;
              return (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: font.title, fontWeight: 800, fontSize: letra, color: cur ? marcador : tinta, opacity: 0.9, lineHeight: 1.15 }}>{cur ? "→" : "•"}</span>
                  <span style={{ fontFamily: font.title, fontWeight: 700, fontSize: letra, color: tinta, lineHeight: 1.15 }}>
                    {shown}
                    {chars < txt.length && <span style={{ opacity: Math.floor(frame / 6) % 2 ? 1 : 0.2 }}>|</span>}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", left: 40, right: 40, bottom: -30, height: 14, background: "#A9AEAA", borderRadius: 6 }} />
        </div>
      </Zona>
      <Cast e={e} prev={prev} absFrom={absFrom} principalDefault={{ brazos: "senalar", expresion: "confiado" }} secundarioDefault={{ brazos: "senalar" }} />
    </>
  );
};

// ── linea: línea de tiempo con eventos que aparecen al decirse ──
export const LineaScene: React.FC<SceneProps<"linea">> = ({ e, prev, absFrom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ctx = useEscena();
  const ancho = 680;
  const alto = useAltoZona(ancho);
  const n = e.eventos.length;
  const fila = Math.min(170, (alto - 20) / n);
  const total = fila * n;
  const top = (alto - total) / 2;
  const tiempos = e.eventos.map((ev, i) => momentoDe(ctx, ev.aparece, (i / n) * 0.75));
  const ultimo = tiempos.reduce((acc, t, i) => (frame >= t ? i : acc), -1);
  const ejeHasta = ultimo < 0 ? 0 : top + fila * ultimo + fila / 2 + interpolate(frame - tiempos[ultimo], [0, 14], [-fila * 0.6, 0], clamp01);
  return (
    <>
      <Zona ancho={ancho}>
        <div style={{ position: "relative", width: ancho, height: alto }}>
          <div style={{ position: "absolute", left: 66, top: top + fila / 2, width: 8, height: Math.max(0, ejeHasta - top - fila / 2), background: color.panelEdge, borderRadius: 4 }} />
          {e.eventos.map((ev, i) => {
            const p = pop(frame, fps, tiempos[i], 200);
            const actual = i === ultimo;
            const y = top + i * fila;
            return (
              <div key={i} style={{ position: "absolute", left: 0, top: y, width: ancho, height: fila, display: "flex", alignItems: "center", gap: 26, opacity: Math.min(1, p * 2) }}>
                <div
                  style={{
                    marginLeft: 46,
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: actual ? color.lime : color.panel,
                    border: `5px solid ${color.lime}`,
                    transform: `scale(${p}) rotate(45deg)`,
                    flexShrink: 0,
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ transform: `translateX(${(1 - p) * 40}px)` }}>
                  <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 30, color: color.lime, letterSpacing: 2 }}>{ev.fecha}</div>
                  <div style={{ fontFamily: font.title, fontWeight: 700, fontSize: Math.min(40, fila * 0.3), color: color.text, lineHeight: 1.1, maxWidth: 520 }}>{ev.texto}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Zona>
      <Cast e={e} prev={prev} absFrom={absFrom} principalDefault={{ brazos: "senalar" }} />
    </>
  );
};

// ── cta: cierre con el @usuario y las redes del canal ────────
export const CtaScene: React.FC<SceneProps<"cta">> = ({ e, prev, absFrom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const perfil = usePerfil();
  const p = pop(frame, fps, 3);
  const pulse = 1 + Math.sin(frame / 5) * (perfil.estilo === "agil" ? 0.04 : 0.015);
  const curso = perfil.cierre.curso ? e.curso ?? CIERRE.cursoPorDefecto : null;
  const pregunta = perfil.cierre.pregunta ? e.pregunta : undefined;
  return (
    <>
      <Zona ancho={940} max={lienzo.horizontal ? 1.1 : 1} caja={lienzo.horizontal ? { x: 440, y: 190, w: 1040, h: 560 } : { x: 40, y: 445, w: 1000, h: 340 }}>
        <div style={{ width: 920, transform: `scale(${p})`, opacity: Math.min(1, p * 2) }}>
          <Panel style={{ padding: "20px 30px 22px", textAlign: "center" }} edge={color.lime}>
            <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: color.lime }}>{CIERRE.titulo}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, margin: "10px 0 12px", transform: `scale(${pulse})` }}>
              <MiniCara size={80} frame={absFrom + frame} borde={color.lime} />
              <div style={{ fontFamily: font.title, fontWeight: 800, fontSize: 62, color: color.text, letterSpacing: -1 }}>{HANDLE}</div>
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
                      fontSize: 26,
                      color: color.text,
                      padding: "6px 14px",
                      borderRadius: 12,
                      border: `2px solid ${color.panelEdge}`,
                      background: color.accentSoft,
                    }}
                  >
                    {r}
                  </span>
                );
              })}
            </div>
            {e.llamada && <div style={{ fontFamily: font.title, fontWeight: 600, fontSize: 30, color: color.muted, marginTop: 16 }}>{e.llamada}</div>}
            {pregunta && (
              <div
                style={{
                  marginTop: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  background: color.coral,
                  color: textoSobre(color.coral),
                  fontFamily: font.title,
                  fontWeight: 800,
                  fontSize: 34,
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
      </Zona>
      <Cast e={e} prev={prev} absFrom={absFrom} principalDefault={{ expresion: "feliz", brazos: "saludo" }} secundarioDefault={{ expresion: "feliz", brazos: "celebrar" }} />
    </>
  );
};

// ── pregunta: la duda del público en grande ──────────────────
export const PreguntaScene: React.FC<SceneProps<"pregunta">> = ({ e, prev, absFrom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, 4, 200);
  const etiqueta = e.de === "publico" ? "LA PREGUNTA DEL PÚBLICO" : e.de === "extra" ? "UNA DUDA REAL" : `LA PREGUNTA DE ${NOMBRES.secundario.toUpperCase()}`;
  const c = e.de === "extra" ? color.vozExtra : e.de === "publico" ? color.lime : color.vozSecundario;
  return (
    <>
      <Zona ancho={900}>
        <div style={{ width: 860, transform: `scale(${0.7 + 0.3 * p})`, opacity: Math.min(1, p * 2) }}>
          <Panel edge={c} style={{ display: "flex", alignItems: "center", gap: 30, padding: "30px 40px" }}>
            <div style={{ minWidth: 120, height: 120, borderRadius: 60, background: c, color: textoSobre(c), fontFamily: font.title, fontWeight: 800, fontSize: 92, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${Math.sin(frame / 9) * 6}deg)` }}>
              ?
            </div>
            <div>
              <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: c }}>{etiqueta}</div>
              <div style={{ fontFamily: font.title, fontWeight: 800, fontSize: 52, color: color.text, lineHeight: 1.12, marginTop: 8 }}>{e.pregunta}</div>
            </div>
          </Panel>
        </div>
      </Zona>
      <Cast e={e} prev={prev} absFrom={absFrom} secundarioDefault={{ expresion: "pensando" }} principalDefault={{ expresion: "confiado" }} />
    </>
  );
};

// ── tabla: comparación que se llena fila a fila ──────────────
export const TablaScene: React.FC<SceneProps<"tabla">> = ({ e, prev, absFrom }) => {
  const frame = useCurrentFrame();
  const ctx = useEscena();
  const previas = Math.min(e.previas ?? 0, e.filas.length);
  const nuevas = e.filas.length - previas;
  const tiempos = e.filas.map((f, i) => (i < previas ? -999 : momentoDe(ctx, f.aparece, 0.05 + ((i - previas) / Math.max(1, nuevas)) * 0.65)));
  const ultima = tiempos.reduce((acc, t, i) => (frame >= t ? i : acc), -1);
  const ancho = lienzo.horizontal ? 1180 : 680;
  const fs = lienzo.horizontal ? (e.columnas.length > 4 ? 30 : 36) : 24;
  const pad = lienzo.horizontal ? "18px 24px" : "14px 18px";
  const cols = `1.1fr ${e.columnas.slice(1).map(() => "1fr").join(" ")}`;
  return (
    <>
      <Zona ancho={ancho}>
        <div style={{ width: ancho - 20 }}>
          {e.encabezado && <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: color.lime, marginBottom: 12, textTransform: "uppercase" }}>{e.encabezado}</div>}
          <Panel style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: cols, background: color.accentSoft }}>
              {e.columnas.map((c, j) => (
                <div key={j} style={{ padding: pad, fontFamily: font.mono, fontWeight: 700, fontSize: fs * 0.72, letterSpacing: 2, color: color.lime, textTransform: "uppercase" }}>{c}</div>
              ))}
            </div>
            {e.filas.map((f, i) => {
              const o = i < previas ? 1 : ease(frame, tiempos[i], 10);
              const actual = i === ultima && i >= previas;
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: cols,
                    borderTop: `2px solid ${color.panelEdge}`,
                    background: actual ? color.accentSoft : "transparent",
                    opacity: o === 0 ? 0.18 : o,
                  }}
                >
                  {e.columnas.map((_, j) => (
                    <div
                      key={j}
                      style={{
                        padding: pad,
                        fontFamily: font.title,
                        fontWeight: j === 0 ? 800 : 600,
                        fontSize: fs,
                        lineHeight: 1.15,
                        color: j === 0 ? color.text : o === 0 ? color.dim : color.text,
                        transform: `translateX(${(1 - o) * 30}px)`,
                      }}
                    >
                      {o === 0 && j > 0 ? "·" : f.celdas[j] ?? ""}
                    </div>
                  ))}
                </div>
              );
            })}
          </Panel>
        </div>
      </Zona>
      <Cast e={e} prev={prev} absFrom={absFrom} secundarioDefault={{ brazos: "escribir", expresion: "feliz" }} principalDefault={{ brazos: "explicar" }} />
    </>
  );
};

// ── resumen: lista que se marca a medida que se dice ─────────
export const ResumenScene: React.FC<SceneProps<"resumen">> = ({ e, prev, absFrom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ctx = useEscena();
  const n = e.puntos.length;
  const tiempos = e.puntos.map((p, i) => momentoDe(ctx, claveDe(p), 0.05 + (i / Math.max(1, n)) * 0.75));
  return (
    <>
      <Zona ancho={780}>
        <div style={{ width: 760 }}>
          {e.encabezado && (
            <div style={{ fontFamily: font.title, fontWeight: 800, fontSize: 46, color: color.text, marginBottom: 18 }}>
              <Accented text={e.encabezado} />
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {e.puntos.map((pt, i) => {
              const o = ease(frame, tiempos[i] - 6, 8);
              const check = pop(frame, fps, tiempos[i] + 6, 260);
              return (
                <div key={i} style={{ opacity: Math.max(0.25, o) }}>
                  <Panel style={{ display: "flex", alignItems: "center", gap: 20, padding: "14px 22px" }} edge={frame >= tiempos[i] ? color.lime : undefined}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, border: `4px solid ${color.lime}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width={30} height={30} viewBox="0 0 30 30" style={{ transform: `scale(${check})` }}>
                        <polyline points="5,16 12,23 25,8" fill="none" stroke={color.lime} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div style={{ fontFamily: font.title, fontWeight: 700, fontSize: 34, color: color.text, lineHeight: 1.15 }}>{textoDe(pt)}</div>
                  </Panel>
                </div>
              );
            })}
          </div>
        </div>
      </Zona>
      <Cast e={e} prev={prev} absFrom={absFrom} principalDefault={{ brazos: "senalar", expresion: "confiado" }} secundarioDefault={{ expresion: "feliz" }} />
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
    case "diagrama":
      return <DiagramScene {...props} e={e} />;
    case "pizarra":
      return <PizarraScene {...props} e={e} />;
    case "linea":
      return <LineaScene {...props} e={e} />;
    case "cta":
      return <CtaScene {...props} e={e} />;
    case "pregunta":
      return <PreguntaScene {...props} e={e} />;
    case "tabla":
      return <TablaScene {...props} e={e} />;
    case "resumen":
      return <ResumenScene {...props} e={e} />;
  }
};
