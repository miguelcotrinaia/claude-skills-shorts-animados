import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { color, layout, lienzo } from "../theme";

/** Color de fondo del ambiente (fijo, fuera de la cámara) */
export const Fondo: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 38%, ${color.bg} 0%, ${color.bg} 55%, ${color.bgDeep} 100%)` }} />
);

/** Cuadrícula, partículas y piso. Va dentro del "mundo": se mueve con la cámara. */
export const Escenario: React.FC<{ floor?: boolean }> = ({ floor = true }) => {
  const frame = useCurrentFrame();
  const dots = React.useMemo(
    () =>
      Array.from({ length: 34 }).map((_, i) => ({
        x: random(`x${i}`),
        y: random(`y${i}`),
        r: 1.2 + random(`r${i}`) * 2.4,
        s: 0.15 + random(`s${i}`) * 0.5,
        o: 0.15 + random(`o${i}`) * 0.35,
      })),
    []
  );
  return (
    <AbsoluteFill>
      {/* cuadrícula tipo plano de arquitecto */}
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
      <svg width={lienzo.W} height={lienzo.H} style={{ position: "absolute" }}>
        {dots.map((d, i) => {
          const y = (((d.y * lienzo.H - frame * d.s * 2) % lienzo.H) + lienzo.H) % lienzo.H;
          return <circle key={i} cx={d.x * lienzo.W} cy={y} r={d.r} fill={color.lime} opacity={d.o * 0.5} />;
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
    </AbsoluteFill>
  );
};

/** Viñeta suave en los bordes (fija) */
export const Vineta: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, transparent 50%, ${color.vineta} 100%)`, pointerEvents: "none" }} />
);

/** Fondo completo sin cámara (hoja de personajes, ambientes) */
export const Background: React.FC<{ floor?: boolean }> = ({ floor = true }) => (
  <AbsoluteFill>
    <Fondo />
    <Escenario floor={floor} />
    <Vineta />
  </AbsoluteFill>
);
