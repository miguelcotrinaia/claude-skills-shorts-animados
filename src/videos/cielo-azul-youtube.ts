import type { VideoSpec } from "../engine/types";

// VIDEO DE EJEMPLO (plantilla). Serie "Explicado en 1 minuto" · estilo clase.
// Úsalo como referencia de formato; puedes borrarlo cuando tengas tus propios videos.
export const cieloAzulYoutube: VideoSpec = {
  id: "cielo-azul-youtube",
  canal: "youtube",
  serie: "CIELO AZUL · CIENCIA DE BOLSILLO",
  resaltar: ["Rayleigh", "dispersión", "azul", "violeta", "ojos", "atardecer", "rojo"],
  escenas: [
    {
      tipo: "duo",
      titulo: "Por qué el cielo es *azul*",
      dice: "¿Por qué el cielo es azul? Por un efecto llamado dispersión de Rayleigh.",
      principal: { expresion: "confiado", brazos: "explicar" },
      secundario: { expresion: "neutral" },
      prop: { tipo: "icono", texto: "RAYLEIGH", sub: "dispersión de la luz" },
    },
    {
      tipo: "pasos",
      titulo: "Cómo *funciona*",
      dice: "La luz del sol trae todos los colores. Al chocar con las moléculas del aire, cada color se desvía distinto.",
      pasos: ["Luz blanca del sol", "Choca con el aire", "Cada color se desvía distinto"],
    },
    {
      tipo: "comparar",
      titulo: "Gana el *azul*",
      dice: "El azul se dispersa casi seis veces más que el rojo. Por eso llega a tus ojos desde todo el cielo.",
      items: [
        { etiqueta: "Luz azul", valor: 6, nota: "×", color: "acento" },
        { etiqueta: "Luz roja", valor: 1, nota: "×", color: "alerta" },
      ],
    },
    {
      tipo: "duo",
      titulo: "¿Y el *violeta*?",
      dice: "Pero el violeta se dispersa todavía más. ¿Por qué no vemos el cielo violeta?",
      habla: "secundario",
      principal: { expresion: "pensando", brazos: "pensar" },
      secundario: { expresion: "sorprendido", brazos: "senalar" },
      globo: { quien: "secundario", texto: "¿Y el violeta?" },
    },
    {
      tipo: "duo",
      titulo: "Tus *ojos* deciden",
      dice: "El sol emite menos violeta y tus ojos son más sensibles al azul. El resultado es el cielo que ves.",
      principal: { expresion: "feliz", brazos: "explicar" },
      secundario: { expresion: "feliz" },
      prop: { tipo: "icono", texto: "OJOS", sub: "más sensibles al azul" },
    },
    {
      tipo: "duo",
      titulo: "Y el *atardecer*",
      dice: "Al atardecer la luz cruza mucho más aire. El azul se dispersa en el camino y te llega el naranja y el rojo.",
      principal: { expresion: "neutral", brazos: "explicar" },
      secundario: { expresion: "corazon" },
    },
    {
      tipo: "cta",
      titulo: "Ciencia de *bolsillo*",
      dice: "Ahora ya sabes por qué el cielo es azul. Sígueme como @tucanal en todas las redes.",
      curso: "Más en el video relacionado",
    },
  ],
};
