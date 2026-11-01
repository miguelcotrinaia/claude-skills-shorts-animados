import type { VideoSpec } from "../engine/types";

// VIDEO DE EJEMPLO (plantilla). Serie "Explicado en 1 minuto" · YouTube · estilo clase · diálogo.
// Úsalo como referencia de formato; puedes borrarlo cuando tengas tus propios videos.
export const cieloAzulYoutube: VideoSpec = {
  id: "cielo-azul-youtube",
  canal: "youtube",
  ambiente: "niebla",
  serie: "CIELO AZUL · CIENCIA DE BOLSILLO",
  resaltar: ["Rayleigh", "dispersa", "azul", "violeta", "atardecer", "naranja", "Tyndall"],
  escenas: [
    {
      tipo: "duo",
      titulo: "Por qué el cielo es *azul*",
      prop: { tipo: "icono", texto: "RAYLEIGH", sub: "dispersión de la luz" },
      dialogo: [{ quien: "principal", texto: "¿Por qué el cielo es azul? Por un efecto llamado dispersión de Rayleigh.", gesto: "explicar" }],
    },
    {
      tipo: "pregunta",
      titulo: "En *simple*",
      pregunta: "¿Qué significa eso?",
      de: "secundario",
      dialogo: [
        { quien: "secundario", texto: "¿Y eso qué significa en palabras simples?", gesto: "encoger", cara: "pensando" },
        { quien: "principal", texto: "Que el aire desvía la luz, y no a todos los colores por igual.", gesto: "explicar" },
      ],
    },
    {
      tipo: "diagrama",
      titulo: "Cómo *funciona*",
      direccion: "vertical",
      nodos: [
        { id: "luz", texto: "Luz blanca", aparece: "blanca" },
        { id: "aire", texto: "Moléculas del aire", icono: "nube", aparece: "moléculas" },
        { id: "todas", texto: "Luz en todas direcciones", aparece: "direcciones" },
      ],
      flujo: true,
      dialogo: [
        { quien: "principal", texto: "La luz del sol es blanca: trae todos los colores.", gesto: "senalar" },
        { quien: "principal", texto: "Al chocar con las moléculas del aire, se dispersa en todas direcciones.", gesto: "explicar", resalta: true },
      ],
    },
    {
      tipo: "comparar",
      titulo: "Gana el *azul*",
      items: [
        { etiqueta: "Luz azul", valor: 6, nota: "×", color: "acento", aparece: "azul" },
        { etiqueta: "Luz roja", valor: 1, nota: "×", color: "alerta", aparece: "rojo" },
      ],
      dialogo: [
        { quien: "narrador", texto: "Los colores de onda corta se dispersan más. El azul, casi seis veces más que el rojo." },
        { quien: "principal", texto: "Por eso el azul te llega desde todas partes del cielo.", gesto: "senalar-arriba" },
      ],
    },
    {
      tipo: "pregunta",
      titulo: "¿Y el *violeta*?",
      pregunta: "¿Por qué no es violeta?",
      de: "extra",
      extra: "estudiante",
      dialogo: [
        { quien: "extra", extra: "estudiante", texto: "¿Y el violeta? Tiene la onda todavía más corta.", gesto: "encoger" },
        { quien: "principal", texto: "Buena pregunta. El sol emite menos violeta y tus ojos son más sensibles al azul.", gesto: "asentir" },
      ],
    },
    {
      tipo: "linea",
      titulo: "Quién lo *descubrió*",
      eventos: [
        { fecha: "1869", texto: "Tyndall lo reproduce en un laboratorio", aparece: "Tyndall" },
        { fecha: "1871", texto: "Rayleigh lo explica con matemáticas", aparece: "Rayleigh" },
      ],
      dialogo: [{ quien: "narrador", texto: "En 1869 Tyndall lo reprodujo en un laboratorio; en 1871 Rayleigh lo explicó con matemáticas." }],
    },
    {
      tipo: "duo",
      titulo: "Y el *atardecer*",
      dialogo: [
        { quien: "secundario", texto: "¿Y por qué los atardeceres son naranjas?", gesto: "pensar", cara: "pensando" },
        { quien: "principal", texto: "Al atardecer la luz cruza mucho más aire. El azul se pierde en el camino y llega el naranja.", gesto: "explicar" },
      ],
    },
    {
      tipo: "resumen",
      titulo: "En *resumen*",
      puntos: [
        { texto: "La luz trae todos los colores", aparece: "colores" },
        { texto: "El aire dispersa el azul", aparece: "azul" },
        { texto: "Al atardecer gana el naranja", aparece: "naranja" },
      ],
      dialogo: [{ quien: "principal", texto: "En resumen: la luz trae todos los colores, el aire dispersa el azul y al atardecer gana el naranja.", gesto: "senalar" }],
    },
    {
      tipo: "cta",
      titulo: "Ciencia de *bolsillo*",
      dialogo: [
        { quien: "principal", texto: "Ahora ya sabes por qué el cielo es azul.", gesto: "explicar" },
        { quien: "principal", texto: "Sígueme como @tucanal en todas las redes.", gesto: "saludo" },
      ],
    },
  ],
};
