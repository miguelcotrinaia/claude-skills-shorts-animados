import { layout } from "../theme";
import { EXTRA_POR_DEFECTO } from "../perfiles";
import type { Encuadre, Escena, Rol, VideoSpec } from "./types";

// ─────────────────────────────────────────────────────────────
// Encuadres: dónde va cada personaje y la "caja" del objeto que se explica.
// Coordenadas del mundo: 1080×1920. Los personajes de la derecha miran al centro (flip).
// ─────────────────────────────────────────────────────────────

export type Pos = { x: number; s: number; flip: boolean };
export type Caja = { x: number; y: number; w: number; h: number };
export type Distribucion = { principal?: Pos; secundario?: Pos; extra?: Pos; objeto: Caja };

export const DISTRIBUCIONES_VERTICAL: Record<Encuadre, Distribucion> = {
  duo: {
    principal: { x: 260, s: 2, flip: false },
    secundario: { x: 820, s: 2, flip: true },
    objeto: { x: 150, y: 470, w: 780, h: 320 },
  },
  invertido: {
    secundario: { x: 260, s: 2, flip: false },
    principal: { x: 820, s: 2, flip: true },
    objeto: { x: 150, y: 470, w: 780, h: 320 },
  },
  "solo-principal": {
    principal: { x: 235, s: 2.25, flip: false },
    objeto: { x: 440, y: 470, w: 600, h: 700 },
  },
  "solo-secundario": {
    secundario: { x: 845, s: 2.25, flip: true },
    objeto: { x: 40, y: 470, w: 600, h: 700 },
  },
  pequenos: {
    principal: { x: 150, s: 1.3, flip: false },
    secundario: { x: 930, s: 1.3, flip: true },
    objeto: { x: 60, y: 465, w: 960, h: 470 },
  },
  pantalla: {
    objeto: { x: 50, y: 460, w: 980, h: 740 },
  },
  trio: {
    principal: { x: 190, s: 1.75, flip: false },
    extra: { x: 545, s: 1.6, flip: false },
    secundario: { x: 890, s: 1.75, flip: true },
    objeto: { x: 150, y: 470, w: 780, h: 360 },
  },
};

export const DISTRIBUCIONES = () => DISTRIBUCIONES_VERTICAL;

/** Personajes visibles en cada encuadre */
const VISIBLES: Record<Encuadre, Rol[]> = {
  duo: ["principal", "secundario"],
  invertido: ["principal", "secundario"],
  "solo-principal": ["principal"],
  "solo-secundario": ["secundario"],
  pequenos: ["principal", "secundario"],
  pantalla: [],
  trio: ["principal", "secundario", "extra"],
};

// Opciones por tipo de escena, en orden de preferencia (se evita repetir el encuadre anterior)
const OPCIONES: Record<Escena["tipo"], Encuadre[]> = {
  duo: ["duo", "invertido", "pequenos"],
  contador: ["pequenos", "duo", "solo-principal"],
  pila: ["solo-secundario", "invertido", "duo"],
  multitud: ["pantalla"],
  pasos: ["solo-principal", "solo-secundario", "pequenos"],
  terminal: ["duo", "solo-secundario", "invertido"],
  cita: ["pequenos", "solo-principal", "duo"],
  comparar: ["pequenos", "solo-principal", "pantalla"],
  diagrama: ["pantalla", "pequenos", "solo-secundario", "solo-principal"],
  pizarra: ["solo-principal", "pequenos", "solo-secundario"],
  linea: ["pequenos", "solo-principal", "pantalla"],
  cta: ["duo"],
  pregunta: ["invertido", "duo", "solo-secundario"],
  tabla: ["pequenos", "pantalla", "solo-principal"],
  resumen: ["solo-principal", "pequenos", "duo"],
};

/** Quiénes hablan en la escena (sin la voz en off) */
export const hablantesDe = (e: Escena): Rol[] => [...new Set(e.dialogo.map((l) => l.quien).filter((q) => q !== "narrador"))];

/** Nombre del personaje extra de la escena (si hay) */
export const extraDe = (e: Escena): string | undefined => e.extra ?? e.dialogo.find((l) => l.quien === "extra")?.extra ?? (e.dialogo.some((l) => l.quien === "extra") ? EXTRA_POR_DEFECTO : undefined);

const valido = (enc: Encuadre, e: Escena) => {
  const vis = VISIBLES[enc];
  const necesita = hablantesDe(e);
  if (extraDe(e) && !vis.includes("extra")) return false;
  if (necesita.some((r) => !vis.includes(r))) return false;
  if (e.principal === false && vis.includes("principal") && enc !== "trio") return false;
  if (e.secundario === false && vis.includes("secundario") && enc !== "trio") return false;
  return true;
};

/** Elige el encuadre de cada escena: respeta el indicado y si no, varía según el tipo y quién habla. */
export const elegirEncuadres = (spec: VideoSpec): Encuadre[] => {
  const out: Encuadre[] = [];
  spec.escenas.forEach((e, i) => {
    if (e.encuadre) {
      out.push(e.encuadre);
      return;
    }
    const prev = out[i - 1];
    const solo = hablantesDe(e);
    let ops = [...OPCIONES[e.tipo]];
    if (extraDe(e)) ops = ["trio", ...ops];
    // Solo habla la voz en off → más espacio para el objeto
    if (solo.length === 0 && e.tipo !== "cta") ops = ["pequenos", "pantalla", ...ops];
    // Habla uno solo → plano de ese personaje cuando el tipo lo permite
    if (solo.length === 1 && solo[0] === "principal" && ops.includes("solo-principal")) ops = ["solo-principal", ...ops];
    if (solo.length === 1 && solo[0] === "secundario" && ops.includes("solo-secundario")) ops = ["solo-secundario", ...ops];
    const validos = ops.filter((o) => valido(o, e));
    const fallback: Encuadre = extraDe(e) ? "trio" : solo.length === 0 ? "pequenos" : "duo";
    const pick = validos.find((o) => o !== prev) ?? validos[0] ?? fallback;
    out.push(pick);
  });
  return out;
};

/** Distribución final de la escena (si el título es pequeño u oculto, el objeto gana espacio arriba) */
export const distribucionDe = (enc: Encuadre, e?: Escena): Distribucion => {
  const d = DISTRIBUCIONES()[enc];
  const subir = e?.tituloModo === "oculto" ? 150 : e?.tituloModo === "etiqueta" ? 85 : 0;
  const objeto = { ...d.objeto, y: d.objeto.y - subir, h: d.objeto.h + subir };
  const out: Distribucion = { ...d, objeto };
  if (e?.principal === false) delete out.principal;
  if (e?.secundario === false) delete out.secundario;
  if (enc === "trio" && !(e && extraDe(e))) delete out.extra;
  return out;
};

/** Posición de un rol en la distribución (la voz en off no tiene) */
export const posDe = (d: Distribucion | undefined, rol: Rol): Pos | undefined => (!d || rol === "narrador" ? undefined : d[rol]);

/** Altura de la cabeza de un personaje (coordenadas del mundo) */
export const cabezaY = (p: Pos) => layout.floorY - 214 * p.s;
