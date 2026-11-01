import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Actor } from "../characters/Actor";
import { Human, type Arms, type Cabeza, type Expression } from "../characters/Human";
import { Secundario, type SecArms, type SecExpression } from "../characters/Secundario";
import { PERSONAS, PRINCIPAL, PRINCIPAL_ALTERNO } from "../characters/cast";
import { EXTRA_POR_DEFECTO } from "../perfiles";
import { hablaEn, lineaEn, tramosDeLineas, useEscena, type EscenaCtx } from "../engine/context";
import { cabezaY, extraDe, posDe, type Caja, type Pos } from "../engine/encuadres";
import { usePerfil, type Perfil } from "../engine/perfil";
import type { Escena, Gesto, Linea, PosePrincipal, PoseSecundario, Rol } from "../engine/types";
import { color, layout, lienzo } from "../theme";
import { clamp01, ease } from "../lib/anim";
import { SpeechBubble } from "../props/Props";

export type SceneProps<T extends Escena["tipo"]> = {
  e: Extract<Escena, { tipo: T }>;
  prev?: Escena;
  dur: number;
  absFrom: number;
};

const EXPR_HUMANO: Expression[] = ["neutral", "feliz", "sorprendido", "enojado", "pensando", "triste", "guino", "confiado"];
const EXPR_SEC: SecExpression[] = ["neutral", "feliz", "sorprendido", "enojado", "pensando", "cargando", "error", "triste", "corazon"];

export const colorDe = (rol: Rol) =>
  rol === "principal" ? color.vozPrincipal : rol === "secundario" ? color.vozSecundario : rol === "extra" ? color.vozExtra : color.vozNarrador;

// ── Gestos ───────────────────────────────────────────────────

/** Gesto automático según lo que dice (si la línea no trae uno) */
export const gestoAuto = (l: Linea, k: number): Gesto => {
  const t = l.texto.trim();
  if (l.resalta) return "senalar";
  if (/\?$/.test(t)) return k % 2 ? "encoger" : "explicar";
  if (/^(no|nunca|ojo|cuidado|error)\b/i.test(t)) return "negar";
  if (/!$/.test(t)) return "senalar-arriba";
  return (["explicar", "senalar", "explicar", "asentir"] as Gesto[])[k % 4];
};

type PoseFrame = { arms?: Arms; cabeza: Cabeza; salto: number; walking?: boolean };

const poseDeGesto = (g: Gesto, t: number, l: Linea, saltitos: boolean): PoseFrame => {
  const hop = saltitos && t >= 0 && t < 12 ? Math.sin((t / 12) * Math.PI) * 0.22 : 0;
  const pregunta = /\?\s*$/.test(l.texto.trim());
  const base: PoseFrame = { cabeza: pregunta ? "inclinar" : null, salto: hop };
  switch (g) {
    case "explicar":
      return { ...base, arms: "explicar" };
    case "senalar":
      return { ...base, arms: "senalar" };
    case "senalar-arriba":
      return { ...base, arms: "senalar-arriba" };
    case "asentir":
      return { ...base, arms: "explicar", cabeza: t < 40 ? "asentir" : base.cabeza };
    case "negar":
      return { ...base, arms: "explicar", cabeza: t < 40 ? "negar" : null };
    case "encoger":
      return { ...base, arms: "encoger" };
    case "pensar":
      return { ...base, arms: "pensar", cabeza: "inclinar" };
    case "celebrar":
      return { ...base, arms: "celebrar", salto: t >= 0 && t < 16 ? Math.sin((t / 16) * Math.PI) * 0.8 : 0 };
    case "saltar":
      return { ...base, salto: t >= 0 && t < 16 ? Math.sin((t / 16) * Math.PI) * 0.9 : 0 };
    case "facepalm":
      return { ...base, arms: "facepalm" };
    case "saludo":
      return { ...base, arms: "saludo" };
    case "quieto":
    default:
      return base;
  }
};

// ── Posición: continuidad entre escenas y caminatas ─────────

const destinoX = (ir: NonNullable<Linea["ir"]>, x: number, ctx: EscenaCtx) => {
  const o = ctx.dist.objeto;
  if (ir === "centro") return layout.centerX;
  if (ir === "izq") return lienzo.W * 0.185;
  if (ir === "der") return lienzo.W * 0.815;
  return x + (o.x + o.w / 2 - x) * 0.45;
};

const posicionEn = (rol: Rol, pos: Pos, ctx: EscenaCtx, frame: number, perfil: Perfil) => {
  const prevPos = posDe(ctx.distPrev, rol);
  let x = pos.x;
  let s = pos.s;
  let moving = false;
  // Viene de otra posición en la escena anterior: se desplaza a su nuevo lugar
  if (prevPos && (prevPos.x !== pos.x || prevPos.s !== pos.s)) {
    const T = perfil.estilo === "agil" ? 11 : 18;
    const p = interpolate(frame, [0, T], [0, 1], { ...clamp01, easing: Easing.inOut(Easing.cubic) });
    x = prevPos.x + (pos.x - prevPos.x) * p;
    s = prevPos.s + (pos.s - prevPos.s) * p;
    if (p > 0 && p < 1 && Math.abs(prevPos.x - pos.x) > 20) moving = true;
  }
  // Caminatas pedidas en el diálogo (ir: "objeto" | "centro" | "izq" | "der")
  tramosDeLineas(ctx).forEach(({ l, ini }) => {
    if (l.quien !== rol || !l.linea.ir) return;
    const destino = destinoX(l.linea.ir, x, ctx);
    const p = interpolate(frame, [ini, ini + 20], [0, 1], { ...clamp01, easing: Easing.inOut(Easing.quad) });
    if (p > 0 && p < 1) moving = true;
    x = x + (destino - x) * p;
  });
  return { x, s, moving, entra: !prevPos };
};

// ── Estado de cada personaje en el frame ────────────────────

type Estado = {
  x: number;
  s: number;
  flip: boolean;
  moving: boolean;
  entra: boolean;
  speaking: boolean;
  luz: number;
  pose: PoseFrame;
  cara?: string;
  mirar: number;
};

const estadoDe = (rol: Rol, pos: Pos, ctx: EscenaCtx, frame: number, perfil: Perfil): Estado => {
  const p = posicionEn(rol, pos, ctx, frame, perfil);
  const { linea, k, activa, local } = lineaEn(ctx, frame);
  const speaking = hablaEn(ctx, frame, rol);
  let pose: PoseFrame = { cabeza: null, salto: 0 };
  let cara: string | undefined;
  let mirar = 0;
  let luz = 0;
  if (linea && activa && linea.quien === rol) {
    const g = linea.linea.gesto ?? gestoAuto(linea.linea, k);
    pose = poseDeGesto(g, local, linea.linea, perfil.movimiento.saltitos);
    cara = linea.linea.cara;
    mirar = 1;
    luz = ease(local, 0, 6);
  } else if (linea && activa) {
    // Escucha: mira a quien habla (o al objeto si habla la voz en off)
    const otro = posDe(ctx.dist, linea.quien);
    if (otro) {
      const haciaDerecha = otro.x > pos.x;
      mirar = haciaDerecha !== pos.flip ? 1 : -1;
    } else mirar = 1;
    const durL = Math.round(((linea.endMs - linea.startMs) / 1000) * ctx.fps);
    if (perfil.movimiento.asiente && durL > 45 && local > durL * 0.45 && local < durL * 0.45 + 30) pose = { cabeza: "asentir", salto: 0 };
  }
  return { ...p, flip: pos.flip, speaking, luz, pose, cara, mirar };
};

// ── Elenco ───────────────────────────────────────────────────

type CastProps = {
  e: Escena;
  prev?: Escena;
  absFrom: number;
  principalDefault?: PosePrincipal;
  secundarioDefault?: PoseSecundario;
  extraDefault?: { expresion?: Expression; brazos?: Arms };
};

/** Principal, secundario y el extra según el encuadre de la escena, con gestos sincronizados al diálogo. */
export const Cast: React.FC<CastProps> = ({ e, absFrom, principalDefault = {}, secundarioDefault = {}, extraDefault = {} }) => {
  const frame = useCurrentFrame();
  const ctx = useEscena();
  const perfil = usePerfil();
  const d = ctx.dist;
  const mp = { ...principalDefault, ...(e.principal || {}) };
  const ap = { ...secundarioDefault, ...(e.secundario || {}) };
  const f = absFrom + frame;
  const enter = (st: Estado) => (st.entra ? (st.x < layout.centerX ? "izquierda" : "derecha") : "none") as "izquierda" | "derecha" | "none";
  const extraNombre = extraDe(e);

  const m = d.principal ? estadoDe("principal", d.principal, ctx, frame, perfil) : null;
  const a = d.secundario ? estadoDe("secundario", d.secundario, ctx, frame, perfil) : null;
  const x = d.extra && extraNombre ? estadoDe("extra", d.extra, ctx, frame, perfil) : null;

  const globoPos = e.globo ? (e.globo.quien === "principal" ? m : a) : null;

  return (
    <>
      {x && (
        <Actor x={x.x} y={layout.floorY} scale={x.s} flip={x.flip} enter={enter(x)} luz={x.luz} luzColor={color.vozExtra}>
          <Human
            look={PERSONAS[extraNombre as string] ?? PERSONAS[EXTRA_POR_DEFECTO] ?? Object.values(PERSONAS)[0] ?? PRINCIPAL}
            frame={f}
            seed={3}
            expression={(EXPR_HUMANO.includes(x.cara as Expression) ? x.cara : extraDefault.expresion ?? "neutral") as Expression}
            arms={x.pose.arms ?? extraDefault.brazos ?? "abajo"}
            speaking={x.speaking}
            walking={x.moving}
            mirar={x.mirar}
            cabeza={x.pose.cabeza}
            salto={x.pose.salto}
          />
        </Actor>
      )}
      {m && (
        <Actor x={m.x} y={layout.floorY} scale={m.s} flip={m.flip} enter={enter(m)} luz={m.luz} luzColor={color.vozPrincipal}>
          <Human
            look={mp.vestuario === "alterno" ? PRINCIPAL_ALTERNO : PRINCIPAL}
            frame={f}
            expression={(EXPR_HUMANO.includes(m.cara as Expression) ? m.cara : mp.expresion ?? "neutral") as Expression}
            arms={m.pose.arms ?? mp.brazos ?? "abajo"}
            speaking={m.speaking}
            walking={m.moving}
            mirar={m.mirar}
            cabeza={m.pose.cabeza}
            salto={m.pose.salto}
          />
        </Actor>
      )}
      {a && (
        <Actor x={a.x} y={layout.floorY} scale={a.s} flip={a.flip} enter={enter(a)} luz={a.luz} luzColor={color.vozSecundario}>
          <Secundario
            frame={f}
            expression={(EXPR_SEC.includes(a.cara as SecExpression) ? a.cara : ap.expresion ?? "neutral") as SecExpression}
            arms={(a.pose.arms === "pensar" ? "explicar" : (a.pose.arms as SecArms | undefined)) ?? ap.brazos ?? "abajo"}
            speaking={a.speaking}
            moving={a.moving || (a.entra && frame < 18)}
            mirar={a.mirar}
            cabeza={a.pose.cabeza}
            salto={a.pose.salto}
          />
        </Actor>
      )}
      {e.globo && globoPos && (
        <SpeechBubble
          x={Math.max(lienzo.W * 0.23, Math.min(lienzo.W * 0.77, globoPos.x + (globoPos.flip ? -70 : 70)))}
          y={cabezaY({ x: globoPos.x, s: globoPos.s, flip: globoPos.flip }) - 20}
          tail={globoPos.flip ? "der" : "izq"}
          text={e.globo.texto}
        />
      )}
    </>
  );
};

// ── Zona del objeto ─────────────────────────────────────────

/**
 * Coloca el contenido de la escena en la caja del encuadre. `ancho` = ancho de diseño del contenido:
 * se escala para caber en la caja. Mientras se dice una línea con `resalta`, el objeto brilla.
 */
export const Zona: React.FC<{ ancho: number; children: React.ReactNode; alinear?: "centro" | "arriba"; max?: number; caja?: Caja }> = ({
  ancho,
  children,
  alinear = "centro",
  max = 1.15,
  caja,
}) => {
  const frame = useCurrentFrame();
  const ctx = useEscena();
  const b = caja ?? ctx.dist.objeto;
  const s = Math.min(max, b.w / ancho);
  const { linea, activa, local } = lineaEn(ctx, frame);
  const brillo = linea?.linea.resalta && activa ? ease(local, 0, 8) : 0;
  const pulso = 1 + brillo * (0.015 + Math.sin(frame / 5) * 0.008);
  return (
    <div style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h }}>
      {brillo > 0 && (
        <div
          style={{
            position: "absolute",
            inset: -40,
            borderRadius: 60,
            background: `radial-gradient(ellipse at 50% 50%, ${color.accentSoft} 0%, transparent 70%)`,
            opacity: brillo,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: (b.w - ancho * s) / 2,
          top: 0,
          width: ancho,
          height: b.h / s,
          transform: `scale(${s})`,
          transformOrigin: "0 0",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: alinear === "centro" ? "center" : "flex-start",
            transform: `scale(${pulso})`,
            transformOrigin: "50% 50%",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

/** Alto disponible (en unidades de diseño) dentro de la zona */
export const useAltoZona = (ancho: number, max = 1.15) => {
  const { dist } = useEscena();
  const s = Math.min(max, dist.objeto.w / ancho);
  return dist.objeto.h / s;
};
