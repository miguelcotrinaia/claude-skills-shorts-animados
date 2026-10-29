import { Easing, interpolate, spring } from "remotion";

export const clamp01 = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Configuración de movimiento (la ajusta el perfil del canal) */
export const animCfg = { damping: 12 };

/** Entrada con rebote 0→1 */
export const pop = (frame: number, fps: number, delay = 0, stiff = 170) =>
  spring({ frame: frame - delay, fps, config: { damping: animCfg.damping, stiffness: stiff, mass: 0.7 } });

/** Entrada suave 0→1 */
export const ease = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp01, easing: Easing.out(Easing.cubic) });

/** Flotación idle */
export const bob = (frame: number, period = 46, amp = 3, phase = 0) =>
  Math.sin(((frame + phase) / period) * Math.PI * 2) * amp;

/** Parpadeo: devuelve escala vertical del ojo (1 abierto, ~0.1 cerrado) */
export const blink = (frame: number, seed = 0) => {
  const cycle = 96 + (seed % 5) * 9;
  const t = (frame + seed * 31) % cycle;
  return t < 3 ? 0.12 : t < 5 ? 0.5 : 1;
};

/** Apertura de boca al hablar (0..1) */
export const talk = (frame: number, speaking: boolean) => {
  if (!speaking) return 0;
  const v = Math.abs(Math.sin(frame * 0.9)) * 0.7 + Math.abs(Math.sin(frame * 0.37)) * 0.3;
  return v;
};

/** Pequeño temblor (para "enojado", "error") */
export const shake = (frame: number, amp = 3) => Math.sin(frame * 2.1) * amp;
