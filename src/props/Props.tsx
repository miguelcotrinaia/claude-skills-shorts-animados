import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp01, ease, pop } from "../lib/anim";
import { Block, shade } from "../lib/voxel";
import { color, font } from "../theme";
import { textoSobre } from "../engine/ambientes";
import type { Icono as IconoId } from "../engine/types";

// Objetos de escena (v2). Se colocan en flujo dentro de la "zona" del encuadre (sin coordenadas fijas).

// ── Globo de diálogo (coordenadas del mundo) ────────────────
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
        color: textoSobre(color.text),
        fontFamily: font.title,
        fontWeight: 800,
        fontSize: 40,
        padding: "16px 26px",
        borderRadius: 22,
        boxShadow: `0 8px 0 ${color.sombra}`,
        width: "max-content",
        maxWidth: 440,
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
      boxShadow: `0 14px 0 ${color.sombra}`,
      ...style,
    }}
  >
    {children}
  </div>
);

// ── Recibo / factura ─────────────────────────────────────────
export const Receipt: React.FC<{ titulo?: string; lineas: string[]; total: string; delay?: number }> = ({ titulo = "RECIBO", lineas, total, delay = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, delay);
  const zig = Array.from({ length: 17 })
    .map((_, i) => `${100 - (i / 16) * 100}% ${i % 2 ? 100 : 96.5}%`)
    .join(", ");
  return (
    <div
      style={{
        width: 360,
        transform: `rotate(${-4 + (1 - p) * 10}deg) scale(${p})`,
        background: "#F3EFE6",
        color: "#1A1A1A",
        padding: "26px 28px 44px",
        fontFamily: font.mono,
        fontSize: 24,
        clipPath: `polygon(0 0, 100% 0, ${zig})`,
        boxShadow: `0 12px 0 ${color.sombra}`,
        border: "2px solid rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontWeight: 700, letterSpacing: 3, fontSize: 22, borderBottom: "3px dashed #999", paddingBottom: 10, marginBottom: 12 }}>{titulo}</div>
      {lineas.map((l, i) => {
        const o = ease(frame, delay + 8 + i * 6, 8);
        return (
          <div key={i} style={{ opacity: o, display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 16 }}>
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
export const ChatStack: React.FC<{ mensajes: string[]; visibles: number; width?: number; size?: number }> = ({ mensajes, visibles, width = 600, size = 36 }) => (
  <div style={{ width, display: "flex", flexDirection: "column", gap: 14 }}>
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
            color: user ? textoSobre(color.text) : color.text,
            border: user ? "none" : `3px solid ${color.panelEdge}`,
            borderRadius: 22,
            padding: "12px 22px",
            fontFamily: font.title,
            fontWeight: 700,
            fontSize: size,
            lineHeight: 1.2,
            opacity: o,
            transform: `translateY(${(1 - o) * 30}px)`,
            boxShadow: `0 6px 0 ${color.sombra}`,
          }}
        >
          {m}
        </div>
      );
    })}
  </div>
);

// ── Laptop con terminal ──────────────────────────────────────
export const Laptop: React.FC<{ lineas: string[]; progreso: number; etiqueta?: string; width?: number }> = ({ lineas, progreso, etiqueta, width = 580 }) => {
  const frame = useCurrentFrame();
  const scale = width / 560;
  const total = lineas.join("\n").length;
  let remaining = Math.floor(total * progreso);
  const shown = lineas.map((l) => {
    const take = Math.max(0, Math.min(l.length, remaining));
    remaining -= l.length + 1;
    return l.slice(0, take);
  });
  const cursorOn = Math.floor(frame / 8) % 2 === 0;
  const cursorAt = shown.findIndex((s, k) => s.length < lineas[k].length);
  return (
    <div style={{ width }}>
      <div
        style={{
          height: 330 * scale,
          background: "#1B2422",
          borderRadius: 18 * scale,
          padding: 16 * scale,
          boxShadow: `0 10px 0 ${color.sombra}`,
          border: `3px solid #2E3C38`,
        }}
      >
        <div style={{ height: "100%", background: "#060B0A", borderRadius: 10 * scale, padding: `${18 * scale}px ${22 * scale}px`, position: "relative", overflow: "hidden" }}>
          {etiqueta && (
            <div style={{ position: "absolute", right: 16 * scale, top: 12 * scale, fontFamily: font.mono, fontSize: 18 * scale, color: "#8FA39A", letterSpacing: 2 }}>{etiqueta}</div>
          )}
          {shown.map((l, i) => (
            <div key={i} style={{ fontFamily: font.mono, fontWeight: 500, fontSize: 26 * scale, color: l.startsWith(">") ? "#C8F25A" : "#EEF3EA", lineHeight: 1.5, whiteSpace: "pre" }}>
              {l}
              {i === cursorAt && cursorOn ? "▌" : ""}
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 22 * scale, margin: `0 ${-30 * scale}px`, background: "#2E3C38", borderRadius: `0 0 ${16 * scale}px ${16 * scale}px` }} />
    </div>
  );
};

// ── Monedas ──────────────────────────────────────────────────
export const Coins: React.FC<{ n?: number; delay?: number; simbolo?: string }> = ({ n = 6, delay = 0, simbolo = "$" }) => {
  const frame = useCurrentFrame();
  return (
    <svg style={{ overflow: "visible" }} width={240} height={260}>
      {Array.from({ length: n }).map((_, i) => {
        const start = delay + i * 6;
        const drop = interpolate(frame, [start, start + 12], [-220, 0], clamp01);
        const cy = 230 - i * 22 + drop;
        return (
          <g key={i} opacity={frame >= start ? 1 : 0}>
            <ellipse cx={120} cy={cy + 10} rx={70} ry={20} fill={shade("#FFC24B", -0.45)} />
            <rect x={50} y={cy - 2} width={140} height={12} fill={shade("#FFC24B", -0.3)} />
            <ellipse cx={120} cy={cy - 2} rx={70} ry={20} fill="#FFC24B" />
            <text x={120} y={cy + 7} textAnchor="middle" fontFamily={font.mono} fontWeight={700} fontSize={22} fill="#3A2A08">
              {simbolo}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Pila de documentos ───────────────────────────────────────
export const Docs: React.FC<{ n?: number; delay?: number }> = ({ n = 5, delay = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <svg style={{ overflow: "visible" }} width={280} height={300}>
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
export const Display: React.FC<{ etiqueta: string; valor: string; c?: string; scale?: number }> = ({ etiqueta, valor, c = color.lime, scale = 1 }) => (
  <div style={{ transform: `scale(${scale})`, transformOrigin: "50% 50%" }}>
    <Panel style={{ padding: "22px 40px 28px", minWidth: 480, maxWidth: 640, textAlign: "center" }} edge={c}>
      <div style={{ fontFamily: font.mono, fontWeight: 500, fontSize: 26, letterSpacing: 3, color: color.muted, textTransform: "uppercase" }}>{etiqueta}</div>
      <div
        style={{
          fontFamily: font.mono,
          fontWeight: 700,
          fontSize: 132,
          color: c,
          lineHeight: 1.05,
          textShadow: `0 0 28px ${c}55`,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {valor}
      </div>
    </Panel>
  </div>
);

// ── Tarjeta de texto grande ──────────────────────────────────
export const IconCard: React.FC<{ texto: string; sub?: string; delay?: number }> = ({ texto, sub, delay = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, delay);
  return (
    <div style={{ transform: `scale(${p})` }}>
      <Panel style={{ padding: "26px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: font.title, fontWeight: 800, fontSize: 92, color: color.lime, lineHeight: 1 }}>{texto}</div>
        {sub && <div style={{ fontFamily: font.mono, fontSize: 24, letterSpacing: 4, color: color.muted, marginTop: 10, textTransform: "uppercase" }}>{sub}</div>}
      </Panel>
    </div>
  );
};

// ── Iconos voxel ─────────────────────────────────────────────
// Caja de dibujo 120×120 (el bloque sobresale un poco arriba a la derecha por la profundidad).
const PAPEL = "#F1ECE2";
const METAL = "#8C9A96";
const OSCURO = "#25312E";

const IconoSvg: React.FC<{ id: IconoId; acento: string; frame: number }> = ({ id, acento, frame }) => {
  const blink = Math.floor(frame / 12) % 2 === 0;
  switch (id) {
    case "doc":
      return (
        <g>
          <Block x={22} y={14} w={70} h={92} d={12} c={PAPEL} />
          <polygon points="72,14 92,14 92,34" fill={shade(PAPEL, -0.2)} />
          {[0, 1, 2, 3, 4].map((k) => (
            <rect key={k} x={32} y={36 + k * 13} width={k === 4 ? 30 : 50} height={6} fill={k === 0 ? acento : "#B9B3A6"} />
          ))}
        </g>
      );
    case "db":
      return (
        <g>
          {[2, 1, 0].map((k) => {
            const y = 34 + k * 26;
            return (
              <g key={k}>
                <rect x={22} y={y} width={76} height={24} fill={shade(acento, -0.25 - k * 0.05)} />
                <ellipse cx={60} cy={y + 24} rx={38} ry={10} fill={shade(acento, -0.35)} />
                <ellipse cx={60} cy={y} rx={38} ry={10} fill={shade(acento, 0.12 - k * 0.04)} />
              </g>
            );
          })}
        </g>
      );
    case "nube":
      return (
        <g>
          <Block x={18} y={58} w={84} h={30} d={10} c="#E8EEF2" />
          <Block x={30} y={40} w={34} h={20} d={10} c="#E8EEF2" />
          <Block x={56} y={30} w={34} h={30} d={10} c="#F4F7F9" />
          <rect x={30} y={70} width={60} height={6} fill={acento} />
        </g>
      );
    case "chip":
      return (
        <g>
          {[0, 1, 2, 3].map((k) => (
            <g key={k}>
              <rect x={30 + k * 17} y={14} width={6} height={14} fill={METAL} />
              <rect x={30 + k * 17} y={92} width={6} height={14} fill={METAL} />
              <rect x={14} y={30 + k * 17} width={14} height={6} fill={METAL} />
              <rect x={92} y={30 + k * 17} width={14} height={6} fill={METAL} />
            </g>
          ))}
          <Block x={26} y={26} w={68} h={68} d={10} c={OSCURO} />
          <Block x={42} y={42} w={36} h={36} d={6} c={acento} />
        </g>
      );
    case "usuario":
      return (
        <g>
          <Block x={42} y={14} w={36} h={36} d={12} c="#D9A27C" />
          <Block x={26} y={58} w={68} h={48} d={14} c={acento} />
        </g>
      );
    case "servidor":
      return (
        <g>
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <Block x={22} y={18 + k * 30} w={76} h={26} d={12} c={OSCURO} />
              <rect x={30} y={28 + k * 30} width={8} height={6} fill={k === 1 && !blink ? shade(acento, -0.5) : acento} />
              <rect x={44} y={29 + k * 30} width={40} height={4} fill={METAL} />
            </g>
          ))}
        </g>
      );
    case "robot":
      return (
        <g>
          <rect x={58} y={8} width={4} height={14} fill={METAL} />
          <circle cx={60} cy={8} r={5} fill={acento} />
          <Block x={24} y={22} w={72} h={60} d={12} c="#D7DEDB" />
          <rect x={34} y={34} width={52} height={30} rx={6} fill={OSCURO} />
          <rect x={44} y={42} width={10} height={blink ? 12 : 3} fill={acento} />
          <rect x={66} y={42} width={10} height={blink ? 12 : 3} fill={acento} />
          <Block x={36} y={86} w={48} h={20} d={8} c={METAL} />
        </g>
      );
    case "app":
      return (
        <g>
          <Block x={16} y={20} w={88} h={80} d={12} c={PAPEL} />
          <rect x={16} y={20} width={88} height={16} fill={acento} />
          <rect x={26} y={46} width={30} height={22} fill="#C9C3B6" />
          <rect x={62} y={46} width={32} height={6} fill="#B9B3A6" />
          <rect x={62} y={58} width={24} height={6} fill="#B9B3A6" />
          <rect x={26} y={76} width={68} height={14} rx={4} fill={shade(acento, -0.2)} />
        </g>
      );
    case "candado":
      return (
        <g>
          <path d="M40 54 V36 a20 20 0 0 1 40 0 V54" fill="none" stroke={METAL} strokeWidth={10} />
          <Block x={26} y={52} w={68} h={54} d={12} c={acento} />
          <rect x={56} y={68} width={8} height={18} fill={OSCURO} />
        </g>
      );
    case "lupa":
      return (
        <g>
          <rect x={70} y={70} width={14} height={40} transform="rotate(-45 77 90)" fill={OSCURO} />
          <circle cx={52} cy={50} r={32} fill={shade(acento, 0.55)} stroke={OSCURO} strokeWidth={10} />
          <rect x={36} y={36} width={12} height={6} fill="#FFFFFF" opacity={0.7} />
        </g>
      );
    case "alerta":
      return (
        <g>
          <polygon points="60,10 112,104 8,104" fill="#FFC24B" stroke="#3A2A08" strokeWidth={4} strokeLinejoin="round" />
          <rect x={54} y={40} width={12} height={36} fill="#3A2A08" />
          <rect x={54} y={84} width={12} height={12} fill="#3A2A08" />
        </g>
      );
    case "check":
      return (
        <g>
          <Block x={18} y={18} w={84} h={84} d={12} c={acento} rx={0} />
          <polyline points="36,62 54,80 86,42" fill="none" stroke={textoSobre(acento)} strokeWidth={12} strokeLinecap="square" />
        </g>
      );
  }
};

/** Icono voxel. `size` = lado en px. */
export const Icono: React.FC<{ id: IconoId; size?: number; acento?: string; frame?: number }> = ({ id, size = 120, acento = color.lime, frame }) => {
  const f = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ overflow: "visible", flexShrink: 0 }}>
      <IconoSvg id={id} acento={acento} frame={frame ?? f} />
    </svg>
  );
};

/** Objeto grande con etiqueta (prop "objeto") */
export const ObjetoGrande: React.FC<{ icono: IconoId; etiqueta?: string; delay?: number }> = ({ icono, etiqueta, delay = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, delay);
  const flota = Math.sin(frame / 14) * 6;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, transform: `translateY(${flota}px) scale(${p})` }}>
      <Icono id={icono} size={230} />
      {etiqueta && (
        <div
          style={{
            fontFamily: font.mono,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: 4,
            color: color.text,
            background: color.panel,
            border: `3px solid ${color.panelEdge}`,
            padding: "8px 20px",
            borderRadius: 14,
            textTransform: "uppercase",
          }}
        >
          {etiqueta}
        </div>
      )}
    </div>
  );
};
