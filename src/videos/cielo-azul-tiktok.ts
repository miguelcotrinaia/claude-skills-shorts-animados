import type { VideoSpec } from "../engine/types";

// VIDEO DE EJEMPLO (plantilla). Serie "Mito o realidad" · TikTok · estilo ágil · diálogo.
// Úsalo como referencia de formato; puedes borrarlo cuando tengas tus propios videos.
export const cieloAzulTiktok: VideoSpec = {
  id: "cielo-azul-tiktok",
  canal: "tiktok",
  ambiente: "grafito",
  serie: "CIELO AZUL · CIENCIA DE BOLSILLO",
  resaltar: ["azul", "mar", "aire", "seis", "rojo", "naranja", "Marte"],
  escenas: [
    {
      tipo: "duo",
      titulo: "¿Por qué el cielo es *azul*?",
      prop: { tipo: "icono", texto: "SOL", sub: "luz blanca" },
      dialogo: [
        { quien: "principal", texto: "¿Por qué el cielo es azul si la luz del sol es blanca?", gesto: "explicar" },
        { quien: "secundario", texto: "¡Fácil! Porque refleja el mar.", gesto: "celebrar", cara: "feliz" },
      ],
    },
    {
      tipo: "pregunta",
      titulo: "¿Refleja el *mar*?",
      pregunta: "¿De dónde sale el azul?",
      de: "secundario",
      dialogo: [
        { quien: "principal", texto: "Mito. En pleno desierto el cielo también es azul.", gesto: "negar" },
        { quien: "secundario", texto: "¿Entonces de dónde sale el azul?", gesto: "facepalm", cara: "error" },
      ],
    },
    {
      tipo: "diagrama",
      titulo: "La luz *rebota*",
      nodos: [
        { id: "sol", texto: "Luz del sol", aparece: "luz" },
        { id: "aire", texto: "Aire", icono: "nube", aparece: "aire" },
        { id: "todos", texto: "Para todos lados", aparece: "lados" },
      ],
      flujo: true,
      dialogo: [{ quien: "principal", texto: "La luz choca con el aire y se desvía para todos lados.", gesto: "senalar", resalta: true }],
    },
    {
      tipo: "comparar",
      titulo: "Gana el *azul*",
      items: [
        { etiqueta: "Luz azul", valor: 6, nota: "×", color: "acento", aparece: "azul" },
        { etiqueta: "Luz roja", valor: 1, nota: "×", color: "alerta", aparece: "rojo" },
      ],
      dialogo: [
        { quien: "narrador", texto: "El azul se dispersa casi seis veces más que el rojo." },
        { quien: "principal", texto: "Por eso el azul te llega desde todo el cielo.", gesto: "senalar-arriba" },
      ],
    },
    {
      tipo: "duo",
      titulo: "¿Y el *atardecer*?",
      dialogo: [
        { quien: "secundario", texto: "¿Y por qué de tarde se pone naranja?", gesto: "pensar", cara: "pensando" },
        { quien: "principal", texto: "La luz cruza más aire y el azul se pierde en el camino.", gesto: "explicar" },
      ],
    },
    {
      tipo: "duo",
      titulo: "Dato *extra*",
      prop: { tipo: "icono", texto: "MARTE", sub: "atardeceres azules" },
      dialogo: [
        { quien: "narrador", texto: "Dato extra: en Marte los atardeceres son azules." },
        { quien: "secundario", texto: "¡Me mudo a Marte!", gesto: "saltar", cara: "feliz" },
      ],
    },
    {
      tipo: "cta",
      titulo: "¿Y *tú*?",
      pregunta: "¿Lo sabías?",
      dialogo: [
        { quien: "principal", texto: "¿Sabías esto? Cuéntame en los comentarios.", gesto: "senalar" },
        { quien: "principal", texto: "Sígueme como @tucanal en todas las redes.", gesto: "saludo" },
      ],
    },
  ],
};
