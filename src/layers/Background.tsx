import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { color, layout } from "../theme";

export const Background: React.FC<{ floor?: boolean }> = ({ floor = true }) => {
  const frame = useCurrentFrame();
  const dots = React.useMemo(
    () =>
      Array.from({ length: 34 }).map((_, i) => ({
        x: random(`x${i}`) * 1080,
        y: random(`y${i}`) * 1920,
        r: 1.2 + random(`r${i}`) * 2.4,
        s: 0.15 + random(`s${i}`) * 0.5,
        o: 0.15 + random(`o${i}`) * 0.35,
      })),
    []
  );
  return (
    <AbsoluteFill style={{ backgroundColor: color.bg }}>
      {/* cuadrícula de fondo */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${color.grid} 2px, transparent 2px), linear-gradient(90deg, ${color.grid} 2px, transparent 2px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: "-2px -2px",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${color.gridFine} 1px, transparent 1px), linear-gradient(90deg, ${color.gridFine} 1px, transparent 1px)`,
          backgroundSize: "15px 15px",
        }}
      />
      {/* partículas */}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {dots.map((d, i) => {
          const y = (d.y - frame * d.s * 2 + 1920) % 1920;
          return <circle key={i} cx={d.x} cy={y} r={d.r} fill={color.lime} opacity={d.o * 0.6} />;
        })}
      </svg>
      {floor && (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: layout.floorY,
              bottom: 0,
              background: `linear-gradient(180deg, ${color.floor} 0%, ${color.bgDeep} 70%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: layout.floorY - 1,
              height: 3,
              background: `linear-gradient(90deg, transparent, ${color.floorLine} 20%, ${color.floorLine} 80%, transparent)`,
            }}
          />
        </>
      )}
      {/* viñeta */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 42%, transparent 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
