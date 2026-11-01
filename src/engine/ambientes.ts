import { color, estiloPersonaje } from "../theme";
import { CANAL } from "../perfiles";
import rotacionJson from "../../config/rotacion.json";

// ─────────────────────────────────────────────────────────────
// Fondos ("ambientes"): claros y oscuros. Rotan entre videos para que el perfil no se vea igual.
// Hay 6 fijos y 2 que se arman con los colores de marca de perfiles/canal.json (marca-oscuro, marca-claro).
// Los personajes no cambian: en fondos claros llevan contorno oscuro y en oscuros un borde de luz.
// ─────────────────────────────────────────────────────────────

export type AmbienteId = string;

export type Ambiente = {
  nombre: string;
  claro: boolean;
  bg: string;
  bgDeep: string;
  acento: string;
  sobreAcento: string; // texto encima del acento
  texto: string;
  muted: string;
  panel: string;
  hablantes: { principal: string; secundario: string; extra: string; narrador: string };
};

export const FIJOS: Record<string, Ambiente> = {
  grafito: {
    nombre: "Grafito",
    claro: false,
    bg: "#0B1311",
    bgDeep: "#060B0A",
    acento: "#C8F25A",
    sobreAcento: "#0E1A17",
    texto: "#EEF3EA",
    muted: "#8FA39A",
    panel: "#13211E",
    hablantes: { principal: "#C8F25A", secundario: "#5CF2C8", extra: "#FFC24B", narrador: "#EEF3EA" },
  },
  arena: {
    nombre: "Arena",
    claro: true,
    bg: "#F2EADB",
    bgDeep: "#E6DAC4",
    acento: "#D9480F",
    sobreAcento: "#FFFFFF",
    texto: "#1C1A17",
    muted: "#6B6156",
    panel: "#FFFBF3",
    hablantes: { principal: "#C2410C", secundario: "#0F766E", extra: "#7C3AED", narrador: "#1C1A17" },
  },
  noche: {
    nombre: "Noche",
    claro: false,
    bg: "#0B1217",
    bgDeep: "#060A0D",
    acento: "#57D6C4",
    sobreAcento: "#06201C",
    texto: "#EEF3F5",
    muted: "#8EA3AD",
    panel: "#122027",
    hablantes: { principal: "#57D6C4", secundario: "#C8F25A", extra: "#FFC24B", narrador: "#EEF3F5" },
  },
  niebla: {
    nombre: "Niebla",
    claro: true,
    bg: "#E4EAF2",
    bgDeep: "#D3DCE8",
    acento: "#5B3FD0",
    sobreAcento: "#FFFFFF",
    texto: "#141A24",
    muted: "#5A6577",
    panel: "#F7F9FC",
    hablantes: { principal: "#5B3FD0", secundario: "#0F766E", extra: "#B45309", narrador: "#141A24" },
  },
  ciruela: {
    nombre: "Ciruela",
    claro: false,
    bg: "#1A1024",
    bgDeep: "#0F0916",
    acento: "#FFB547",
    sobreAcento: "#24140A",
    texto: "#F3ECF7",
    muted: "#A796B5",
    panel: "#251735",
    hablantes: { principal: "#FFB547", secundario: "#5CF2C8", extra: "#FF8FB1", narrador: "#F3ECF7" },
  },
  durazno: {
    nombre: "Durazno",
    claro: true,
    bg: "#FBE2D3",
    bgDeep: "#F3CFBA",
    acento: "#0F766E",
    sobreAcento: "#FFFFFF",
    texto: "#21160F",
    muted: "#7A5E4E",
    panel: "#FFF6F0",
    hablantes: { principal: "#0F766E", secundario: "#7C3AED", extra: "#B45309", narrador: "#21160F" },
  },
};

// ── utilidades de color ──────────────────────────────────────
const rgb = (hex: string) => {
  const s = hex.replace("#", "");
  const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s.slice(0, 6);
  const n = parseInt(f, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const aHex = (v: number[]) => "#" + v.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
/** Mezcla a → b (t = 0..1) */
export const mezclar = (a: string, b: string, t: number) => {
  const A = rgb(a);
  const B = rgb(b);
  return aHex(A.map((v, i) => v + (B[i] - v) * t));
};
const hexA = (hex: string, a: number) => {
  const [r, g, b] = rgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
const lum = (hex: string) => {
  const ch = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
};
/** Contraste WCAG entre dos colores hex (1 a 21) */
export const contraste = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
/** Texto legible encima de un color (blanco o casi negro) */
export const textoSobre = (fondo: string) => (fondo.startsWith("#") && contraste(fondo, "#FFFFFF") >= contraste(fondo, "#10140F") ? "#FFFFFF" : "#10140F");
/** Oscurece (en fondos claros) o aclara (en oscuros) un color hasta que se lea sobre el fondo */
export const legible = (c: string, bg: string, min = 3) => {
  const hacia = lum(bg) > 0.4 ? "#000000" : "#FFFFFF";
  let out = c;
  for (let t = 0.08; contraste(out, bg) < min && t <= 1; t += 0.08) out = mezclar(c, hacia, t);
  return out;
};

// ── fondos de marca (perfiles/canal.json → fondos.marca) ─────
// Perfiles de la v1 (colores por plataforma, sin "fondos"): esos colores pasan a ser los de marca
const v1 = CANAL.plataformas?.tiktok;
const marca = CANAL.fondos?.marca ?? (v1?.acento ? { acento: v1.acento, acento2: v1.acento2, oscuro: v1.fondo } : undefined);
const ACENTO = marca?.acento || "#6C8CFF";
const ACENTO2 = marca?.acento2 || "#FFD23F";

const armarMarca = (claro: boolean): Ambiente => {
  const bg = claro ? marca?.claro || mezclar(ACENTO, "#FFFFFF", 0.9) : marca?.oscuro || mezclar(ACENTO, "#0B0D12", 0.92);
  const texto = claro ? "#16181D" : "#EEF0F4";
  const acento = legible(ACENTO, bg, 3.5);
  return {
    nombre: claro ? "Marca claro" : "Marca oscuro",
    claro,
    bg,
    bgDeep: claro ? mezclar(bg, "#000000", 0.07) : mezclar(bg, "#000000", 0.4),
    acento,
    sobreAcento: textoSobre(acento),
    texto,
    muted: mezclar(texto, bg, claro ? 0.45 : 0.42),
    panel: claro ? mezclar(bg, "#FFFFFF", 0.6) : mezclar(mezclar(bg, "#FFFFFF", 0.05), ACENTO, 0.05),
    hablantes: {
      principal: acento,
      secundario: legible(ACENTO2, bg, 3.5),
      extra: legible(claro ? "#7C3AED" : "#FFC24B", bg, 3.5),
      narrador: texto,
    },
  };
};

export const AMBIENTES: Record<AmbienteId, Ambiente> = {
  ...FIJOS,
  "marca-oscuro": armarMarca(false),
  "marca-claro": armarMarca(true),
};

/** Orden en que rotan los fondos en cada plataforma (según perfiles/canal.json → fondos.usar) */
export const rotacionDe = (canal: "tiktok" | "youtube"): AmbienteId[] => {
  const base = ((rotacionJson as Record<string, string[]>)[canal] ?? Object.keys(FIJOS)).filter((id) => FIJOS[id]);
  const usar = CANAL.fondos?.usar ?? "rotar";
  if (usar === "marca") return ["marca-oscuro", "marca-claro"];
  if (usar === "mezclar") return [...base.slice(0, 2), "marca-oscuro", "marca-claro", ...base.slice(2)];
  return base;
};

/** Fondo aplicado en este momento */
export const ambienteActual = { id: "grafito" as AmbienteId, claro: false };

export const aplicarAmbiente = (id: AmbienteId) => {
  const a = AMBIENTES[id] ?? AMBIENTES.grafito;
  ambienteActual.id = AMBIENTES[id] ? id : "grafito";
  ambienteActual.claro = a.claro;
  color.sombra = a.claro ? "rgba(60,40,20,0.16)" : "rgba(0,0,0,0.35)";
  color.vineta = a.claro ? "rgba(70,50,30,0.10)" : "rgba(0,0,0,0.55)";
  color.bg = a.bg;
  color.bgDeep = a.bgDeep;
  color.lime = a.acento;
  color.ink = a.sobreAcento;
  color.text = a.texto;
  color.muted = a.muted;
  color.dim = hexA(a.texto, a.claro ? 0.3 : 0.32);
  color.panel = a.panel;
  color.panelEdge = hexA(a.acento, a.claro ? 0.45 : 0.3);
  color.accentSoft = hexA(a.acento, 0.15);
  color.grid = hexA(a.claro ? a.texto : a.acento, a.claro ? 0.06 : 0.045);
  color.gridFine = hexA(a.claro ? a.texto : a.acento, a.claro ? 0.03 : 0.022);
  color.floor = a.claro ? hexA(a.texto, 0.06) : hexA(a.acento, 0.05);
  color.floorLine = hexA(a.claro ? a.texto : a.acento, a.claro ? 0.25 : 0.22);
  color.textShadow = a.claro ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.45)";
  color.teal = a.claro ? "#0F766E" : "#3BD6C6";
  color.coral = a.claro ? "#C2410C" : "#FF7A5C";
  color.amber = a.claro ? "#B45309" : "#FFC24B";
  color.vozPrincipal = a.hablantes.principal;
  color.vozSecundario = a.hablantes.secundario;
  color.vozExtra = a.hablantes.extra;
  color.vozNarrador = a.hablantes.narrador;
  estiloPersonaje.contorno = a.claro ? "#1A1714" : null;
  estiloPersonaje.bordeLuz = a.claro ? null : "rgba(255,255,255,0.22)";
  return a;
};

/** Fondo por defecto si el video no trae uno: estable según el id, dentro de la rotación de su plataforma */
export const ambientePorId = (id: string, canal: "tiktok" | "youtube" = "youtube"): AmbienteId => {
  const lista = rotacionDe(canal);
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return lista[h % lista.length];
};
