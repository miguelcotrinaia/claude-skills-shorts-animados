import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { pop } from "../lib/anim";

// Coloca cualquier personaje en el lienzo: (x, y) = punto entre los pies.

export type ActorProps = {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  enter?: "pop" | "none" | "izquierda" | "derecha" | "abajo";
  delay?: number;
  children: React.ReactNode;
  /** caja local del SVG (unidades del personaje) */
  box?: { x: number; y: number; w: number; h: number };
  style?: React.CSSProperties;
};

export const Actor: React.FC<ActorProps> = ({
  x,
  y,
  scale = 2.0,
  flip = false,
  enter = "pop",
  delay = 0,
  children,
  box = { x: -130, y: -250, w: 280, h: 262 },
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter === "none" ? 1 : pop(frame, fps, delay);
  const W = box.w * scale;
  const Hh = box.h * scale;
  let tx = 0;
  let ty = 0;
  let s = 1;
  if (enter === "pop") s = 0.2 + 0.8 * p;
  if (enter === "izquierda") tx = (1 - p) * -700;
  if (enter === "derecha") tx = (1 - p) * 700;
  if (enter === "abajo") ty = (1 - p) * 500;
  return (
    <div
      style={{
        position: "absolute",
        left: x + box.x * scale,
        top: y + box.y * scale,
        width: W,
        height: Hh,
        transform: `translate(${tx}px, ${ty}px) scale(${s})`,
        transformOrigin: `${-box.x * scale}px ${-box.y * scale}px`,
        opacity: enter === "pop" ? Math.min(1, p * 3) : 1,
        ...style,
      }}
    >
      <svg
        width={W}
        height={Hh}
        viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
        style={{ overflow: "visible" }}
      >
        <g transform={flip ? "scale(-1 1)" : undefined}>{children}</g>
      </svg>
    </div>
  );
};
