import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp01, ease, pop } from "../lib/anim";
import { Block, shade } from "../lib/voxel";
import { color, font } from "../theme";

// ── Globo de diálogo ─────────────────────────────────────────
export const SpeechBubble: React.FC<{ x: number; y: number; text: string; tail?: "izq" | "der"; delay?: number }> = ({
  x,
  y,
  text,
  tail = "izq",
  delay = 6,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, delay, 220);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -100%) scale(${p})`,
        transformOrigin: tail === "izq" ? "20% 100%" : "80% 100%",
        background: color.text,
        color: color.ink,
        fontFamily: font.title,
        fontWeight: 800,
        fontSize: 40,
        padding: "16px 26px",
        borderRadius: 22,
        boxShadow: "0 8px 0 rgba(0,0,0,0.35)",
        maxWidth: 460,
        textAlign: "center",
        lineHeight: 1.15,
      }}
    >
      {text}
      <div
        style={{
          position: "absolute",
          bottom: -22,
          [tail === "izq" ? "left" : "right"]: 40,
          width: 0,
          height: 0,
          borderLeft: "16px solid transparent",
          borderRight: "16px solid transparent",
          borderTop: `24px solid ${color.text}`,
        }}
      />
    </div>
  );
};

// ── Panel genérico ───────────────────────────────────────────
export const Panel: React.FC<{ style?: React.CSSProperties; children: React.ReactNode; edge?: string }> = ({ style, children, edge }) => (
  <div
    style={{
      background: color.panel,
      border: `3px solid ${edge ?? color.panelEdge}`,
      borderRadius: 26,
      boxShadow: "0 14px 0 rgba(0,0,0,0.35)",
      ...style,
    }}
  >
    {children}
  </div>
);

// ── Recibo / factura ─────────────────────────────────────────
export const Receipt: React.FC<{ x: number; y: number; titulo?: string; lineas: string[]; total: string; delay?: number }> = ({
  x,
  y,
  titulo = "RECIBO",
  lineas,
  total,
  delay = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, delay);
  const zig = Array.from({ length: 17 })
    .map((_, i) => `${100 - (i / 16) * 100}% ${i % 2 ? 100 : 96.5}%`)
    .join(", ");
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 330,
        transform: `translateX(-50%) rotate(${-4 + (1 - p) * 10}deg) scale(${p})`,
        background: "#F3EFE6",
        color: "#1A1A1A",
        padding: "26px 28px 44px",
        fontFamily: font.mono,
        fontSize: 24,
        clipPath: `polygon(0 0, 100% 0, ${zig})`,
        boxShadow: "0 12px 0 rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ fontWeight: 700, letterSpacing: 3, fontSize: 22, borderBottom: "3px dashed #999", paddingBottom: 10, marginBottom: 12 }}>
        {titulo}
      </div>
      {lineas.map((l, i) => {
        const o = ease(frame, delay + 8 + i * 6, 8);
        return (
          <div key={i} style={{ opacity: o, display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            {l.split("|").map((part, j) => (
              <span key={j}>{part.trim()}</span>
            ))}
          </div>
        );
      })}
      <div
        style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: "3px dashed #999",
          display: "flex",
          justifyContent: "space-between",
          fontWeight: 700,
          fontSize: 30,
          color: "#C2412A",
          opacity: ease(frame, delay + 10 + lineas.length * 6, 8),
        }}
      >
        <span>TOTAL</span>
        <span>{total}</span>
      </div>
    </div>
  );
};

// ── Pila de mensajes de chat ─────────────────────────────────
export const ChatStack: React.FC<{ x: number; y: number; mensajes: string[]; visibles: number; width?: number }> = ({
  x,
  y,
  mensajes,
  visibles,
  width = 420,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, width, display: "flex", flexDirection: "column", gap: 12 }}>
      {mensajes.slice(0, Math.max(0, Math.ceil(visibles))).map((m, i) => {
        const user = i % 2 === 0;
        const isLast = i === Math.ceil(visibles) - 1;
        const o = isLast ? Math.min(1, (visibles - i) * 1.4 + 0.15) : 1;
        return (
          <div
            key={i}
            style={{
              alignSelf: user ? "flex-start" : "flex-end",
              maxWidth: "86%",
              background: user ? color.text : color.panel,
              color: user ? color.ink : color.text,
              border: user ? "none" : `3px solid ${color.panelEdge}`,
              borderRadius: 20,
              padding: "12px 20px",
              fontFamily: font.title,
              fontWeight: 700,
              fontSize: 34,
              opacity: o,
              transform: `translateY(${(1 - o) * 30}px)`,
              boxShadow: "0 6px 0 rgba(0,0,0,0.3)",
            }}
          >
            {m}
          </div>
        );
      })}
      <div style={{ display: "none" }}>{frame}</div>
    </div>
  );
};

// ── Laptop con terminal ──────────────────────────────────────
export const Laptop: React.FC<{ x: number; y: number; lineas: string[]; progreso: number; etiqueta?: string; scale?: number }> = ({
  x,
  y,
  lineas,
  progreso,
  etiqueta,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const total = lineas.join("\n").length;
  let remaining = Math.floor(total * progreso);
  const shown = lineas.map((l) => {
    const take = Math.max(0, Math.min(l.length, remaining));
    remaining -= l.length + 1;
    return l.slice(0, take);
  });
  const cursorOn = Math.floor(frame / 8) % 2 === 0;
  const w = 560 * scale;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w }}>
      <div
        style={{
          height: 330 * scale,
          background: "#1B2422",
          borderRadius: 18 * scale,
          padding: 16 * scale,
          boxShadow: "0 10px 0 rgba(0,0,0,0.35)",
          border: `3px solid #2E3C38`,
        }}
      >
        <div style={{ height: "100%", background: "#060B0A", borderRadius: 10 * scale, padding: `${18 * scale}px ${22 * scale}px`, position: "relative" }}>
          {etiqueta && (
            <div style={{ position: "absolute", right: 16 * scale, top: 12 * scale, fontFamily: font.mono, fontSize: 18 * scale, color: color.muted, letterSpacing: 2 }}>
              {etiqueta}
            </div>
          )}
          {shown.map((l, i) => (
            <div key={i} style={{ fontFamily: font.mono, fontWeight: 500, fontSize: 26 * scale, color: l.startsWith(">") ? color.lime : color.text, lineHeight: 1.5, whiteSpace: "pre" }}>
              {l}
              {i === shown.findIndex((s, k) => s.length < lineas[k].length) && cursorOn ? "▌" : ""}
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 22 * scale, margin: `0 ${-30 * scale}px`, background: "#2E3C38", borderRadius: `0 0 ${16 * scale}px ${16 * scale}px` }} />
    </div>
  );
};

// ── Monedas ──────────────────────────────────────────────────
export const Coins: React.FC<{ x: number; y: number; n?: number; delay?: number; simbolo?: string }> = ({ x, y, n = 6, delay = 0, simbolo = "$" }) => {
  const frame = useCurrentFrame();
  return (
    <svg style={{ position: "absolute", left: x - 120, top: y - 240, overflow: "visible" }} width={240} height={260}>
      {Array.from({ length: n }).map((_, i) => {
        const start = delay + i * 6;
        const drop = interpolate(frame, [start, start + 12], [-220, 0], clamp01);
        const cy = 230 - i * 22 + drop;
        return (
          <g key={i} opacity={frame >= start ? 1 : 0}>
            <ellipse cx={120} cy={cy + 10} rx={70} ry={20} fill={shade(color.lime, -0.45)} />
            <rect x={50} y={cy - 2} width={140} height={12} fill={shade(color.lime, -0.3)} />
            <ellipse cx={120} cy={cy - 2} rx={70} ry={20} fill={color.lime} />
            <text x={120} y={cy + 7} textAnchor="middle" fontFamily={font.mono} fontWeight={700} fontSize={22} fill={color.ink}>
              {simbolo}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Pila de documentos ───────────────────────────────────────
export const Docs: React.FC<{ x: number; y: number; n?: number; delay?: number }> = ({ x, y, n = 5, delay = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <svg style={{ position: "absolute", left: x - 140, top: y - 300, overflow: "visible" }} width={280} height={320}>
      {Array.from({ length: n }).map((_, i) => {
        const o = ease(frame, delay + i * 5, 8);
        const rot = [-6, 4, -2, 7, -4, 3][i % 6];
        return (
          <g key={i} opacity={o} transform={`translate(${140 + (i % 2 ? 10 : -10)} ${280 - i * 26 - (1 - o) * 40}) rotate(${rot})`}>
            <Block x={-80} y={-100} w={160} h={100} d={6} c="#ECE7DC" />
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={-62} y={-82 + k * 18} width={k === 3 ? 70 : 124} height={7} fill="#B9B3A6" />
            ))}
          </g>
        );
      })}
    </svg>
  );
};

// ── Display digital (contadores) ─────────────────────────────
export const Display: React.FC<{ x: number; y: number; etiqueta: string; valor: string; c?: string; scale?: number }> = ({
  x,
  y,
  etiqueta,
  valor,
  c = color.lime,
  scale = 1,
}) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${scale})`, transformOrigin: "50% 0" }}>
    <Panel style={{ padding: "22px 46px 28px", minWidth: 520, textAlign: "center" }} edge={c}>
      <div style={{ fontFamily: font.mono, fontWeight: 500, fontSize: 26, letterSpacing: 5, color: color.muted, textTransform: "uppercase" }}>{etiqueta}</div>
      <div
        style={{
          fontFamily: font.mono,
          fontWeight: 700,
          fontSize: 132,
          color: c,
          lineHeight: 1.05,
          textShadow: `0 0 28px ${c}66`,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {valor}
      </div>
    </Panel>
  </div>
);

// ── Tarjeta de icono grande ──────────────────────────────────
export const IconCard: React.FC<{ x: number; y: number; texto: string; sub?: string; delay?: number }> = ({ x, y, texto, sub, delay = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, delay);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${p})` }}>
      <Panel style={{ padding: "26px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: font.title, fontWeight: 800, fontSize: 92, color: color.lime, lineHeight: 1 }}>{texto}</div>
        {sub && <div style={{ fontFamily: font.mono, fontSize: 24, letterSpacing: 4, color: color.muted, marginTop: 10, textTransform: "uppercase" }}>{sub}</div>}
      </Panel>
    </div>
  );
};
