import type { VideoSpec } from "../engine/types";
import { cieloAzulTiktok } from "./cielo-azul-tiktok";
import { cieloAzulYoutube } from "./cielo-azul-youtube";

// Registra aquí cada video nuevo, al final de la lista (aparece en Remotion Studio).
// El orden importa: el siguiente fondo de cada plataforma se elige mirando el último video registrado.
export const VIDEOS: VideoSpec[] = [cieloAzulYoutube, cieloAzulTiktok];
