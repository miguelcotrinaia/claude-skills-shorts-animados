// Sincronización por pausas: no necesita Whisper ni internet.
// Ideal para voces de texto a voz (ElevenLabs web, CapCut…) que leen el guion tal cual.
// Detecta los silencios del audio con ffmpeg y los empareja con la puntuación del guion
// (puntos, comas, fin de escena). Entre pausas reparte las palabras según su largo.
import { spawnSync } from "node:child_process";
import { normalize, paraVoz } from "./common.mjs";

/** Devuelve { duracion, silencios: [{a, b}] } en segundos (usa el ffmpeg que trae Remotion) */
export const detectarSilencios = (audioPath, { ruido = -35, minimo = 0.12 } = {}) => {
  const cmd = `npx remotion ffmpeg -hide_banner -i "${audioPath}" -af silencedetect=noise=${ruido}dB:d=${minimo} -f null -`;
  const r = spawnSync(cmd, { shell: true, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  return parsearSilencios(`${r.stdout || ""}\n${r.stderr || ""}`);
};

export const parsearSilencios = (txt) => {
  const dur = txt.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  const duracion = dur ? Number(dur[1]) * 3600 + Number(dur[2]) * 60 + Number(dur[3]) : null;
  const silencios = [];
  let a = null;
  for (const line of txt.split(/\r?\n/)) {
    const s = line.match(/silence_start:\s*(-?[\d.]+)/);
    if (s) a = Math.max(0, Number(s[1]));
    const e = line.match(/silence_end:\s*([\d.]+)/);
    if (e && a !== null) {
      silencios.push({ a, b: Number(e[1]) });
      a = null;
    }
  }
  if (a !== null && duracion) silencios.push({ a, b: duracion });
  return { duracion, silencios };
};

const pausaTras = (w) => (/[.?!…]["”)]?$/.test(w) ? 6 : /[,;:]["”)]?$/.test(w) ? 3 : 0);

/**
 * escenas: array de textos "dice" (uno por escena)
 * Devuelve subtítulos [{text, startMs, endMs, timestampMs, confidence}]
 */
export const alinearPorPausas = (escenas, { duracion, silencios }) => {
  // Palabras del guion (como se ven en subtítulos) + peso según cómo se pronuncian
  const words = [];
  escenas.forEach((dice) => {
    const ws = dice.split(/\s+/).filter(Boolean);
    ws.forEach((w, k) => {
      const spoken = paraVoz(w);
      const letras = normalize(spoken).length || 1;
      const finEscena = k === ws.length - 1;
      words.push({ text: w, peso: letras + 1.5, pausa: Math.max(pausaTras(w), finEscena ? 6 : 0) });
    });
  });
  const n = words.length;
  // Posiciones en "unidades"
  let u = 0;
  words.forEach((w, i) => {
    w.u0 = u;
    u += w.peso;
    w.u1 = u;
    if (i < n - 1) u += w.pausa;
  });
  const U = u;

  // Inicio y fin de la voz
  const total = duracion ?? (silencios.length ? silencios[silencios.length - 1].b : U / 12);
  let s0 = 0;
  let e0 = total;
  const internos = silencios.filter((s) => {
    if (s.a <= 0.05) {
      s0 = s.b;
      return false;
    }
    if (s.b >= total - 0.05) {
      e0 = s.a;
      return false;
    }
    return true;
  });

  // Límites candidatos (palabras con pausa después)
  const limites = words.map((w, i) => ({ i, w })).filter(({ i, w }) => i < n - 1 && w.pausa > 0);

  const mapear = (anclas, unidad) => {
    for (let k = 0; k < anclas.length - 1; k++) {
      const [ua, ta] = anclas[k];
      const [ub, tb] = anclas[k + 1];
      if (unidad >= ua && unidad <= ub) return ub === ua ? ta : ta + ((unidad - ua) / (ub - ua)) * (tb - ta);
    }
    return anclas[anclas.length - 1][1];
  };

  let anclas = [
    [0, s0],
    [U, e0],
  ];
  let pares = [];
  for (let pasada = 0; pasada < 3; pasada++) {
    const esperado = limites.map(({ w }) => mapear(anclas, w.u1 + w.pausa / 2));
    // DP: emparejar límites (en orden) con silencios (en orden)
    const L = limites.length;
    const S = internos.length;
    const INF = 1e9;
    const dp = Array.from({ length: L + 1 }, () => new Array(S + 1).fill(INF));
    const bt = Array.from({ length: L + 1 }, () => new Array(S + 1).fill(0));
    dp[0][0] = 0;
    const saltoLimite = (w) => (w.pausa >= 6 ? 0.9 : 0.35);
    const saltoSilencio = (s) => 0.25 + Math.min(0.5, (s.b - s.a) * 0.6);
    for (let i = 0; i <= L; i++) {
      for (let j = 0; j <= S; j++) {
        if (dp[i][j] >= INF) continue;
        if (i < L) {
          const c = dp[i][j] + saltoLimite(limites[i].w);
          if (c < dp[i + 1][j]) {
            dp[i + 1][j] = c;
            bt[i + 1][j] = 1;
          }
        }
        if (j < S) {
          const c = dp[i][j] + saltoSilencio(internos[j]);
          if (c < dp[i][j + 1]) {
            dp[i][j + 1] = c;
            bt[i][j + 1] = 2;
          }
        }
        if (i < L && j < S) {
          const mid = (internos[j].a + internos[j].b) / 2;
          const d = Math.abs(esperado[i] - mid);
          if (d < 3) {
            const c = dp[i][j] + d * 0.5;
            if (c < dp[i + 1][j + 1]) {
              dp[i + 1][j + 1] = c;
              bt[i + 1][j + 1] = 3;
            }
          }
        }
      }
    }
    pares = [];
    let i = L;
    let j = S;
    while (i > 0 || j > 0) {
      const m = bt[i][j];
      if (m === 3) {
        pares.push([i - 1, j - 1]);
        i--;
        j--;
      } else if (m === 1) i--;
      else j--;
    }
    pares.reverse();
    anclas = [[0, s0]];
    for (const [li, sj] of pares) {
      const w = limites[li].w;
      anclas.push([w.u1, internos[sj].a]);
      anclas.push([w.u1 + w.pausa, internos[sj].b]);
    }
    anclas.push([U, e0]);
  }

  const caps = words.map((w, k) => {
    const start = mapear(anclas, w.u0);
    const end = mapear(anclas, w.u1);
    return {
      text: (k === 0 ? "" : " ") + w.text,
      startMs: Math.round(start * 1000),
      endMs: Math.round(Math.max(end, start + 0.06) * 1000),
      timestampMs: Math.round(((start + end) / 2) * 1000),
      confidence: 0.8,
    };
  });
  return { captions: caps, emparejados: pares.length, limites: limites.length, silencios: internos.length };
};
