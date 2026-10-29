import type { VideoSpec } from "../engine/types";

// VIDEO DE EJEMPLO (plantilla). Serie "Mito o realidad" · estilo ágil.
// Úsalo como referencia de formato; puedes borrarlo cuando tengas tus propios videos.
export const cieloAzulTiktok: VideoSpec = {
  id: "cielo-azul-tiktok",
  canal: "tiktok",
  serie: "CIELO AZUL · CIENCIA DE BOLSILLO",
  resaltar: ["azul", "mar", "aire", "seis", "rojo", "atardecer"],
  escenas: [
    {
      tipo: "duo",
      titulo: "¿Por qué el cielo es *azul*?",
      dice: "¿Por qué el cielo es azul si la luz del sol es blanca?",
      principal: { expresion: "sorprendido", brazos: "senalar" },
      secundario: { expresion: "pensando" },
      prop: { tipo: "icono", texto: "SOL", sub: "luz con todos los colores" },
    },
    {
      tipo: "duo",
      titulo: "Chispa *opina*",
      dice: "¡Fácil! El cielo refleja el mar.",
      habla: "secundario",
      principal: { expresion: "pensando", brazos: "pensar" },
      secundario: { expresion: "feliz", brazos: "celebrar" },
      globo: { quien: "secundario", texto: "¡Refleja el mar!" },
    },
    {
      tipo: "duo",
      titulo: "*Mito*",
      dice: "Mito. En pleno desierto el cielo también es azul.",
      principal: { expresion: "confiado", brazos: "explicar" },
      secundario: { expresion: "error" },
    },
    {
      tipo: "comparar",
      titulo: "El azul *rebota* más",
      dice: "El aire dispersa la luz azul casi seis veces más que la roja.",
      items: [
        { etiqueta: "Luz azul", valor: 6, nota: "×", color: "acento" },
        { etiqueta: "Luz roja", valor: 1, nota: "×", color: "alerta" },
      ],
    },
    {
      tipo: "duo",
      titulo: "Por eso el *atardecer*",
      dice: "Al atardecer la luz cruza más aire, el azul se pierde y llega el rojo.",
      principal: { expresion: "feliz", brazos: "explicar" },
      secundario: { expresion: "sorprendido" },
    },
    {
      tipo: "cta",
      titulo: "¿Y *tú*?",
      dice: "¿Lo sabías? Cuéntame en comentarios. Sígueme como @tucanal en todas las redes.",
      pregunta: "¿Lo sabías?",
    },
  ],
};
