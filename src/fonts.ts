import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { font } from "./theme";

// Fuentes locales (public/fonts): no dependen de internet al renderizar.
const faces: { family: string; file: string; weight: string }[] = [
  { family: font.title, file: "sora-latin-600-normal.woff2", weight: "600" },
  { family: font.title, file: "sora-latin-700-normal.woff2", weight: "700" },
  { family: font.title, file: "sora-latin-800-normal.woff2", weight: "800" },
  { family: font.mono, file: "jetbrains-mono-latin-500-normal.woff2", weight: "500" },
  { family: font.mono, file: "jetbrains-mono-latin-700-normal.woff2", weight: "700" },
];

let loaded = false;
export const ensureFonts = () => {
  if (loaded) return;
  loaded = true;
  for (const f of faces) {
    loadFont({
      family: f.family,
      url: staticFile(`fonts/${f.file}`),
      weight: f.weight,
    }).catch((e) => console.error("Font load error", f.file, e));
  }
};
