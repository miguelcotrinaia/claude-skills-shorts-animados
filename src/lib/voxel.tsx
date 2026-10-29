import React from "react";

// Primitiva "bloque voxel": cara frontal + cara lateral derecha + cara superior.
// Todos los personajes y varios props se construyen apilando bloques.

export const K = 0.55; // cuánto "sube" la profundidad (proyección oblicua)

const clamp = (n: number, a = 0, b = 255) => Math.max(a, Math.min(b, n));

export const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

/** amt > 0 aclara, amt < 0 oscurece (rango -1..1) */
export const shade = (hex: string, amt: number) => {
  if (!hex.startsWith("#")) return hex;
  const { r, g, b } = hexToRgb(hex);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const mix = (c: number) => Math.round(clamp(c + (t - c) * p));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
};

export type BlockProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  d?: number;
  c: string;
  top?: string | false;
  side?: string | false;
  opacity?: number;
  rx?: number;
};

export const Block: React.FC<BlockProps> = ({ x, y, w, h, d = 0, c, top, side, opacity, rx = 0 }) => {
  const dy = d * K;
  const topC = top === undefined ? shade(c, 0.16) : top;
  const sideC = side === undefined ? shade(c, -0.28) : side;
  return (
    <g opacity={opacity}>
      {d > 0 && topC !== false && (
        <polygon points={`${x},${y} ${x + d},${y - dy} ${x + w + d},${y - dy} ${x + w},${y}`} fill={topC} />
      )}
      {d > 0 && sideC !== false && (
        <polygon
          points={`${x + w},${y} ${x + w + d},${y - dy} ${x + w + d},${y + h - dy} ${x + w},${y + h}`}
          fill={sideC}
        />
      )}
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={c} />
    </g>
  );
};

/** Sombra elíptica bajo los pies */
export const Shadow: React.FC<{ w?: number; opacity?: number }> = ({ w = 120, opacity = 0.45 }) => (
  <ellipse cx={8} cy={2} rx={w / 2} ry={w * 0.09} fill="#000" opacity={opacity} />
);
