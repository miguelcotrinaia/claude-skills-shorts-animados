import React, { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { Actor } from "../characters/Actor";
import { Human } from "../characters/Human";
import { Secundario } from "../characters/Secundario";
import { PRINCIPAL, PRINCIPAL_ALTERNO } from "../characters/cast";
import { SpeakContext, isVoiceActive } from "../engine/context";
import type { Escena, PosePrincipal, PoseSecundario, Quien } from "../engine/types";
import { layout } from "../theme";
import { SpeechBubble } from "../props/Props";

export type SceneProps<T extends Escena["tipo"]> = {
  e: Extract<Escena, { tipo: T }>;
  prev?: Escena;
  dur: number;
  absFrom: number;
};

// Qué tipos de escena muestran a cada personaje por defecto
const DEFAULT_SHOW: Record<Escena["tipo"], Record<Quien, boolean>> = {
  duo: { principal: true, secundario: true },
  contador: { principal: true, secundario: true },
  pila: { principal: false, secundario: true },
  multitud: { principal: false, secundario: false },
  pasos: { principal: true, secundario: false },
  terminal: { principal: true, secundario: true },
  cita: { principal: true, secundario: true },
  comparar: { principal: true, secundario: true },
  cta: { principal: true, secundario: true },
};

export const shows = (e: Escena | undefined, who: Quien) => {
  if (!e) return false;
  const v = e[who];
  if (v === false) return false;
  if (v && typeof v === "object") return true;
  return DEFAULT_SHOW[e.tipo][who];
};

export const useSpeaking = (absFrom: number) => {
  const frame = useCurrentFrame();
  const { captions, fps } = useContext(SpeakContext);
  return isVoiceActive(captions, absFrom + frame, fps);
};

type CastProps = {
  e: Escena;
  prev?: Escena;
  absFrom: number;
  principalDefault?: Exclude<PosePrincipal, false>;
  secundarioDefault?: Exclude<PoseSecundario, false>;
  secundarioMoving?: boolean;
};

/** Principal (izquierda) y secundario (derecha) en posiciones estándar, con continuidad entre escenas. */
export const Cast: React.FC<CastProps> = ({ e, prev, absFrom, principalDefault = {}, secundarioDefault = {}, secundarioMoving }) => {
  const frame = useCurrentFrame();
  const voice = useSpeaking(absFrom);
  const speaker = e.habla ?? "principal";
  const showP = shows(e, "principal");
  const showS = shows(e, "secundario");
  const pp = { ...principalDefault, ...(e.principal || {}) };
  const sp = { ...secundarioDefault, ...(e.secundario || {}) };
  const look = pp.vestuario === "alterno" ? PRINCIPAL_ALTERNO : PRINCIPAL;
  return (
    <>
      {showP && (
        <Actor x={layout.leftX} y={layout.floorY} enter={shows(prev, "principal") ? "none" : "izquierda"}>
          <Human
            look={look}
            frame={absFrom + frame}
            expression={pp.expresion ?? "neutral"}
            arms={pp.brazos ?? "abajo"}
            speaking={voice && speaker === "principal"}
          />
        </Actor>
      )}
      {showS && (
        <Actor x={layout.rightX} y={layout.floorY} enter={shows(prev, "secundario") ? "none" : "derecha"}>
          <Secundario
            frame={absFrom + frame}
            expression={sp.expresion ?? "neutral"}
            arms={sp.brazos ?? "abajo"}
            speaking={voice && speaker === "secundario"}
            moving={secundarioMoving ?? (!shows(prev, "secundario") && frame < 18)}
          />
        </Actor>
      )}
      {e.globo && (
        <SpeechBubble
          x={e.globo.quien === "principal" ? layout.leftX + 90 : layout.rightX - 90}
          y={e.globo.quien === "principal" ? 770 : 800}
          tail={e.globo.quien === "principal" ? "izq" : "der"}
          text={e.globo.texto}
        />
      )}
    </>
  );
};
