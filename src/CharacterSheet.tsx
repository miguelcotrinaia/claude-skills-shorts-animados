import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Background } from "./layers/Background";
import { Actor } from "./characters/Actor";
import { Human, type Expression } from "./characters/Human";
import { Secundario, type SecExpression } from "./characters/Secundario";
import { MiniBot } from "./characters/MiniBot";
import { MINIBOT_COLORS, NOMBRE_PRINCIPAL, NOMBRE_SECUNDARIO, PERSONAS, PRINCIPAL, PRINCIPAL_ALTERNO } from "./characters/cast";
import { color, font } from "./theme";
import { ensureFonts } from "./fonts";
import { aplicarAmbiente, type AmbienteId } from "./engine/ambientes";
import { HANDLE } from "./perfiles";

ensureFonts();

const Label: React.FC<{ x: number; y: number; children: React.ReactNode; size?: number; c?: string }> = ({
  x,
  y,
  children,
  size = 26,
  c = color.muted,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - 200,
      top: y,
      width: 400,
      textAlign: "center",
      fontFamily: font.mono,
      fontWeight: 500,
      fontSize: size,
      letterSpacing: 2,
      color: c,
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

const Floor: React.FC<{ y: number }> = ({ y }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: y, height: 2, background: color.floorLine }} />
);

/** Hoja de personajes: para revisar el elenco (npm run personajes → out/personajes.png) */
export const CharacterSheet: React.FC<{ ambiente?: AmbienteId }> = ({ ambiente = "grafito" }) => {
  const frame = useCurrentFrame();
  aplicarAmbiente(ambiente);
  const exprs: Expression[] = ["feliz", "sorprendido", "pensando", "enojado"];
  const sex: SecExpression[] = ["feliz", "sorprendido", "cargando", "error"];
  const extras = Object.entries(PERSONAS).slice(0, 6);
  const paso = extras.length > 5 ? 150 : 175;
  return (
    <AbsoluteFill>
      <Background floor={false} />
      <div
        style={{
          position: "absolute",
          top: 70,
          width: "100%",
          textAlign: "center",
          fontFamily: font.title,
          fontWeight: 800,
          fontSize: 64,
          color: color.text,
        }}
      >
        Elenco <span style={{ color: color.lime }}>{HANDLE}</span>
      </div>

      {/* Fila 1: protagonistas */}
      <Floor y={600} />
      <Actor x={210} y={600} scale={1.75} enter="none">
        <Human look={PRINCIPAL} expression="confiado" arms="saludo" frame={frame} />
      </Actor>
      <Actor x={540} y={600} scale={1.75} enter="none">
        <Human look={PRINCIPAL_ALTERNO} expression="feliz" arms="explicar" frame={frame} seed={2} />
      </Actor>
      <Actor x={860} y={600} scale={1.75} enter="none">
        <Secundario frame={frame} expression="feliz" arms="saludo" speaking />
      </Actor>
      <Label x={210} y={620}>{NOMBRE_PRINCIPAL}</Label>
      <Label x={540} y={620}>{NOMBRE_PRINCIPAL} · alterno</Label>
      <Label x={860} y={620} c={color.lime}>{NOMBRE_SECUNDARIO}</Label>

      {/* Fila 2: expresiones del principal */}
      <Floor y={980} />
      {exprs.map((e, i) => (
        <React.Fragment key={e}>
          <Actor x={150 + i * 260} y={980} scale={1.15} enter="none">
            <Human look={PRINCIPAL} expression={e} arms={i === 2 ? "pensar" : i === 3 ? "senalar" : "abajo"} frame={frame} />
          </Actor>
          <Label x={150 + i * 260} y={995} size={22}>{e}</Label>
        </React.Fragment>
      ))}

      {/* Fila 3: expresiones del secundario */}
      <Floor y={1330} />
      {sex.map((e, i) => (
        <React.Fragment key={e}>
          <Actor x={150 + i * 260} y={1330} scale={1.15} enter="none">
            <Secundario frame={frame} expression={e} arms={i === 0 ? "celebrar" : i === 2 ? "escribir" : "abajo"} />
          </Actor>
          <Label x={150 + i * 260} y={1345} size={22}>{e}</Label>
        </React.Fragment>
      ))}

      {/* Fila 4: extras */}
      <Floor y={1700} />
      {extras.map(([k, look], i) => (
        <React.Fragment key={k}>
          <Actor x={110 + i * paso} y={1700} scale={0.95} enter="none">
            <Human look={look} expression={i % 2 ? "feliz" : "neutral"} frame={frame} seed={i + 4} />
          </Actor>
          <Label x={110 + i * paso} y={1712} size={20}>{k}</Label>
        </React.Fragment>
      ))}
      {MINIBOT_COLORS.slice(0, 3).map((c, i) => (
        <Actor key={c} x={130 + i * 110} y={1830} scale={0.8} enter="none">
          <MiniBot frame={frame} c={c} seed={i} mood={i === 1 ? "feliz" : "neutral"} />
        </Actor>
      ))}
      <Label x={720} y={1800} size={20}>figuras pequeñas</Label>
    </AbsoluteFill>
  );
};
