// Tema visual compartido. Los colores de cada canal salen de perfiles/canal.json
// (los aplica engine/perfil.ts antes de dibujar cada video). Aquí solo hay valores base.

export const W = 1080;
export const H = 1920;
export const FPS = 30;

// Nombres internos de color:
//   lime  = acento principal del canal
//   teal  = acento secundario (acento2)
//   coral = alertas, costos, errores
export const color = {
  bg: "#0E1116",
  bgDeep: "#08090D",
  grid: "rgba(255, 255, 255, 0.045)",
  floor: "#141821",
  floorLine: "rgba(255, 255, 255, 0.22)",
  text: "#EEF0F4",
  muted: "#9AA2B1",
  dim: "rgba(238, 240, 244, 0.32)",
  lime: "#6C8CFF",
  teal: "#FFD23F",
  coral: "#FF6B5C",
  amber: "#FFC24B",
  ink: "#111318", // texto sobre acento
  panel: "#171B24",
  panelEdge: "rgba(255, 255, 255, 0.28)",
  gridFine: "rgba(255, 255, 255, 0.022)",
  accentSoft: "rgba(255, 255, 255, 0.15)",
};

export const font = {
  title: "Sora",
  mono: "JetBrains Mono",
};

// Zonas seguras para TikTok / Reels / Shorts (en px del lienzo 1080x1920).
// Arriba ~150 px y abajo ~420 px los tapan los botones de cada app: no poner nada importante ahí.
export const layout = {
  kickerY: 190,
  titleY: 250,
  floorY: 1230,
  handleY: 1262, // pastilla fija con el @usuario del canal (sobre el piso)
  captionsY: 1335,
  sidePad: 110,
  // Posiciones estándar del elenco (así los personajes "continúan" entre escenas)
  leftX: 290,
  rightX: 790,
  centerX: 540,
};
