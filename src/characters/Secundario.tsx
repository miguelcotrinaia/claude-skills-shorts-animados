import React from "react";
import { Block, K, Shadow, shade } from "../lib/voxel";
import { blink, bob, talk } from "../lib/anim";
import { color } from "../theme";
import { PERSONAJES, type BaseRobot } from "../perfiles";
import { Human, type Arms, type Expression } from "./Human";

// Personaje secundario. Su forma sale de perfiles/personajes.json → secundario.tipo:
//   "robot"  → robot voxel con pantalla-cara (base: orugas, ruedas o flotante)
//   "foco"   → foco de luz con cara y brazos
//   "humano" → otra persona (usa el mismo humano voxel que el principal)

export type SecExpression =
  | "neutral"
  | "feliz"
  | "sorprendido"
  | "enojado"
  | "pensando"
  | "cargando"
  | "error"
  | "triste"
  | "corazon";

export type SecArms = "abajo" | "saludo" | "senalar" | "celebrar" | "sostener" | "escribir" | "explicar";

export type SecProps = {
  frame: number;
  expression?: SecExpression;
  arms?: SecArms;
  speaking?: boolean;
  moving?: boolean;
  seed?: number;
};

const angles = (arms: SecArms, f: number): [number, number] => {
  const s = Math.sin(f / 7);
  switch (arms) {
    case "saludo":
      return [8, -148 + s * 18];
    case "senalar":
      return [8, -90];
    case "celebrar":
      return [156 + s * 8, -156 - s * 8];
    case "sostener":
      return [56, -56];
    case "escribir":
      return [52 + Math.sin(f / 2) * 8, -52 - Math.cos(f / 2) * 8];
    case "explicar":
      return [36 + s * 10, -50 - Math.sin(f / 9) * 14];
    default:
      return [6 + Math.sin(f / 21) * 3, -6 - Math.sin(f / 21) * 3];
  }
};

const GlowDefs: React.FC = () => (
  <defs>
    <filter id="secGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.2" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="secHalo" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="18" />
    </filter>
  </defs>
);

/** Ojos según expresión. `tinta` = color de los ojos; `brillo` = con resplandor (LED). */
const Ojos: React.FC<{ e: SecExpression; ey: number; f: number; tinta: string; brillo: boolean; ancho?: number }> = ({
  e,
  ey,
  f,
  tinta,
  brillo,
  ancho = 20,
}) => {
  const eye = e === "cargando" || e === "error" ? 1 : blink(f, 3);
  const filter = brillo ? "url(#secGlow)" : undefined;
  const a = ancho; // separación de los ojos al centro
  switch (e) {
    case "feliz":
      return (
        <g fill="none" stroke={tinta} strokeWidth={6} filter={filter}>
          <polyline points={`${-a - 10},${ey + 5} ${-a},${ey - 5} ${-a + 10},${ey + 5}`} />
          <polyline points={`${a - 10},${ey + 5} ${a},${ey - 5} ${a + 10},${ey + 5}`} />
        </g>
      );
    case "sorprendido":
      return (
        <g fill={tinta} filter={filter}>
          <rect x={-a - 10} y={ey - 12} width={20} height={22} rx={3} />
          <rect x={a - 10} y={ey - 12} width={20} height={22} rx={3} />
          {!brillo && (
            <>
              <rect x={-a - 6} y={ey - 8} width={6} height={6} fill="#fff" />
              <rect x={a - 6} y={ey - 8} width={6} height={6} fill="#fff" />
            </>
          )}
        </g>
      );
    case "enojado":
      return (
        <g fill={tinta} filter={filter}>
          <polygon points={`${-a - 12},${ey - 8} ${-a + 10},${ey} ${-a + 10},${ey + 8} ${-a - 12},${ey + 8}`} />
          <polygon points={`${a + 12},${ey - 8} ${a - 10},${ey} ${a - 10},${ey + 8} ${a + 12},${ey + 8}`} />
        </g>
      );
    case "pensando":
      return (
        <g fill={tinta} filter={filter}>
          <rect x={-a - 8} y={ey - 2} width={16} height={6} />
          <rect x={a - 8} y={ey - 12} width={14} height={18 * eye} />
        </g>
      );
    case "cargando": {
      const t = Math.floor(f / 6) % 3;
      return (
        <g fill={tinta} filter={filter}>
          {[-a, 0, a].map((x, i) => (
            <rect key={x} x={x - 5} y={ey - 5} width={10} height={10} opacity={i === t ? 1 : 0.3} />
          ))}
        </g>
      );
    }
    case "error":
      return (
        <g stroke={color.coral} strokeWidth={6} filter={filter}>
          <line x1={-a - 10} y1={ey - 8} x2={-a + 8} y2={ey + 8} />
          <line x1={-a + 8} y1={ey - 8} x2={-a - 10} y2={ey + 8} />
          <line x1={a - 8} y1={ey - 8} x2={a + 10} y2={ey + 8} />
          <line x1={a + 10} y1={ey - 8} x2={a - 8} y2={ey + 8} />
        </g>
      );
    case "triste":
      return (
        <g fill={tinta} filter={filter}>
          <polygon points={`${-a - 10},${ey - 2} ${-a + 8},${ey - 8} ${-a + 8},${ey + 6} ${-a - 10},${ey + 6}`} />
          <polygon points={`${a + 10},${ey - 2} ${a - 8},${ey - 8} ${a - 8},${ey + 6} ${a + 10},${ey + 6}`} />
        </g>
      );
    case "corazon":
      return (
        <g fill={color.coral} filter={filter}>
          {[-a, a].map((x) => (
            <path key={x} d={`M${x},${ey + 8} l-10,-10 a5,5 0 0,1 10,-6 a5,5 0 0,1 10,6 z`} />
          ))}
        </g>
      );
    default:
      return (
        <g fill={tinta} filter={filter}>
          <rect x={-a - 6} y={ey - 9 * eye} width={12} height={18 * eye} rx={2} />
          <rect x={a - 6} y={ey - 9 * eye} width={12} height={18 * eye} rx={2} />
        </g>
      );
  }
};

// ── Robot ────────────────────────────────────────────────────
const Robot: React.FC<SecProps & { body: string; led: string; base: BaseRobot }> = ({
  frame: f,
  expression = "neutral",
  arms = "abajo",
  speaking = false,
  moving = false,
  body,
  led,
  base,
  seed = 3,
}) => {
  const hover = bob(f, 40, 2.4, seed * 7);
  const [la, ra] = angles(arms, f);
  const d = 26;
  const pulse = 0.55 + Math.abs(Math.sin(f / 9)) * 0.45 + (speaking ? 0.3 : 0);
  const lift = base === "flotante" ? -18 + bob(f, 30, 5, seed) : 0;

  const Arm = ({ side, angle }: { side: "L" | "R"; angle: number }) => {
    const px = side === "L" ? -66 : 66;
    const py = -110;
    return (
      <g transform={`rotate(${angle} ${px} ${py})`}>
        <Block x={px - 8} y={py - 4} w={16} h={42} d={8} c={shade(body, -0.12)} />
        <Block x={px - 12} y={py + 36} w={24} h={8} d={8} c="#2B3138" />
        <rect x={px - 12} y={py + 44} width={6} height={10} fill="#2B3138" />
        <rect x={px + 6} y={py + 44} width={6} height={10} fill="#2B3138" />
      </g>
    );
  };

  const Mouth = () => {
    const my = -96;
    if (!speaking) return <rect x={-12} y={my - 1} width={24} height={3} fill={led} opacity={0.7} />;
    return (
      <g fill={led} filter="url(#secGlow)">
        {[-16, -8, 0, 8, 16].map((x, i) => {
          const h = 3 + Math.abs(Math.sin(f * 0.8 + i * 1.3)) * 12;
          return <rect key={x} x={x - 2.5} y={my - h / 2} width={5} height={h} />;
        })}
      </g>
    );
  };

  const wheelRot = moving ? f * 12 : 0;
  const treadShift = moving ? (f * 3) % 12 : 0;

  const Base = () => {
    if (base === "flotante") {
      const g = 0.5 + Math.abs(Math.sin(f / 5)) * 0.4;
      return (
        <g>
          <ellipse cx={8} cy={-6} rx={34} ry={7} fill={led} opacity={0.25 * g} filter="url(#secHalo)" />
          <g transform={`translate(0 ${lift})`}>
            <Block x={-26} y={-40} w={52} h={12} d={14} c="#2B3138" />
            <rect x={-16} y={-28} width={32} height={8} fill={led} opacity={g} filter="url(#secGlow)" />
          </g>
        </g>
      );
    }
    if (base === "ruedas") {
      return (
        <g>
          <Block x={-50} y={-34} w={100} h={14} d={18} c="#2B3138" />
          {[-34, 34].map((x) => (
            <g key={x} transform={`rotate(${wheelRot} ${x} -14)`}>
              <circle cx={x} cy={-14} r={16} fill="#1E2328" />
              <circle cx={x} cy={-14} r={9} fill="#3A424A" />
              <rect x={x - 1.5} y={-28} width={3} height={28} fill="#14181C" />
              <circle cx={x} cy={-14} r={3} fill={led} opacity={0.8} />
            </g>
          ))}
        </g>
      );
    }
    return (
      <g>
        <defs>
          <clipPath id="treadClip">
            <rect x={-60} y={-30} width={120} height={30} rx={14} />
          </clipPath>
        </defs>
        <polygon points={`60,-30 ${60 + 14},${-30 - 14 * K} ${60 + 14},${-14 * K} 60,0`} fill="#171B20" />
        <rect x={-60} y={-30} width={120} height={30} rx={14} fill="#22272D" />
        <g clipPath="url(#treadClip)">
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x={-66 + i * 12 + treadShift} y={-30} width={4} height={30} fill="#30373E" />
          ))}
        </g>
        {[-38, 0, 38].map((x) => (
          <g key={x} transform={`rotate(${wheelRot} ${x} -15)`}>
            <circle cx={x} cy={-15} r={10} fill="#3A424A" />
            <rect x={x - 1.5} y={-24} width={3} height={18} fill="#22272D" />
            <circle cx={x} cy={-15} r={3} fill={led} opacity={0.8} />
          </g>
        ))}
      </g>
    );
  };

  return (
    <g>
      <GlowDefs />
      <Shadow w={140} opacity={base === "flotante" ? 0.3 : 0.45} />
      <Base />
      <g transform={`translate(0 ${hover + lift})`}>
        <Block x={-14} y={-42} w={28} h={12} d={10} c="#2B3138" />
        <Arm side="L" angle={la} />
        <Block x={-58} y={-150} w={116} h={108} d={d} c={body} />
        <g transform={`translate(${d / 2} ${(-d * K) / 2})`}>
          <rect x={-3} y={-176} width={6} height={28} fill="#2B3138" />
          <circle cx={0} cy={-180} r={14} fill={led} opacity={0.18 * pulse} />
          <circle cx={0} cy={-180} r={8} fill={led} opacity={pulse} filter="url(#secGlow)" />
        </g>
        <Block x={-66} y={-118} w={8} h={20} d={0} c="#2B3138" />
        <rect x={-46} y={-140} width={92} height={58} rx={10} fill="#0A0D10" />
        <rect x={-46} y={-140} width={92} height={58} rx={10} fill="none" stroke={shade(body, -0.3)} strokeWidth={4} />
        <rect x={-40} y={-134} width={30} height={4} fill="#fff" opacity={0.08} />
        <Ojos e={expression} ey={-118} f={f} tinta={led} brillo />
        <Mouth />
        <rect x={-30} y={-74} width={60} height={22} rx={4} fill={shade(body, -0.22)} />
        {[0, 1, 2].map((i) => {
          const on = Math.floor((f + i * 7) / 12) % 3 === i;
          return <rect key={i} x={-22 + i * 16} y={-67} width={10} height={8} rx={2} fill={i === 2 ? color.coral : led} opacity={on ? 1 : 0.35} />;
        })}
        <Arm side="R" angle={ra} />
      </g>
    </g>
  );
};

// ── Foco ─────────────────────────────────────────────────────
const Foco: React.FC<SecProps & { glass: string; luz: string }> = ({
  frame: f,
  expression = "neutral",
  arms = "abajo",
  speaking = false,
  moving = false,
  glass,
  luz,
  seed = 3,
}) => {
  const hover = bob(f, 38, 2.6, seed * 7);
  const [la, ra] = angles(arms, f);
  const animado = expression === "feliz" || expression === "corazon" || expression === "sorprendido";
  const pulse = 0.55 + Math.abs(Math.sin(f / 9)) * 0.3 + (speaking ? 0.25 : 0) + (animado ? 0.15 : 0);
  const apagado = expression === "error" || expression === "triste";
  const tinta = "#3A2A08";
  const metal = "#9AA0AC";
  const brazo = "#4A505C";
  const paso = moving ? Math.sin(f / 3) * 5 : 0;

  const Arm = ({ side, angle }: { side: "L" | "R"; angle: number }) => {
    const px = side === "L" ? -66 : 68;
    const py = -134;
    return (
      <g transform={`rotate(${angle} ${px} ${py})`}>
        <Block x={px - 5} y={py - 2} w={10} h={40} d={6} c={brazo} />
        <Block x={px - 10} y={py + 36} w={20} h={16} d={8} c={shade(brazo, 0.15)} />
      </g>
    );
  };

  const mouthOpen = talk(f, speaking);
  const Mouth = () => {
    const my = -110;
    if (mouthOpen > 0.05) {
      const h = 3 + mouthOpen * 10;
      return <rect x={-11} y={my - 1} width={22} height={h} fill={tinta} />;
    }
    if (expression === "feliz" || expression === "corazon") {
      return <polyline points={`-12,${my} 0,${my + 7} 12,${my}`} fill="none" stroke={tinta} strokeWidth={5} />;
    }
    if (expression === "sorprendido") return <rect x={-6} y={my - 3} width={12} height={12} fill={tinta} />;
    if (expression === "triste" || expression === "error") return <polyline points={`-10,${my + 6} 0,${my} 10,${my + 6}`} fill="none" stroke={tinta} strokeWidth={5} />;
    return <rect x={-9} y={my} width={18} height={4} fill={tinta} />;
  };

  // destellos alrededor ("chispas")
  const Chispas = () => {
    if (apagado) return null;
    const pts = [
      [-92, -196, 0],
      [104, -214, 9],
      [118, -128, 17],
    ];
    return (
      <g fill={luz}>
        {pts.map(([x, y, ph], i) => {
          const o = (Math.sin((f + ph) / 6) + 1) / 2;
          const s = 6 + o * 6 + (speaking ? 3 : 0);
          return (
            <polygon
              key={i}
              points={`${x},${y - s} ${x + s * 0.35},${y} ${x},${y + s} ${x - s * 0.35},${y}`}
              opacity={0.25 + o * 0.6}
            />
          );
        })}
      </g>
    );
  };

  return (
    <g>
      <GlowDefs />
      <Shadow w={120} />
      {/* piernas y pies */}
      <g transform={`translate(0 ${paso > 0 ? -paso : 0})`}>
        <Block x={-26} y={-30} w={12} h={20} d={6} c={brazo} />
        <Block x={-34} y={-12} w={26} h={12} d={12} c="#2E333C" />
      </g>
      <g transform={`translate(0 ${paso < 0 ? paso : 0})`}>
        <Block x={14} y={-30} w={12} h={20} d={6} c={brazo} />
        <Block x={8} y={-12} w={26} h={12} d={12} c="#2E333C" />
      </g>
      <g transform={`translate(0 ${hover})`}>
        {/* halo de luz */}
        {!apagado && <circle cx={12} cy={-142} r={96} fill={luz} opacity={0.22 * pulse} filter="url(#secHalo)" />}
        <Arm side="L" angle={la} />
        {/* rosca */}
        <Block x={-32} y={-66} w={64} h={36} d={16} c={metal} />
        {[-58, -48, -38].map((y) => (
          <rect key={y} x={-32} y={y} width={64} height={4} fill={shade(metal, -0.3)} />
        ))}
        <Block x={-14} y={-34} w={28} h={6} d={10} c="#5A606C" />
        {/* vidrio */}
        <Block x={-40} y={-92} w={80} h={28} d={20} c={glass} />
        <Block x={-64} y={-186} w={128} h={96} d={28} c={glass} />
        <Block x={-46} y={-206} w={92} h={22} d={24} c={glass} />
        {/* filamento visible arriba */}
        <polyline points="-14,-198 -7,-192 0,-198 7,-192 14,-198" fill="none" stroke={shade(glass, -0.35)} strokeWidth={3} opacity={0.6} />
        {/* reflejos */}
        <rect x={-56} y={-176} width={10} height={36} fill="#fff" opacity={0.45} />
        <rect x={-56} y={-134} width={10} height={8} fill="#fff" opacity={0.3} />
        {/* mejillas */}
        {(expression === "feliz" || expression === "corazon") && (
          <>
            <rect x={-50} y={-122} width={12} height={6} fill="#F08A5D" opacity={0.6} />
            <rect x={38} y={-122} width={12} height={6} fill="#F08A5D" opacity={0.6} />
          </>
        )}
        <Ojos e={expression} ey={-142} f={f} tinta={tinta} brillo={false} ancho={22} />
        <Mouth />
        <Arm side="R" angle={ra} />
        <Chispas />
      </g>
    </g>
  );
};

// ── Humano como secundario: traduce expresiones y brazos ─────
const exprHumana = (e: SecExpression): Expression =>
  e === "cargando" ? "pensando" : e === "error" ? "sorprendido" : e === "corazon" ? "feliz" : e;
const brazosHumanos = (a: SecArms): Arms => (a === "escribir" ? "sostener" : a);

/** Dibuja el personaje secundario definido en perfiles/personajes.json */
export const Secundario: React.FC<SecProps> = (props) => {
  const s = PERSONAJES.secundario;
  const c = s.colores ?? {};
  if (s.tipo === "humano" && s.look) {
    return (
      <Human
        look={s.look}
        frame={props.frame}
        expression={exprHumana(props.expression ?? "neutral")}
        arms={brazosHumanos(props.arms ?? "abajo")}
        speaking={props.speaking}
        walking={props.moving}
        seed={props.seed ?? 5}
      />
    );
  }
  if (s.tipo === "foco") {
    return <Foco {...props} glass={c.cuerpo ?? "#FFD23F"} luz={c.luz ?? "#FFF1A8"} />;
  }
  return <Robot {...props} body={c.cuerpo ?? "#7C8CF8"} led={c.luz ?? color.lime} base={c.base ?? "ruedas"} />;
};
