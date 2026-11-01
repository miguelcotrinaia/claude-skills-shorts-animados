import { getStaticFiles, staticFile } from "remotion";
import type { Linea, LineaT, Palabra, Rol, Timeline, VideoSpec } from "./types";
import { perfilDe } from "./perfil";
import { elegirEncuadres } from "./encuadres";
import { EXTRA_POR_DEFECTO } from "../perfiles";

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

export type LineaPlana = { idx: number; escena: number; quien: Rol; extra?: string; linea: Linea; palabras: string[] };

/** Todas las líneas del video en orden, con su escena */
export const lineasDe = (spec: VideoSpec): LineaPlana[] => {
  const out: LineaPlana[] = [];
  spec.escenas.forEach((e, ei) =>
    e.dialogo.forEach((l) => {
      out.push({
        idx: out.length,
        escena: ei,
        quien: l.quien,
        extra: l.quien === "extra" ? l.extra ?? e.extra ?? EXTRA_POR_DEFECTO : undefined,
        linea: l,
        palabras: l.texto.split(/\s+/).filter(Boolean),
      });
    })
  );
  return out;
};

/** Subtítulos estimados a partir del guion (modo preview, sin voz). */
export const synthPalabras = (lineas: LineaPlana[], ritmo = 1): Palabra[] => {
  const out: Palabra[] = [];
  let t = 350;
  lineas.forEach((l, li) => {
    const prev = lineas[li - 1];
    if (prev) {
      t += prev.escena !== l.escena ? 330 : prev.quien !== l.quien ? 300 : 160;
    }
    const lento = l.quien === "narrador" ? 1.05 : 1;
    l.palabras.forEach((w) => {
      const letters = normalize(w).length;
      const dur = Math.min(620, 150 + letters * 46) * ritmo * lento;
      out.push({
        text: (out.length ? " " : "") + w,
        startMs: Math.round(t),
        endMs: Math.round(t + dur),
        timestampMs: Math.round(t + dur / 2),
        confidence: 1,
        quien: l.quien,
        linea: l.idx,
      });
      t += dur + 25;
      if (/[,;:]$/.test(w)) t += 190 * ritmo;
      if (/[.?!…]$/.test(w)) t += 300 * ritmo;
    });
  });
  return out;
};

type PalabraJson = Omit<Palabra, "quien" | "linea"> & { quien?: Rol; linea?: number };

/** Asigna quién dice cada palabra del JSON. Devuelve también si el JSON quedó desfasado del guion. */
export const etiquetarPalabras = (json: PalabraJson[], lineas: LineaPlana[]): { palabras: Palabra[]; desfase: boolean } => {
  const plan: { quien: Rol; linea: number }[] = lineas.flatMap((l) => l.palabras.map(() => ({ quien: l.quien, linea: l.idx })));
  const n = plan.length;
  const m = json.length;
  const conLinea = json.every((p) => typeof p.linea === "number" && p.linea < lineas.length);
  if (conLinea && m > 0) {
    return { palabras: json.map((p) => ({ ...p, linea: p.linea as number, quien: lineas[p.linea as number].quien })), desfase: m !== n };
  }
  if (m === n) return { palabras: json.map((p, k) => ({ ...p, ...plan[k] })), desfase: false };
  // Reparto proporcional (el texto cambió y no se corrió npm run subtitulos)
  return {
    palabras: json.map((p, k) => ({ ...p, ...plan[Math.min(n - 1, Math.floor((k * n) / Math.max(1, m)))] })),
    desfase: true,
  };
};

/** Inicio y fin de cada línea según sus palabras */
export const tiemposDeLineas = (lineas: LineaPlana[], palabras: Palabra[]): LineaT[] => {
  const out: LineaT[] = lineas.map((l) => {
    const ws = palabras.filter((p) => p.linea === l.idx);
    return {
      idx: l.idx,
      escena: l.escena,
      quien: l.quien,
      extra: l.extra,
      startMs: ws.length ? Math.min(...ws.map((w) => w.startMs)) : NaN,
      endMs: ws.length ? Math.max(...ws.map((w) => w.endMs)) : NaN,
      linea: l.linea,
    };
  });
  // Líneas sin palabras: entre la anterior y la siguiente
  out.forEach((l, i) => {
    if (!Number.isNaN(l.startMs)) return;
    const prev = out[i - 1];
    l.startMs = prev ? prev.endMs + 120 : 0;
    l.endMs = l.startMs + 400;
  });
  return out;
};

const exists = async (path: string) => {
  const files = getStaticFiles();
  if (files.length > 0) return files.some((f) => f.name === path);
  try {
    const r = await fetch(staticFile(path), { method: "GET" });
    return r.ok;
  } catch {
    return false;
  }
};

const firstExisting = async (paths: string[]) => {
  for (const p of paths) {
    if (await exists(p)) return p;
  }
  return null;
};

export const armarTimeline = (spec: VideoSpec, fps: number, json: PalabraJson[] | null, audio: string | null, musica: string | null): Timeline => {
  const lineas = lineasDe(spec);
  const preview = !json || json.length === 0;
  const { palabras, desfase } = preview
    ? { palabras: synthPalabras(lineas, perfilDe(spec.canal).ritmo), desfase: false }
    : etiquetarPalabras(json as PalabraJson[], lineas);
  const lt = tiemposDeLineas(lineas, palabras);

  const toF = (ms: number) => Math.round((ms / 1000) * fps);
  const lead = 4; // la escena aparece ~130 ms antes de que se diga
  const startFrames = spec.escenas.map((e, i) => {
    if (i === 0) return 0;
    if (typeof e.inicioMs === "number") return toF(e.inicioMs);
    const first = lt.find((l) => l.escena === i);
    return Math.max(0, toF(first?.startMs ?? 0) - lead);
  });
  for (let i = 1; i < startFrames.length; i++) {
    startFrames[i] = Math.max(startFrames[i], startFrames[i - 1] + 18);
  }
  const lastEnd = palabras.length ? Math.max(...palabras.map((p) => p.endMs)) : 3000;
  const durationInFrames = Math.max(startFrames[startFrames.length - 1] + 45, toF(lastEnd + 1300));
  const scenes = startFrames.map((from, i) => ({
    from,
    duration: (i < startFrames.length - 1 ? startFrames[i + 1] : durationInFrames) - from,
  }));
  return {
    scenes,
    palabras,
    lineas: lt,
    encuadres: elegirEncuadres(spec),
    durationInFrames,
    audio,
    musica,
    preview,
    desfase,
  };
};

export const buildTimeline = async (spec: VideoSpec, fps: number): Promise<Timeline> => {
  const audio = await firstExisting([`audio/${spec.id}.mp3`, `audio/${spec.id}.wav`, `audio/${spec.id}.m4a`]);
  const captionsPath = `captions/${spec.id}.json`;
  let json: PalabraJson[] | null = null;
  if (await exists(captionsPath)) {
    try {
      const r = await fetch(staticFile(captionsPath));
      json = (await r.json()) as PalabraJson[];
    } catch {
      json = null;
    }
  }
  const musica = spec.musica && (await exists(spec.musica)) ? spec.musica : null;
  return armarTimeline(spec, fps, json, audio, musica);
};
