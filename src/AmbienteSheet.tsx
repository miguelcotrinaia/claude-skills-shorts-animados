import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Background } from "./layers/Background";
import { Actor } from "./characters/Actor";
import { Human } from "./characters/Human";
import { Secundario } from "./characters/Secundario";
import { PRINCIPAL } from "./characters/cast";
import { Accented } from "./layers/Header";
import { Avatar, HANDLE, MiniCara } from "./layers/Watermark";
import { Panel } from "./props/Props";
import { AMBIENTES, aplicarAmbiente, textoSobre, type AmbienteId } from "./engine/ambientes";
import { color, font, layout } from "./theme";
import { ensureFonts } from "./fonts";
import { CANAL, NOMBRES } from "./perfiles";
import type { Rol } from "./engine/types";

ensureFonts();

/** Vista de un fondo: para revisar contraste de personajes, títulos y subtítulos (npm run ambientes). */
export const AmbienteSheet: React.FC<{ ambiente: AmbienteId }> = ({ ambiente }) => {
  const frame = useCurrentFrame();
  const a = aplicarAmbiente(ambiente);
  const hablantes: [Rol, string][] = [
    ["principal", NOMBRES.principal],
    ["secundario", NOMBRES.secundario],
    ["extra", "EXTRA"],
    ["narrador", NOMBRES.narrador],
  ];
  const colorDe = (r: Rol) => (r === "principal" ? color.vozPrincipal : r === "secundario" ? color.vozSecundario : r === "extra" ? color.vozExtra : color.text);
  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center", fontFamily: font.mono, fontSize: 30, letterSpacing: 6, color: color.muted }}>
        FONDO · {(AMBIENTES[ambiente]?.nombre ?? ambiente).toUpperCase()} · {a.claro ? "CLARO" : "OSCURO"}
      </div>
      <div style={{ position: "absolute", top: layout.titleY, left: 70, right: 70, textAlign: "center", fontFamily: font.title, fontWeight: 800, fontSize: 86, color: color.text, lineHeight: 1.08, textShadow: `0 6px 0 ${color.textShadow}` }}>
        <Accented text={`${CANAL.nombre.split(" ")[0]} *${CANAL.nombre.split(" ").slice(1).join(" ") || CANAL.nombre}*`} />
      </div>
      <div style={{ position: "absolute", top: 520, left: 160, width: 760 }}>
        <Panel style={{ padding: "24px 30px", display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          {hablantes.map(([r, n]) => {
            const c = colorDe(r);
            return (
              <span key={r} style={{ fontFamily: font.title, fontWeight: 800, fontSize: 34, background: c, color: textoSobre(c), padding: "6px 16px", borderRadius: 12, textTransform: "uppercase" }}>
                {n}
              </span>
            );
          })}
        </Panel>
      </div>
      <Actor x={260} y={layout.floorY} enter="none">
        <Human look={PRINCIPAL} expression="feliz" arms="explicar" frame={frame} speaking />
      </Actor>
      <Actor x={820} y={layout.floorY} enter="none" flip>
        <Secundario frame={frame} expression="feliz" arms="saludo" />
      </Actor>
      <div style={{ position: "absolute", top: layout.handleY, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 22px 6px 8px", borderRadius: 40, background: color.panel, border: `2px solid ${color.panelEdge}` }}>
          <MiniCara size={44} frame={frame} />
          <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 28, color: color.text }}>{HANDLE}</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: layout.captionsY, left: 40, right: 40, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
        <Avatar quien="secundario" size={78} frame={frame} borde={color.vozSecundario} />
        {["ESTO", "SE", "LEE"].map((w, i) => (
          <span
            key={w}
            style={{
              fontFamily: font.title,
              fontWeight: 800,
              fontSize: 74,
              padding: "2px 14px 6px",
              borderRadius: 14,
              color: i === 1 ? textoSobre(color.vozSecundario) : color.text,
              background: i === 1 ? color.vozSecundario : "transparent",
              textShadow: i === 1 ? "none" : `0 4px 0 ${color.textShadow}`,
            }}
          >
            {w}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
