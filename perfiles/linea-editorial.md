---
plantilla: true
---

# Línea editorial · Ciencia de Bolsillo (@tucanal)

> EJEMPLO. Es un canal ficticio para mostrar el formato. Cámbialo con `/nuevo-video editorial`.
> Lo que está aquí lo usa Claude para escribir los guiones y los textos de publicación.
> Los colores, los fondos, el @usuario y el lema que se ven en el video están en `perfiles/canal.json`.
> Los nombres, la personalidad y la voz de cada personaje están en `perfiles/personajes.json`.

## Canal

- **Nombre:** Ciencia de Bolsillo
- **@usuario:** @tucanal (se lee "tu canal")
- **Temática:** datos curiosos de ciencia de la vida diaria (física, química, biología, cuerpo humano, espacio).
- **Público:** jóvenes y adultos curiosos, sin formación científica. Ven el video en el celular, sin sonido al inicio.
- **Idioma y acento:** español neutro latinoamericano.
- **Lema / nombre de la serie:** CIENCIA DE BOLSILLO → la cabecera dice `"<TEMA> · CIENCIA DE BOLSILLO"`.

## Reglas para todos los videos

- Tono: cercano, curioso y claro. Como una amiga que sabe mucho y te lo explica sin hacerte sentir mal.
- Una idea por escena. Frases cortas.
- Gancho en la primera línea: una pregunta o un dato que sorprenda.
- Datos y cifras: solo si son correctos y verificables. Si un número es aproximado, dilo ("casi", "unas").
- `titulo` de cada escena: máximo ~5 palabras; la palabra clave entre `*asteriscos*`.
- Números con separador de miles: `42,000`.
- **Evitar:** estructuras "no es A, es B", frases que suenen a IA, exageraciones ("¡increíble!", "¡no vas a creer!"), emojis en el guion.
- Última línea de todos los videos, dicha por Sofi: **"Sígueme como @tucanal en todas las redes."**

## Quién habla (diálogo)

Cada escena es una conversación corta. Cada línea la dice quien mejor transmite la idea; no hace falta que hablen todos.

- **Sofi (principal):** explica, corrige, da el dato central y siempre cierra el video.
- **Chispa (secundario):** hace la pregunta que haría el público, dice el mito que luego se corrige o reacciona con humor.
  No habla en todas las escenas.
- **Voz en off:** solo para un dato con número, una fecha, un caso real o una transición ("Dato extra:…").
  Máximo 1 línea por escena y no en todas.
- **Extras** (profe, científica, estudiante, abuelo, vecina): solo cuando la idea necesita a esa persona
  (la duda de un estudiante, el recuerdo del abuelo). Máximo 1–2 escenas por video.
- Una escena con una sola voz está bien.
- Cada personaje habla con su propia voz (se configura en `/personajes`); si todos tienen la misma, igual se
  distingue quién habla por el subtítulo y la luz bajo sus pies.

## Variedad en pantalla

- No más de 2 escenas `duo` seguidas.
- Al menos una escena dinámica por video: `diagrama`, `pizarra`, `linea`, `pasos` o `comparar`.
- En listas y diagramas, cada elemento aparece cuando se dice (`aparece` con la palabra que se nombra).

## TikTok · versión ágil

- **Objetivo:** que lo vean completo y comenten.
- **Duración:** 40–60 s · ~100–150 palabras · 6–8 escenas · 8–14 líneas de máximo 12 palabras.
- **Gancho:** pregunta o situación cotidiana en la primera línea.
- **Guion:** segunda persona, Chispa con humor, un solo dato central.
- **Estructura:** pregunta → Chispa dice el mito → Sofi lo corrige → cómo funciona → el dato con número →
  dato extra o sorpresa → cierre.
- **Cierre (`cta`):** `pregunta` corta para comentarios. La última idea debe poder enlazar con la primera
  (para que el video se repita).
- **Series:** ¿Sabías que…? · Mito o realidad · Chispa se equivoca.

## YouTube · versión clase

- **Objetivo:** que lo encuentren por búsqueda y aprendan algo completo.
- **Duración:** 60–90 s · ~150–220 palabras · 7–10 escenas · 12–20 líneas de máximo 18 palabras.
- **Gancho:** la pregunta que la gente buscaría, dicha en los primeros 2 segundos.
- **Estructura:** pregunta → nombre del fenómeno → la duda de Chispa → cómo funciona (`diagrama`) →
  dato o comparación → duda frecuente (un extra o Chispa) → historia o caso real (`linea`) → `resumen` → cierre.
- **Cierre (`cta`):** la tarjeta dice "Más en el próximo video" (se cambia en `perfiles/canal.json`).
  Sofi cierra con una frase que resuma lo aprendido y la firma.
- **Series:** Explicado en 1 minuto · Paso a paso · Experimento en casa.

## Ambos

- Mismo tema, dos guiones distintos. No copiar uno en el otro.

## Textos para publicar

**TikTok — descripción**
- 2–3 frases (máx. ~300 caracteres) que empiecen con el gancho del video y usen las palabras clave que se dicen en él.
- Luego: "Sígueme en todas las redes: @tucanal"
- Al final 3–5 hashtags, siempre `#CienciaDeBolsillo`.

**YouTube — título**
- Uno recomendado y 2 alternativas, máx. 60 caracteres, con la pregunta que la gente buscaría al inicio.

**YouTube — descripción**
- 2 frases de resumen con palabras clave.
- Las ideas del video en lista corta.
- "Sígueme en todas las redes: @tucanal"
- Al final 3 hashtags, siempre `#CienciaDeBolsillo`.
- Si el canal tiene un video largo del tema: en YouTube Studio (computadora) → el Short → **Video relacionado** → ese video.

Los textos siguen las mismas reglas: breves, claros, sin emojis salvo que se pidan.
