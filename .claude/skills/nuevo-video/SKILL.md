---
name: nuevo-video
description: Crea un short animado para TikTok, YouTube o ambos con los personajes y la línea editorial del canal — propone el guion para aprobar, entrega los textos para publicar, genera la voz en off con ElevenLabs (o usa el audio de la persona, o va sin voz) y exporta el MP4 sincronizado. También configura la línea editorial (/nuevo-video editorial) y la voz por defecto (/nuevo-video voz). Úsalo cuando pidan un video nuevo, los textos de un video, cambiar el estilo de TikTok o YouTube, o cambiar la voz.
argument-hint: "<tiktok|youtube|ambos> <tema>  ·  editorial [cambio]  ·  voz"
---

# Nuevo video

La persona puede no saber programar: habla simple, corre tú los comandos y nunca le pidas que pegue claves en el chat.

| Lo que escribe | Qué haces |
|---|---|
| `/nuevo-video <tiktok\|youtube\|ambos> <tema>` | **Video** (pasos 0–8). Si no dice la plataforma, pregunta: "¿TikTok, YouTube o ambos?" |
| `/nuevo-video editorial [cambio]` | **Línea editorial**: crearla o cambiar algo puntual (ver sección al final). |
| `/nuevo-video voz` | **Voz por defecto**: ver o cambiar (ver sección al final). |
| "dame los textos de `<id>`" | Ve directo al paso 5. |
| "ya dejé mi audio de `<id>`" | `npm run sincronizar -- <id>` → paso 7. |

## Video

0. **Preparación** (rápida, cada vez):
   - Si no existe `node_modules`: `npm install` (avisa que la primera vez tarda 1–2 minutos).
   - `npm run estado`. La última línea dice `personajes=… canal=… editorial=… clave=… voz=…`.
1. **Perfiles.** Solo se piden si no hay uno propio:
   - `personajes=ejemplo` o `falta` → pregunta: **Crear mis personajes** (sigue el skill `personajes`, en
     `.claude/skills/personajes/SKILL.md`, y vuelve aquí) · **Usar los de ejemplo por ahora** ·
     **Quedarme con los de ejemplo** (pon `"plantilla": false` en `perfiles/personajes.json` para no volver a preguntar).
   - `canal` o `editorial` = `ejemplo` o `falta` → pregunta: **Configurar mi línea editorial** (sección
     "Línea editorial" de abajo, y vuelve aquí) · **Usar la de ejemplo por ahora** · **Quedarme con la de ejemplo**
     (pon `plantilla: false` en `perfiles/linea-editorial.md` y `"plantilla": false` en `perfiles/canal.json`).
   - "Por ahora" vale para esta conversación: no lo vuelvas a preguntar hasta la próxima.
   - Lee **`CLAUDE.md`** (tipos de escena, poses, reglas), **`perfiles/linea-editorial.md`** (cómo se escribe
     para cada plataforma), y de **`perfiles/personajes.json`** y **`perfiles/canal.json`** los nombres, papeles,
     personalidades, @usuario y lema.
2. **Propón el guion primero**, en una tabla por plataforma: escena · tipo · título · lo que se dice. No crees archivos todavía.
   - Sigue **exactamente** lo que dice `perfiles/linea-editorial.md` para cada plataforma: duración, número de
     escenas, palabras, gancho, estructura, cierre (`pregunta` o `curso`) y series.
   - Calcula ~2.5 palabras por segundo de voz (30 s ≈ 75 palabras) y dilo bajo cada tabla: "~N palabras · ~S s".
   - **Ambos:** mismo tema, dos guiones distintos (no copiar uno en el otro), cada uno con su serie.
   - Usa a los personajes según su papel y personalidad. Hay **una sola voz en off**: `habla` solo indica quién mueve la boca.
   - Última frase de voz: la firma que indica la línea editorial (con el @usuario escrito, ej. `@tucanal`).
   - `serie`: `"<TEMA> · <LEMA>"`. Verifica datos y cifras. Respeta la lista "Evitar" de la línea editorial.
   - Pregunta: **Aprobar** · **Ajustar** (qué cambiar). Itera hasta el visto bueno.
3. Con el visto bueno, crea `src/videos/<tema>-tiktok.ts` y/o `src/videos/<tema>-youtube.ts` (kebab-case, sin tildes)
   con `canal` puesto, y regístralos en `src/videos/index.ts`. Usa `src/videos/cielo-azul-*.ts` como modelo de formato.
4. **Verifica:** `npm run typecheck` y 3–4 stills por video: `npx remotion still <id> out/check-<n>.png --frame=<f>`;
   míralos (textos que se salen, solapes con personajes) y corrige.
5. **Entrega de textos** (siempre, por cada video):
   1. Corre `npm run guion -- <id>`: genera `out/<id>-guion-voz.txt` (texto plano, una línea por escena, con el
      @usuario escrito como se pronuncia).
   2. Escribe los textos de publicación en `out/<id>-publicar.md`, siguiendo la sección "Textos para publicar"
      de `perfiles/linea-editorial.md` (descripción de TikTok; título y descripción de YouTube; hashtags fijos).
   3. **Muéstralos en el chat**, cada uno en su propio bloque de código para copiar y pegar, sin markdown dentro:
      **Guion para voz** (el contenido exacto de `out/<id>-guion-voz.txt`) y los textos de publicación.
      Para YouTube, recuerda lo de **Video relacionado** si la línea editorial lo menciona.
6. **Voz en off.** Una sola vez aunque sean dos videos. Corre `npm run voces -- --info`.
   - **Si dice `SIN_CLAVE`** (no hay clave de ElevenLabs), pregunta:
     - **Pegar mi clave de ElevenLabs** → explícale: elevenlabs.io → Developers → API Keys → crear una con
       permiso Text to Speech → abrir el archivo `.env` de esta carpeta → pegarla después de `ELEVENLABS_API_KEY=`
       → guardar → avisarte. Luego sigue con "con clave".
     - **Usar mi propio audio** (grabado o de otra app) → que lea el guion del paso 5 y guarde el audio como
       **`public/audio/<id>.mp3`** (también vale .wav o .m4a), un archivo por video, y te avise. Entonces corre
       `npm run sincronizar -- <id>` y sigue al paso 7.
     - **Sin voz por ahora** → sigue al paso 7 (vista previa con tiempos estimados; se le pone voz después).
   - **Con clave:** cuenta los caracteres a usar (largo de `out/<id>-guion-voz.txt`, sumando todos los videos) y
     **pregunta**: "¿Genero la voz con **<nombre> (<voiceId>)**? Usará ~N caracteres de los M disponibles."
     Opciones: **Mantener esta voz** · **Cambiar de voz** · **Sin voz IA (usaré mi audio o ninguno)**. No generes nada sin su respuesta.
     1. **Cambiar de voz:** `npm run voces` lista las voces de su cuenta (nombre + voice ID), o acepta un voice ID que pegue.
        Pregunta si es **solo para este video** (`--voz <voiceId>`) o **la nueva voz por defecto** (`npm run voces -- --usar <voiceId>`).
     2. Genera: `npm run voz:ia -- <id>` (o `npm run voz:ia -- <id> --voz <voiceId>`), una vez por video. Crea
        `public/audio/<id>.mp3` y los subtítulos ya sincronizados con los tiempos exactos de ElevenLabs.
     3. Si falla, explica el mensaje en simple. Si la voz por defecto **no está en su cuenta** (es de otra cuenta),
        muéstrale sus voces con `npm run voces` para elegir una. Si no hay créditos o la clave no tiene permisos,
        ofrece las opciones de "sin clave".
     - **Sin voz IA:** igual que "Usar mi propio audio" o "Sin voz por ahora".
7. **Exporta el video:** `npm run render -- <id>` por cada video → `out/<id>.mp4` (1–3 min).
   Con voz es el video final; sin voz, una vista previa con tiempos estimados.
   Si el render se detiene por "voz sin sincronizar", corre `npm run sincronizar -- <id>` y vuelve a exportar.
8. **Cierra** con una lista corta: voz usada (nombre e ID, o "audio propio" / "sin voz"), duración de cada video y
   las rutas `out/<id>.mp4`, `out/<id>-guion-voz.txt`, `out/<id>-publicar.md`. Si quedó sin voz, recuerda en una
   línea dónde dejar el audio (`public/audio/<id>.mp3`) para terminarlo.

Si un tema necesita una escena que no existe, propón el tipo nuevo antes de crearlo (ver "Añadir un tipo de escena nuevo" en `CLAUDE.md`).

## Línea editorial (`/nuevo-video editorial`)

Vive en dos archivos: **`perfiles/linea-editorial.md`** (cómo se escribe: tono, público, reglas y estructura por
plataforma, textos de publicación) y **`perfiles/canal.json`** (lo que se ve en el video: @usuario, cómo se lee,
lema, redes, colores y estilo `agil`/`clase` por plataforma). El ejemplo está en `plantillas/ejemplo/`.

**Crear** (si es de ejemplo o no existe). Muestra primero, en 5–6 líneas, cómo es la línea de ejemplo y pregunta
en un solo mensaje:
1. Nombre del canal, **@usuario** y cómo se pronuncia.
2. **De qué trata** y **para quién** (público).
3. **Tono** (cercano, divertido, experto, inspirador…) y qué quiere **evitar**.
4. **Idioma y acento.**
5. Por plataforma: **objetivo**, **duración** y si comparten tema o van distintas. Sugerencia por defecto:
   TikTok ágil 25–40 s para comentarios; YouTube clase 35–55 s para búsquedas.
6. Opcional: lema o nombre de la serie, **hashtag fijo**, frase de cierre, redes, **colores de marca**.

Lo que no indique, propónlo tú tomando el ejemplo como base y díselo. Luego:
- Escribe `perfiles/linea-editorial.md` con la **misma estructura de secciones que el ejemplo** y `plantilla: false`
  en el encabezado. Convierte la duración en palabras (~2.5 por segundo) y escenas (una idea por escena, ~6–8 s cada una).
- Escribe `perfiles/canal.json` con `"plantilla": false` (formato igual al ejemplo; `estilo`: `agil` o `clase`;
  colores `#RRGGBB` que contrasten con fondo oscuro; `idioma` tipo `es-PE`, `es-MX`, `es-ES`, `en-US`).
- Corre `npm run perfiles` y corrige hasta "✔ Perfiles válidos".
- Si cambió colores o estilo: exporta un still por plataforma de un video existente
  (`npx remotion still <id> out/check-estilo-<plataforma>.png --frame=60`), míralo y dile dónde verlo.
- Resume la línea editorial en 5–6 líneas y pide su visto bueno.

**Cambiar algo** (`/nuevo-video editorial más humor en TikTok`, "que YouTube dure 60 s", "cambia mi @"):
edita solo esa parte en el archivo que corresponda (guion → `.md`; lo visual → `canal.json`), valida con
`npm run perfiles` y confirma el cambio en una línea. Aplica a los videos que se creen después; ofrece rehacer
alguno ya hecho si el cambio lo afecta (un @usuario o colores nuevos se aplican solos al volver a exportar).

Para volver al ejemplo: `npm run perfiles -- --restaurar canal` y `npm run perfiles -- --restaurar editorial` (confirma antes).

## Voz por defecto (`/nuevo-video voz`)

- `npm run voces -- --info` → voz por defecto, modelo y créditos. Si dice `SIN_CLAVE`, explica cómo pegar la clave en `.env`.
- `npm run voces` → lista de voces de su cuenta. Para cambiar la de por defecto: `npm run voces -- --usar <voiceId>`
  (queda en `config/voz.json`).
- Es una sola voz en off para todo el video; los personajes no tienen voces separadas.
