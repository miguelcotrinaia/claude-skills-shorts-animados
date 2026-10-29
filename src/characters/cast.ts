import type { HumanLook } from "./Human";
import { PERSONAJES } from "../perfiles";

// ─────────────────────────────────────────────────────────────
// Elenco. Sale de perfiles/personajes.json: para cambiar a alguien,
// usa /personajes editar (o edita ese archivo). No edites este.
// ─────────────────────────────────────────────────────────────

/** Personaje principal con su vestuario de siempre */
export const PRINCIPAL: HumanLook = PERSONAJES.principal.look;

/** Personaje principal con el vestuario alterno (si no hay, es el mismo) */
export const PRINCIPAL_ALTERNO: HumanLook = { ...PERSONAJES.principal.look, ...(PERSONAJES.principal.lookAlterno ?? {}) };

export const NOMBRE_PRINCIPAL = PERSONAJES.principal.nombre;
export const NOMBRE_SECUNDARIO = PERSONAJES.secundario.nombre;

/** Personajes extra (se reutilizan en cualquier video: escenas "multitud" con personas) */
export const PERSONAS: Record<string, HumanLook> = PERSONAJES.extras ?? {};

/** Colores de las figuritas pequeñas (escenas "multitud" con bots) */
export const MINIBOT_COLORS = PERSONAJES.miniBots?.length ? PERSONAJES.miniBots : ["#8A93B8", "#A7B5A0", "#C9A0B8", "#B3A58E", "#8FB3C9"];
