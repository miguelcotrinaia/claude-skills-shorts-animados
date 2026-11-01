// Tema visual compartido. Los colores los pone el FONDO de cada video (src/engine/ambientes.ts);
// aquí están solo los valores iniciales.

export const W = 1080;
export const H = 1920;
export const FPS = 30;

// Nombres internos de color:
//   lime  = acento del fondo (palabras clave, barras, detalles)
//   teal  = acento secundario
//   coral = alertas, costos, errores
export const color = {
  bg: "#0B1311",
  bgDeep: "#070C0B",
  grid: "rgba(200, 242, 90, 0.045)",
  gridFine: "rgba(200, 242, 90, 0.022)",
  floor: "#101C19",
  floorLine: "rgba(200, 242, 90, 0.22)",
  text: "#EEF3EA",
  muted: "#8FA39A",
  dim: "rgba(238, 243, 234, 0.32)",
  lime: "#C8F25A",
  teal: "#3BD6C6",
  coral: "#FF7A5C",
  amber: "#FFC24B",
  ink: "#0E1A17", // texto sobre el acento
  panel: "#13211E",
  panelEdge: "rgba(200, 242, 90, 0.28)",
  accentSoft: "rgba(200, 242, 90, 0.15)",
  textShadow: "rgba(0,0,0,0.45)",
  sombra: "rgba(0,0,0,0.35)", // sombra dura de paneles
  vineta: "rgba(0,0,0,0.55)", // oscurecido de bordes
  // color de subtítulos por quien habla
  vozPrincipal: "#C8F25A",
  vozSecundario: "#5CF2C8",
  vozExtra: "#FFC24B",
  vozNarrador: "#EEF3EA",
};

/** Estilo de los personajes según el fondo (contorno en claros, borde de luz en oscuros) */
export const estiloPersonaje = {
  contorno: null as string | null,
  grosor: 1.6,
  bordeLuz: "rgba(255,255,255,0.18)" as string | null,
};

export const font = {
  title: "Sora",
  mono: "JetBrains Mono",
};

// Zonas seguras (1080x1920): arriba ~150 px y abajo ~420 px los tapan los botones de cada app.
export const layout = {
  kickerY: 190,
  titleY: 250,
  floorY: 1230,
  handleY: 1262,
  captionsY: 1335,
  sidePad: 110,
  leftX: 290,
  rightX: 790,
  centerX: 540,
};

/** Tamaño del lienzo y zonas que usan la cámara y las capas */
export const lienzo = {
  W: 1080,
  H: 1920,
  horizontal: false,
  pisoMax: 1290, // el piso nunca sube de aquí en pantalla (encima de los subtítulos)
  centroY: 870, // centro de la zona de contenido en pantalla (entre título y subtítulos)
  tituloAlto: 440, // fin de la zona del título
  alturaUtil: 820, // alto disponible para enfocar un objeto
};
