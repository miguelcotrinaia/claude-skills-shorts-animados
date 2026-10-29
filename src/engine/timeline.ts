import type { Caption } from "@remotion/captions";
import { getStaticFiles, staticFile } from "remotion";
import type { Escena, Timeline, VideoSpec } from "./types";
import { perfilDe } from "./perfil";

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

const wordsOf = (e: Escena) => e.dice.split(/\s+/).filter(Boolean);

/** Subtítulos estimados a partir del guion (modo preview, sin voz). */
export const synthCaptions = (escenas: Escena[], ritmo = 1): Caption[] => {
  const out: Caption[] = [];
  let t = 350;
  escenas.forEach((e) => {
    const ws = wordsOf(e);
    ws.forEach((w, i) => {
      const letters = normalize(w).length;
      const dur = Math.min(620, 150 + letters * 46) * ritmo;
      out.push({
        text: (out.length ? " " : "") + w,
        startMs: t,
        endMs: t + dur,
        timestampMs: t + dur / 2,
        confidence: 1,
        pageBreakAfter: i === ws.length - 1,
      });
      t += dur + 25;
      if (/[,;:]$/.test(w)) t += 200 * ritmo;
      if (/[.?!…]$/.test(w)) t += 380 * ritmo;
    });
    t += 260;
  });
  return out;
};

/** Busca en qué subtítulo empieza cada escena (tolerante a pequeñas diferencias de Whisper). */
export const alignScenes = (escenas: Escena[], caps: Caption[]): number[] => {
  const norm = caps.map((c) => normalize(c.text));
  const starts: number[] = [];
  let expected = 0;
  escenas.forEach((e, si) => {
    const ws = wordsOf(e).map(normalize).filter(Boolean);
    if (si === 0) {
      starts.push(0);
      expected = ws.length;
      return;
    }
    const prev = starts[si - 1];
    let best = Math.min(Math.max(expected, prev + 1), Math.max(norm.length - 1, 0));
    let bestScore = -1;
    for (let j = Math.max(prev + 1, expected - 6); j <= Math.min(norm.length - 1, expected + 6); j++) {
      let score = 0;
      for (let k = 0; k < Math.min(3, ws.length); k++) {
        if (norm[j + k] && norm[j + k] === ws[k]) score += 3 - k;
      }
      const dist = Math.abs(j - expected);
      const total = score * 10 - dist;
      if (total > bestScore) {
        bestScore = total;
        best = j;
      }
    }
    starts.push(best);
    expected = best + ws.length;
  });
  return starts;
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

export const buildTimeline = async (spec: VideoSpec, fps: number): Promise<Timeline> => {
  const audio = await firstExisting([`audio/${spec.id}.mp3`, `audio/${spec.id}.wav`, `audio/${spec.id}.m4a`]);
  const captionsPath = `captions/${spec.id}.json`;
  let captions: Caption[] | null = null;
  if (await exists(captionsPath)) {
    try {
      const r = await fetch(staticFile(captionsPath));
      captions = (await r.json()) as Caption[];
    } catch {
      captions = null;
    }
  }
  const preview = !captions || captions.length === 0;
  const caps = preview ? synthCaptions(spec.escenas, perfilDe(spec.canal).ritmo) : (captions as Caption[]);

  const idx = alignScenes(spec.escenas, caps);
  const toF = (ms: number) => Math.round((ms / 1000) * fps);
  const lead = 4; // la escena aparece ~130 ms antes de que se diga
  const startFrames = spec.escenas.map((e, i) => {
    if (i === 0) return 0;
    if (typeof e.inicioMs === "number") return toF(e.inicioMs);
    return Math.max(0, toF(caps[idx[i]]?.startMs ?? 0) - lead);
  });
  // asegurar orden creciente y duración mínima
  for (let i = 1; i < startFrames.length; i++) {
    startFrames[i] = Math.max(startFrames[i], startFrames[i - 1] + 18);
  }
  const lastEnd = caps.length ? caps[caps.length - 1].endMs : 3000;
  const durationInFrames = Math.max(startFrames[startFrames.length - 1] + 45, toF(lastEnd + 1300));
  const scenes = startFrames.map((from, i) => ({
    from,
    duration: (i < startFrames.length - 1 ? startFrames[i + 1] : durationInFrames) - from,
  }));

  // Saltos de página de subtítulos al cambiar de escena
  const breakAt = new Set(idx.slice(1).map((i) => i - 1));
  const capsWithBreaks = caps.map((c, i) => ({ ...c, pageBreakAfter: c.pageBreakAfter || breakAt.has(i) }));

  const musica = spec.musica && (await exists(spec.musica)) ? spec.musica : null;
  return { scenes, captions: capsWithBreaks, durationInFrames, audio, musica, preview };
};
