import React from "react";
import { Block, Shadow, shade } from "../lib/voxel";
import { blink, bob, talk } from "../lib/anim";

// Humano voxel paramétrico. Sirve para el personaje principal y para los personajes extra.

export type HairStyle = "peinado" | "corto" | "rulos" | "cresta" | "largo" | "calvo" | "mono" | "cola";
export type Beard = "ninguna" | "candado" | "barba" | "bigote" | "sombra";
export type Glasses = "ninguno" | "rectangulares" | "redondos";
export type Outfit = "blazer" | "polo" | "hoodie" | "camisa";
export type Accessory = "ninguno" | "corbata" | "audifonos";

export type HumanLook = {
  skin: string;
  hair: string;
  beardColor?: string;
  hairStyle: HairStyle;
  beard?: Beard;
  glasses?: Glasses;
  glassesColor?: string;
  outfit: Outfit;
  top: string; // color principal de la prenda (blazer, polo, hoodie)
  inner?: string; // camisa interior (blazer)
  pants: string;
  shoes?: string;
  accent?: string; // detalle de marca (pin, cordones, bolsillo)
  accessory?: Accessory;
};

export type Expression =
  | "neutral"
  | "feliz"
  | "sorprendido"
  | "enojado"
  | "pensando"
  | "triste"
  | "guino"
  | "confiado";

export type Arms = "abajo" | "saludo" | "senalar" | "celebrar" | "sostener" | "pensar" | "explicar";

export type HumanProps = {
  look: HumanLook;
  expression?: Expression;
  arms?: Arms;
  frame: number;
  speaking?: boolean;
  walking?: boolean;
  seed?: number;
};

const armAngles = (arms: Arms, f: number): [number, number] => {
  // [izquierdo, derecho] en grados. 0 = colgando. derecho negativo = hacia la derecha/arriba
  const s = Math.sin(f / 7);
  switch (arms) {
    case "saludo":
      return [6, -150 + s * 16];
    case "senalar":
      return [6, -92];
    case "celebrar":
      return [158 + s * 6, -158 - s * 6];
    case "sostener":
      return [30, -58];
    case "pensar":
      return [6, -152];
    case "explicar":
      return [38 + s * 8, -48 - Math.sin(f / 9) * 14];
    default:
      return [4 + Math.sin(f / 23) * 2, -4 - Math.sin(f / 23) * 2];
  }
};

export const Human: React.FC<HumanProps> = ({
  look,
  expression = "neutral",
  arms = "abajo",
  frame,
  speaking = false,
  walking = false,
  seed = 0,
}) => {
  const f = frame;
  const lift = walking ? Math.abs(Math.sin(f / 4)) * 6 : 0;
  const breathe = bob(f, 52, 1.6, seed * 10);
  const [la, ra] = armAngles(arms, f);
  const eye = expression === "sorprendido" ? 1 : blink(f, seed);
  const mouthOpen = talk(f, speaking);
  const skinSide = shade(look.skin, -0.25);
  const hair = look.hair;
  const beardC = look.beardColor ?? hair;
  const gl = look.glasses ?? "ninguno";
  const glC = look.glassesColor ?? "#0F0F0F";
  const accent = look.accent ?? "#C8F25A";

  const legL = walking ? Math.sin(f / 4) * 7 : 0;

  // --- Brazos ---
  const Arm: React.FC<{ side: "L" | "R"; angle: number }> = ({ side, angle }) => {
    const px = side === "L" ? -53 : 53;
    const py = -86;
    const sleeve = look.outfit === "polo" ? look.top : look.top;
    const short = look.outfit === "polo";
    return (
      <g transform={`rotate(${angle} ${px} ${py})`}>
        {short ? (
          <>
            <Block x={px - 10} y={py - 4} w={20} h={20} d={10} c={sleeve} />
            <Block x={px - 9} y={py + 16} w={18} h={26} d={9} c={look.skin} />
          </>
        ) : (
          <>
            <Block x={px - 10} y={py - 4} w={20} h={40} d={10} c={sleeve} />
            {look.outfit === "blazer" && <rect x={px - 10} y={py + 30} width={20} height={4} fill={look.inner ?? "#222"} />}
            <Block x={px - 9} y={py + 36} w={18} h={10} d={9} c={look.skin} />
          </>
        )}
      </g>
    );
  };

  // --- Pelo ---
  const Hair = () => {
    switch (look.hairStyle) {
      case "calvo":
        return null;
      case "peinado":
        // volumen arriba, raya al costado, flequillo que cae a la izquierda
        return (
          <g>
            <Block x={-56} y={-204} w={112} h={30} d={28} c={hair} />
            <Block x={-38} y={-214} w={70} h={12} d={24} c={shade(hair, 0.06)} />
            <Block x={-56} y={-176} w={50} h={14} d={0} c={hair} />
            <Block x={-56} y={-176} w={12} h={34} d={0} c={hair} />
            <Block x={44} y={-176} w={12} h={22} d={0} c={hair} />
            <rect x={-6} y={-200} width={4} height={22} fill={shade(hair, 0.18)} opacity={0.6} />
          </g>
        );
      case "corto":
        return (
          <g>
            <Block x={-54} y={-198} w={108} h={24} d={26} c={hair} />
            <Block x={-54} y={-176} w={10} h={26} d={0} c={hair} />
            <Block x={44} y={-176} w={10} h={26} d={0} c={hair} />
          </g>
        );
      case "cresta":
        return (
          <g>
            <Block x={-54} y={-194} w={108} h={20} d={26} c={hair} />
            {[-40, -16, 8, 30].map((x, i) => (
              <Block key={i} x={x} y={-208 - (i % 2) * 6} w={16} h={16} d={14} c={hair} />
            ))}
          </g>
        );
      case "rulos":
        return (
          <g>
            <Block x={-58} y={-200} w={116} h={30} d={28} c={hair} />
            {[-58, -30, -2, 26].map((x, i) => (
              <Block key={i} x={x} y={-214} w={26} h={16} d={22} c={shade(hair, i % 2 ? 0.08 : 0)} />
            ))}
            <Block x={-60} y={-176} w={12} h={40} d={0} c={hair} />
            <Block x={48} y={-176} w={12} h={40} d={0} c={hair} />
          </g>
        );
      case "largo":
        return (
          <g>
            <Block x={-58} y={-202} w={116} h={30} d={28} c={hair} />
            <Block x={-62} y={-176} w={16} h={86} d={0} c={hair} />
            <Block x={46} y={-176} w={16} h={86} d={0} c={hair} />
            <Block x={-46} y={-176} w={60} h={12} d={0} c={hair} />
          </g>
        );
      case "cola":
        // cabello recogido: casquete liso + mechones a los lados (la cola va en HairBack)
        return (
          <g>
            <Block x={-56} y={-202} w={112} h={28} d={28} c={hair} />
            <Block x={-30} y={-210} w={64} h={10} d={24} c={shade(hair, 0.06)} />
            <Block x={-56} y={-176} w={12} h={30} d={0} c={hair} />
            <Block x={-44} y={-176} w={34} h={10} d={0} c={hair} />
            <Block x={44} y={-176} w={12} h={22} d={0} c={hair} />
          </g>
        );
      case "mono":
        return (
          <g>
            <Block x={-56} y={-200} w={112} h={28} d={28} c={hair} />
            <Block x={-8} y={-226} w={34} h={26} d={22} c={hair} />
            <Block x={-56} y={-176} w={10} h={30} d={0} c={hair} />
            <Block x={46} y={-176} w={10} h={30} d={0} c={hair} />
          </g>
        );
    }
  };

  // --- Pelo detrás de la cabeza (se dibuja antes que la cabeza) ---
  const HairBack = () => {
    if (look.hairStyle !== "cola") return null;
    const sway = Math.sin(f / 11 + seed) * 3;
    return (
      <g transform={`rotate(${sway} 82 -200)`}>
        <Block x={72} y={-208} w={22} h={18} d={10} c={accent} />
        <Block x={74} y={-192} w={26} h={62} d={12} c={hair} />
        <Block x={78} y={-132} w={18} h={18} d={10} c={shade(hair, 0.08)} />
      </g>
    );
  };

  // --- Ojos y cejas según expresión ---
  const Face = () => {
    const ey = -146;
    const eyes = (() => {
      const happy = expression === "feliz" || expression === "confiado";
      if (happy) {
        return [-22, 22].map((x) => (
          <polyline
            key={x}
            points={`${x - 8},${ey + 4} ${x},${ey - 5} ${x + 8},${ey + 4}`}
            fill="none"
            stroke="#141414"
            strokeWidth={5}
            strokeLinecap="square"
          />
        ));
      }
      if (expression === "guino") {
        return [
          <rect key="l" x={-30} y={ey - 9} width={13} height={17 * eye} fill="#141414" />,
          <rect key="r" x={14} y={ey} width={16} height={5} fill="#141414" />,
        ];
      }
      const big = expression === "sorprendido";
      const w = big ? 15 : 12;
      const h = (big ? 21 : 16) * eye;
      const ox = expression === "pensando" ? 6 : 0;
      const oy = expression === "pensando" ? -4 : 0;
      return [-22, 22].map((x) => (
        <g key={x}>
          <rect x={x - w / 2 + ox} y={ey - h / 2 + oy} width={w} height={h} fill="#141414" />
          {big && <rect x={x - w / 2 + 3} y={ey - h / 2 + 3} width={5} height={5} fill="#fff" />}
        </g>
      ));
    })();

    const browY = gl !== "ninguno" ? -164 : -162;
    const brow = (x: number, rot: number, dy = 0) => (
      <rect x={x - 11} y={browY + dy} width={22} height={6} fill={hair} transform={`rotate(${rot} ${x} ${browY})`} />
    );
    const brows = (() => {
      switch (expression) {
        case "enojado":
          return [brow(-22, 16, 2), brow(22, -16, 2)];
        case "triste":
          return [brow(-22, -14), brow(22, 14)];
        case "sorprendido":
          return [brow(-22, 0, -7), brow(22, 0, -7)];
        case "pensando":
          return [brow(-22, 0), brow(22, -10, -6)];
        case "confiado":
          return [brow(-22, -4), brow(22, 8, -2)];
        default:
          return [brow(-22, 0), brow(22, 0)];
      }
    })();

    // boca
    const my = -118;
    const lip = "#5A2A22";
    const mouth = (() => {
      if (mouthOpen > 0.05) {
        const h = 3 + mouthOpen * 9;
        return (
          <g>
            <rect x={-10} y={my - 1} width={20} height={h} fill="#2A0E0B" />
            <rect x={-8} y={my - 1} width={16} height={3} fill="#F4F1EA" />
          </g>
        );
      }
      switch (expression) {
        case "feliz":
        case "confiado":
          return (
            <g>
              <rect x={-12} y={my - 1} width={24} height={8} fill={lip} />
              <rect x={-10} y={my} width={20} height={4} fill="#F4F1EA" />
            </g>
          );
        case "sorprendido":
          return <rect x={-6} y={my - 3} width={12} height={12} fill="#2A0E0B" />;
        case "triste":
          return <rect x={-9} y={my + 2} width={18} height={4} fill={lip} transform={`rotate(-6 0 ${my})`} />;
        case "enojado":
          return <rect x={-10} y={my + 2} width={20} height={4} fill={lip} />;
        case "pensando":
          return <rect x={-2} y={my + 1} width={12} height={4} fill={lip} />;
        default:
          return <rect x={-9} y={my + 1} width={18} height={4} fill={lip} />;
      }
    })();

    const beard = look.beard ?? "ninguna";
    const Beard = () => {
      switch (beard) {
        case "candado":
          return (
            <g>
              {/* bigote */}
              <rect x={-19} y={-130} width={38} height={7} fill={beardC} />
              {/* laterales finos que bajan al mentón */}
              <rect x={-19} y={-124} width={5} height={22} fill={beardC} />
              <rect x={14} y={-124} width={5} height={22} fill={beardC} />
              {/* candado / chiva */}
              <rect x={-15} y={-104} width={30} height={10} fill={beardC} />
              <rect x={-9} y={-95} width={18} height={6} fill={shade(beardC, 0.1)} />
            </g>
          );
        case "barba":
          return (
            <g>
              <rect x={-52} y={-130} width={104} height={38} fill={beardC} />
              <rect x={-18} y={-128} width={36} height={6} fill={shade(beardC, 0.1)} />
            </g>
          );
        case "bigote":
          return <rect x={-18} y={-127} width={36} height={7} fill={beardC} />;
        case "sombra":
          return <rect x={-50} y={-128} width={100} height={34} fill={beardC} opacity={0.22} />;
        default:
          return null;
      }
    };

    const Glasses = () => {
      if (gl === "ninguno") return null;
      if (gl === "redondos") {
        return (
          <g fill="none" stroke={glC} strokeWidth={4}>
            <circle cx={-22} cy={-146} r={14} />
            <circle cx={22} cy={-146} r={14} />
            <line x1={-8} y1={-148} x2={8} y2={-148} />
          </g>
        );
      }
      return (
        <g>
          <g fill="rgba(170,210,255,0.10)" stroke={glC} strokeWidth={5}>
            <rect x={-40} y={-159} width={34} height={25} />
            <rect x={6} y={-159} width={34} height={25} />
          </g>
          <rect x={-6} y={-152} width={12} height={5} fill={glC} />
          <rect x={-52} y={-157} width={12} height={4} fill={glC} />
          <rect x={40} y={-157} width={12} height={4} fill={glC} />
          {/* reflejo */}
          <rect x={-35} y={-155} width={6} height={3} fill="#fff" opacity={0.35} />
          <rect x={11} y={-155} width={6} height={3} fill="#fff" opacity={0.35} />
        </g>
      );
    };

    return (
      <g>
        <Beard />
        {mouth}
        {eyes}
        <Glasses />
        {brows}
        {(expression === "feliz" || expression === "confiado") && (
          <>
            <rect x={-44} y={-132} width={12} height={6} fill="#E58C7A" opacity={0.5} />
            <rect x={32} y={-132} width={12} height={6} fill="#E58C7A" opacity={0.5} />
          </>
        )}
      </g>
    );
  };

  // --- Torso según vestuario ---
  const Torso = () => {
    const t = look.top;
    return (
      <g>
        <Block x={-44} y={-92} w={88} h={58} d={22} c={t} />
        {look.outfit === "blazer" && (
          <g>
            {/* camisa interior en V */}
            <polygon points="-16,-92 16,-92 0,-56" fill={look.inner ?? "#151A19"} />
            {/* solapas */}
            <polygon points="-16,-92 -26,-92 -8,-58 0,-56" fill={shade(t, 0.12)} />
            <polygon points="16,-92 26,-92 8,-58 0,-56" fill={shade(t, 0.12)} />
            {/* botones */}
            <rect x={-3} y={-50} width={6} height={6} fill={shade(t, -0.35)} />
            {/* pin de marca */}
            <rect x={-34} y={-80} width={9} height={9} fill={accent} />
          </g>
        )}
        {look.outfit === "polo" && (
          <g>
            <rect x={-16} y={-92} width={32} height={6} fill={shade(t, 0.12)} />
            {/* parche pixel de marca */}
            <rect x={14} y={-74} width={18} height={18} fill="none" stroke={accent} strokeWidth={3} />
            <rect x={19} y={-69} width={4} height={4} fill={accent} />
            <rect x={23} y={-65} width={4} height={4} fill={accent} />
          </g>
        )}
        {look.outfit === "hoodie" && (
          <g>
            <polygon points="-30,-92 30,-92 18,-80 -18,-80" fill={shade(t, -0.18)} />
            <rect x={-12} y={-80} width={3} height={18} fill={accent} />
            <rect x={9} y={-80} width={3} height={18} fill={accent} />
            <rect x={-26} y={-58} width={52} height={16} fill={shade(t, -0.1)} />
          </g>
        )}
        {look.outfit === "camisa" && (
          <g>
            <polygon points="-14,-92 14,-92 0,-80" fill={shade(t, -0.15)} />
            <rect x={-2} y={-80} width={4} height={44} fill={shade(t, -0.12)} />
          </g>
        )}
        {look.accessory === "corbata" && (
          <g>
            <polygon points="-6,-90 6,-90 4,-82 -4,-82" fill={accent} />
            <polygon points="-4,-82 4,-82 8,-52 0,-44 -8,-52" fill={accent} />
          </g>
        )}
      </g>
    );
  };

  return (
    <g>
      <Shadow w={128} />
      <g transform={`translate(0 ${-lift + breathe * 0})`}>
        {/* piernas */}
        <g transform={`translate(0 ${legL > 0 ? -legL : 0})`}>
          <Block x={-32} y={-38} w={24} h={30} d={12} c={look.pants} />
          <Block x={-34} y={-10} w={28} h={10} d={12} c={look.shoes ?? "#141716"} />
        </g>
        <g transform={`translate(0 ${legL < 0 ? legL : 0})`}>
          <Block x={8} y={-38} w={24} h={30} d={12} c={look.pants} />
          <Block x={6} y={-10} w={28} h={10} d={12} c={look.shoes ?? "#141716"} />
        </g>
        <g transform={`translate(0 ${breathe * 0.5})`}>
          <Arm side="L" angle={la} />
          <Torso />
          {/* cabeza */}
          <g transform={`translate(0 ${breathe})`}>
            <HairBack />
            <Block x={-52} y={-180} w={104} h={88} d={26} c={look.skin} side={skinSide} />
            {/* orejas */}
            <Block x={-60} y={-146} w={8} h={18} d={0} c={shade(look.skin, -0.08)} />
            {look.accessory === "audifonos" && (
              <g>
                <rect x={-64} y={-206} width={150} height={8} fill="#1d1d1d" />
                <Block x={-68} y={-156} w={16} h={30} d={6} c={accent} />
              </g>
            )}
            <Hair />
            <Face />
          </g>
          <Arm side="R" angle={ra} />
        </g>
      </g>
    </g>
  );
};
