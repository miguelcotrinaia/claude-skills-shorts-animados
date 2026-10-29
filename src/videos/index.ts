import type { VideoSpec } from "../engine/types";
import { cieloAzulTiktok } from "./cielo-azul-tiktok";
import { cieloAzulYoutube } from "./cielo-azul-youtube";

// Registra aquí cada video nuevo (aparece como composición en Remotion Studio).
export const VIDEOS: VideoSpec[] = [cieloAzulYoutube, cieloAzulTiktok];
