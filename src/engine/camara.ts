import { Easing, interpolate } from "remotion";
import { layout, lienzo } from "../theme";
import { distribucionDe, posDe, type Caja, type Pos } from "./encuadres";
import type { Perfil } from "./perfil";
import type { Rol, Timeline, VideoSpec } from "./types";

// ─────────────────────────────────────────────────────────────
// Director de cámara. Cada línea del diálogo elige una toma (general, quien habla, el objeto)
// y la cámara se mueve entre tomas: estilo ágil con golpes rápidos, estilo clase con movimientos suaves.
// La cámara mueve el "mundo" (personajes, objetos, piso). Títulos y subtítulos quedan fijos.
// ─────────────────────────────────────────────────────────────

export type Toma = { cx: number; cy: number; z: number };

type Clave = {
  from: number; // frame absoluto
  toma: Toma;
  hasta?: Toma; // la toma se desplaza hacia aquí durante su duración (paneo / empuje)
  corte: boolean; // sin transición (inicio de escena)
};

// Medidas del lienzo (1080x1920)
const W = () => lienzo.W;
const H = () => lienzo.H;
const F = () => layout.floorY;
/** Distancia del piso al centro de la cámara para que el piso quede justo sobre los subtítulos */
const bajo = (z: number) => (lienzo.pisoMax - H() / 2) / z;
/** Corrimiento para que el objeto quede en el centro de la zona de contenido (entre título y subtítulos) */
const alCentro = (z: number) => (H() / 2 - lienzo.centroY) / z;
export const general = (): Toma => ({ cx: W() / 2, cy: H() / 2, z: 1 });

/** Mantiene la toma dentro del mundo; con piso=true el piso queda por encima de los subtítulos */
export const limitar = (t: Toma, piso = true): Toma => {
  const z = Math.max(1, Math.min(1.8, t.z));
  const cx = Math.max(W() / 2 / z, Math.min(W() - W() / 2 / z, t.cx));
  const minY = Math.max(H() / 2 / z, piso ? F() - bajo(z) : 0);
  const maxY = H() - H() / 2 / z;
  const cy = Math.max(Math.min(minY, maxY), Math.min(maxY, t.cy));
  return { cx, cy, z };
};

const tomaHablante = (p: Pos, zoom: number): Toma => {
  const z = Math.min(1.6, zoom * Math.sqrt(2 / p.s));
  return limitar({ cx: p.x + (p.flip ? -70 : 70), cy: F() - bajo(z), z });
};

const tomaObjeto = (b: Caja, zoom: number): Toma => {
  const z = Math.max(1, Math.min(zoom, (W() * 0.87) / b.w, lienzo.alturaUtil / b.h));
  return limitar({ cx: b.x + b.w / 2, cy: b.y + b.h / 2 + alCentro(z), z }, false);
};

/** Plano de dos: quien habla + el objeto que explica */
const tomaDos = (p: Pos, b: Caja, zoom: number, piso: boolean): Toma => {
  const izq = Math.min(b.x + 30, p.x - 78 * p.s);
  const der = Math.max(b.x + b.w - 30, p.x + 78 * p.s);
  const z = Math.max(1, Math.min(zoom, W() / (der - izq + 130)));
  return limitar({ cx: (izq + der) / 2, cy: piso ? F() - bajo(z) : b.y + b.h / 2 + alCentro(z), z }, piso);
};

const mezclar = (a: Toma, b: Toma, p: number): Toma => ({
  cx: a.cx + (b.cx - a.cx) * p,
  cy: a.cy + (b.cy - a.cy) * p,
  z: a.z + (b.z - a.z) * p,
});


export const planCamara = (spec: VideoSpec, tl: Timeline, perfil: Perfil, fps: number): Clave[] => {
  const claves: Clave[] = [];
  const zH = perfil.camara.zoomHablante;
  const zO = perfil.camara.zoomObjeto;
  const toF = (ms: number) => Math.round((ms / 1000) * fps);

  spec.escenas.forEach((e, i) => {
    const s = tl.scenes[i];
    if (!s) return;
    const enc = tl.encuadres[i];
    const d = distribucionDe(enc, e);
    const lineas = tl.lineas.filter((l) => l.escena === i);
    const obj = tomaObjeto(d.objeto, zO);
    const modo = e.camara ?? "auto";
    const quieto = enc === "pantalla" || e.tipo === "cta" || e.tipo === "multitud";
    const hayObjeto = e.tipo !== "duo" || !!e.prop;
    // Quien habla: primer plano en frases cortas (o si no hay objeto); plano de dos en frases largas
    const tomaDe = (rol: Rol, texto = "") => {
      const p = posDe(d, rol);
      if (!p) return obj;
      const corta = texto.split(/\s+/).filter(Boolean).length <= 5;
      return !hayObjeto || corta ? tomaHablante(p, zH) : tomaDos(p, d.objeto, zH, true);
    };
    // El objeto: si lo explica un personaje, que también se le vea
    const tomaObj = (rol: Rol) => {
      const p = posDe(d, rol);
      return p ? tomaDos(p, d.objeto, zO, false) : obj;
    };

    if (modo === "general" || (modo === "auto" && quieto)) {
      claves.push({ from: s.from, toma: general(), hasta: quieto ? limitar({ ...general(), z: 1 + perfil.camara.empuje }) : undefined, corte: true });
      return;
    }
    if (modo === "paneo") {
      const ps = (["principal", "extra", "secundario"] as Rol[]).map((r) => posDe(d, r)).filter(Boolean) as Pos[];
      const izq = ps.length ? ps.reduce((a, b) => (a.x < b.x ? a : b)) : undefined;
      const der = ps.length ? ps.reduce((a, b) => (a.x > b.x ? a : b)) : undefined;
      const z = Math.max(1.15, zH - 0.1);
      claves.push({
        from: s.from,
        toma: izq ? limitar({ cx: izq.x, cy: F() - bajo(z), z }) : limitar({ cx: d.objeto.x, cy: obj.cy, z }),
        hasta: der ? limitar({ cx: der.x, cy: F() - bajo(z), z }) : limitar({ cx: d.objeto.x + d.objeto.w, cy: obj.cy, z }),
        corte: true,
      });
      return;
    }
    if (modo === "empuje") {
      claves.push({ from: s.from, toma: general(), hasta: limitar({ ...obj, z: Math.max(obj.z, 1.15) }), corte: true });
      return;
    }

    lineas.forEach((l, k) => {
      const from = k === 0 ? s.from : Math.max(s.from + 1, toF(l.startMs) - 4);
      let toma: Toma;
      const txt = l.linea.texto;
      if (modo === "hablante") toma = tomaDe(l.quien, txt);
      else if (modo === "objeto") toma = tomaObj(l.quien);
      else if (k === 0) toma = l.quien === "narrador" ? obj : general(); // plano de ubicación
      else if (l.quien === "narrador" || l.linea.resalta) toma = tomaObj(l.quien);
      else if (l.quien !== lineas[k - 1].quien) toma = tomaDe(l.quien, txt);
      else toma = hayObjeto ? tomaObj(l.quien) : tomaDe(l.quien, txt); // sigue el mismo: mostramos lo que explica
      // Escena de una sola línea: empuje lento hacia quien habla
      const hasta =
        modo === "auto" && lineas.length === 1 && l.quien !== "narrador" ? mezclar(general(), tomaDe(l.quien), 0.45) : undefined;
      claves.push({ from, toma, hasta, corte: k === 0 });
    });
    if (lineas.length === 0) claves.push({ from: s.from, toma: general(), corte: true });
  });
  return claves.sort((a, b) => a.from - b.from);
};

const finDe = (claves: Clave[], k: number, total: number) => (claves[k + 1]?.from ?? total);

/** Estado de la toma k en el frame f (sin transición de entrada) */
const estado = (claves: Clave[], k: number, f: number, total: number, empuje: number): Toma => {
  const c = claves[k];
  const fin = finDe(claves, k, total);
  const p = interpolate(f, [c.from, Math.max(c.from + 1, fin)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  if (c.hasta) return limitar(mezclar(c.toma, c.hasta, p), false);
  // empuje lento: la toma se acerca un poco mientras dura (hacia el mismo centro)
  return limitar({ ...c.toma, z: c.toma.z * (1 + empuje * p) }, false);
};

export const tomaEn = (claves: Clave[], f: number, total: number, perfil: Perfil): Toma => {
  if (!claves.length) return general();
  let k = 0;
  for (let i = 0; i < claves.length; i++) if (claves[i].from <= f) k = i;
  const actual = estado(claves, k, f, total, perfil.camara.empuje);
  const c = claves[k];
  if (c.corte || k === 0) {
    // golpe de zoom al entrar a la escena (TikTok)
    if (perfil.movimiento.golpeEntrada && k > 0) {
      const g = interpolate(f - c.from, [0, 7], [1.06, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return limitar({ ...actual, z: actual.z * g }, false);
    }
    return actual;
  }
  const dur = perfil.camara.transicion;
  const t = f - c.from;
  if (t >= dur) return actual;
  const prev = estado(claves, k - 1, c.from, total, perfil.camara.empuje);
  const easing = dur <= 8 ? Easing.out(Easing.back(1.4)) : Easing.inOut(Easing.cubic);
  const p = interpolate(t, [0, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
  return limitar(mezclar(prev, actual, p), false);
};

/** transform CSS del mundo para una toma */
export const transformDe = (t: Toma) => `translate(${W() / 2}px, ${H() / 2}px) scale(${t.z}) translate(${-t.cx}px, ${-t.cy}px)`;
