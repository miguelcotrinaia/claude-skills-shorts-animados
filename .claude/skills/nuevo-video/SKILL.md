---
name: nuevo-video
description: Crea un short animado para TikTok, YouTube o ambos con los personajes y la línea editorial del canal — propone el guion en diálogo para aprobar, entrega los textos para publicar, genera las voces de cada personaje con ElevenLabs (o usa el audio de la persona, o va sin voz) y exporta el MP4 sincronizado. También configura la línea editorial y los fondos (/nuevo-video editorial) y las voces (/nuevo-video voz). Úsalo cuando pidan un video nuevo, los textos de un video, cambiar el estilo de TikTok o YouTube, los fondos o las voces.
argument-hint: "<tiktok|youtube|ambos> <tema>  ·  editorial [cambio]  ·  voz"
---

# Nuevo video

La persona puede no saber programar: habla simple, corre tú los comandos y nunca le pidas que pegue claves en el chat.

| Lo que escribe | Qué haces |
|---|---|
| `/nuevo-video <tiktok\|youtube\|ambos> <tema>` | **Video** (pasos 0–9). Si no dice la plataforma, pregunta: "¿TikTok, YouTube o ambos?" |
| `/nuevo-video editorial [cambio]` | **Línea editorial y fondos**: crearla o cambiar algo puntual (sección al final). |
| `/nuevo-video voz` | **Voces**: ver o cambiar la voz de cada personaje y el modo (sección al final). |
| "dame los textos de `<id>`" | Ve directo al paso 6. |
| "ya dejé mi audio de `<id>`" | `npm run sincronizar -- <id>` → paso 8. |

## Video

0. **Preparación** (rápida, cada vez): `npm run estado`. La última línea dice
   `ESTADO node=… paquetes=… personajes=… canal=… editorial=… clave=… modo=…`.
   Si `npm` o `node` no se reconocen, o dice `node=viejo` o `paquetes=faltan`: haz "Preparar el estudio" de
   `CLAUDE.md` (instala lo que falte) y vuelve aquí.
1. **Perfiles.** Solo se piden si no hay uno propio:
   - `personajes=ejemplo` o `falta` → pregunta: **Crear mis personajes** (sigue el skill `personajes`, en
     `.claude/skills/personajes/SKILL.md`, y vuelve aquí) · **Usar los de ejemplo por ahora** ·
     **Quedarme con los de ejemplo** (pon `"plantilla": false` en `perfiles/personajes.json` para no volver a preguntar).
   - `canal` o `editorial` = `ejemplo` o `falta` → pregunta: **Configurar mi línea editorial** (sección
     "Línea editorial" de abajo, y vuelve aquí) · **Usar la de ejemplo por ahora** · **Quedarme con la de ejemplo**
     (pon `plantilla: false` en `perfiles/linea-editorial.md` y `"plantilla": false` en `perfiles/canal.json`).
   - "Por ahora" vale para esta conversación: no lo vuelvas a preguntar hasta la próxima.
   - Lee **`CLAUDE.md`** (diálogo, tipos de escena, encuadres, poses, reglas), **`perfiles/linea-editorial.md`**
     (quién habla, duración y estructura por plataforma), y de **`perfiles/personajes.json`** y **`perfiles/canal.json`**
     los nombres, papeles, personalidades, extras, @usuario y lema.
2. **Fondo** de cada video: `npm run ambientes -- --siguiente <tiktok|youtube>` (rotan claros y oscuros por plataforma).
   Si son dos videos, cada uno con el de su plataforma.
3. **Propón el guion primero**, sin crear archivos. Una tabla por plataforma con columnas:
   **escena · tipo y encuadre · quién · qué dice · qué se ve**. Debajo: fondo elegido y "~N palabras · ~S s"
   (~2.5 palabras por segundo de voz).
   - Sigue **exactamente** `perfiles/linea-editorial.md` para cada plataforma: duración, escenas, líneas, palabras,
     largo máximo de cada línea, gancho, estructura, cierre (`pregunta` o `curso`) y series.
   - **El diálogo es natural, no forzado:** cada línea la dice quien mejor transmite la idea, según "Quién habla" de la
     línea editorial y la personalidad de cada personaje. Usa los nombres reales de los personajes en la tabla.
     La voz en off solo cuando suma (dato, fecha, caso, transición; máx. 1 línea por escena). Los extras solo si la idea
     necesita a esa persona (máx. 1–2 escenas). Una escena con una sola voz está bien.
   - **Variedad visual:** no más de 2 `duo` seguidos, al menos una escena dinámica (`diagrama`, `pizarra`, `linea`,
     `pasos`, `comparar`). En listas y diagramas, cada elemento aparece cuando se nombra (`aparece`).
   - **Ambos:** mismo tema, dos guiones distintos (no copiar uno en el otro), cada uno con su serie.
   - Última línea: la firma de la línea editorial, dicha por el principal (con el @usuario escrito, ej. `@tucanal`).
   - `serie`: `"<TEMA> · <LEMA>"`. Verifica datos y cifras. Respeta la lista "Evitar" de la línea editorial.
   - Pregunta: **Aprobar** · **Ajustar** (qué cambiar). Itera hasta el visto bueno.
4. Con el visto bueno, crea `src/videos/<tema>-tiktok.ts` y/o `src/videos/<tema>-youtube.ts` (kebab-case, sin tildes)
   con `canal`, `ambiente` y `dialogo` en cada escena, y regístralos **al final** de `src/videos/index.ts`
   (el orden define la rotación de fondos). Usa `src/videos/cielo-azul-*.ts` como modelo de formato.
5. **Verifica:** `npm run typecheck` y `npm run revisar -- <id>`. Mira **solo** `out/revisar/<id>-hoja.png`
   (una toma por línea en una sola imagen): textos que se salen, solapes con personajes o títulos, tomas donde no se ve
   a quien habla. Corrige y vuelve a revisar. Las imágenes sueltas de `out/revisar/<id>/` son solo para ampliar un detalle.
6. **Entrega de textos** (siempre, por cada video):
   1. Corre `npm run guion -- <id>`: genera `out/<id>-guion-voz.txt` (con quién dice cada línea) y
      `out/<id>-guion-plano.txt` (solo el texto).
   2. Escribe los textos de publicación en `out/<id>-publicar.md`, siguiendo la sección "Textos para publicar"
      de `perfiles/linea-editorial.md` (descripción de TikTok; título y descripción de YouTube; hashtags fijos).
   3. **Muéstralos en el chat**, cada uno en su propio bloque de código para copiar y pegar, sin markdown dentro:
      **Guion por voces** (el contenido exacto de `out/<id>-guion-voz.txt`) y los textos de publicación.
7. **Voces con ElevenLabs. Confirma antes de generar**, una sola vez aunque sean dos videos:
   1. Corre `npm run voz:ia -- <id> --plan` por cada video: muestra qué voz tiene cada personaje, cuántas líneas dice,
      el modo y los caracteres. No gasta nada y funciona sin clave.
   2. **Si dice `SIN_CLAVE`** (no hay clave de ElevenLabs), pregunta:
      - **Pegar mi clave de ElevenLabs** → explícale: elevenlabs.io → Developers → API Keys → crear una con
        permiso Text to Speech (y Voices: Read para ver los nombres) → abrir el archivo `.env` de esta carpeta →
        pegarla después de `ELEVENLABS_API_KEY=` → guardar → avisarte. Luego vuelve a correr el `--plan`.
      - **Usar mi propio audio** (grabado o de otra app) → que lea el guion por voces del paso 6 **en orden, con una
        pausa corta entre líneas**, y guarde el audio como **`public/audio/<id>.mp3`** (también vale .wav o .m4a),
        un archivo por video, y te avise. Entonces corre `npm run sincronizar -- <id>` y sigue al paso 8.
      - **Sin voz por ahora** → sigue al paso 8 (vista previa en silencio; se le pone voz después).
   3. **Con clave, pregunta** (con la herramienta de preguntas si está disponible), mostrando las voces del plan:
      "¿Genero las voces así? Voz en off: <voz> · <Principal>: <voz> · <Secundario>: <voz> · Extras: <voz>.
      Usará ~N caracteres de los M disponibles." Si todos tienen la misma voz, dilo en una línea.
      Opciones: **Generar con estas voces** · **Cambiar alguna voz** · **Sin voz IA (usaré mi audio o ninguno)**.
      No generes nada sin su respuesta.
   4. **Cambiar alguna voz:** `npm run voces` lista las voces de su cuenta (nombre + voice ID), o acepta un voice ID
      que pegue. Pregunta qué personaje cambia y si es **solo para este video** (`npm run voz:ia -- <id> --secundario <voiceId>`;
      también `--principal`, `--narrador`, `--extra`) o **su nueva voz por defecto** (`npm run voces -- --usar <personaje> <voiceId>`).
      Si quiere oírla antes: `npm run voces -- --escuchar <personaje>` (el comando dice dónde quedó el mp3, en `out/voces/`).
   5. **Genera:** `npm run voz:ia -- <id>` (con las banderas de voz si eligió "solo para este video"), una vez por video.
      Crea `public/audio/<id>.mp3` y los subtítulos sincronizados con quién habla. Lo ya generado queda en caché:
      si luego cambia una línea, solo se paga esa.
   6. Si falla, explica el mensaje en simple. Si una voz **no está en su cuenta** (por ejemplo la voz por defecto, que
      es de otra cuenta), muéstrale sus voces con `npm run voces` para elegir otra. Si no hay créditos o la clave no
      tiene permisos, ofrece las opciones de "sin clave".
8. **Exporta el video:** `npm run render -- <id>` por cada video (2–5 min). Con voz sale `out/<id>.mp4` (video final).
   Sin voz sale `out/<id>-SIN-VOZ.mp4`: una vista previa **en silencio**; díselo con esas palabras, nunca la presentes
   como el video final. Si el render se detiene por "voz sin sincronizar", corre `npm run sincronizar -- <id>` y vuelve a exportar.
9. **Cierra** con una lista corta: fondo usado, voces (nombre por personaje, o "audio propio" / "sin voz"), duración de
   cada video y las rutas `out/<id>.mp4`, `out/<id>-guion-voz.txt`, `out/<id>-publicar.md`. Si quedó sin voz, recuerda
   en una línea dónde dejar el audio (`public/audio/<id>.mp3`) para terminarlo.

Si un tema necesita una escena que no existe, propón el tipo nuevo antes de crearlo (ver "Añadir un tipo de escena nuevo" en `CLAUDE.md`).

## Línea editorial (`/nuevo-video editorial`)

Vive en dos archivos: **`perfiles/linea-editorial.md`** (cómo se escribe: tono, público, quién habla, reglas y
estructura por plataforma, textos de publicación) y **`perfiles/canal.json`** (lo que se ve en el video: @usuario,
cómo se lee, lema, redes, cierre, estilo `agil`/`clase` por plataforma y fondos). El ejemplo está en `plantillas/ejemplo/`.

**Crear** (si es de ejemplo o no existe). Muestra primero, en 5–6 líneas, cómo es la línea de ejemplo y pregunta
en un solo mensaje:
1. Nombre del canal, **@usuario** y cómo se pronuncia.
2. **De qué trata** y **para quién** (público).
3. **Tono** (cercano, divertido, experto, inspirador…) y qué quiere **evitar**.
4. **Idioma y acento.**
5. Por plataforma: **objetivo**, **duración** y si comparten tema o van distintas. Sugerencia por defecto:
   TikTok ágil 40–60 s para comentarios; YouTube clase 60–90 s para búsquedas.
6. **Fondos:** **los 6 fondos que rotan** (por defecto) · **solo mis colores de marca** · **mezclar ambos**.
   Si elige marca o mezclar: su color principal y uno secundario (y, si quiere, el fondo oscuro y el claro).
7. Opcional: lema o nombre de la serie, **hashtag fijo**, frase de cierre, redes, qué dice la tarjeta final de YouTube.

Lo que no indique, propónlo tú tomando el ejemplo como base y díselo. Luego:
- Escribe `perfiles/linea-editorial.md` con la **misma estructura de secciones que el ejemplo** (incluida "Quién habla"
  con los nombres reales de sus personajes) y `plantilla: false` en el encabezado. Convierte la duración en palabras
  (~2.5 por segundo), escenas (una idea por escena, ~7–9 s cada una) y líneas.
- Escribe `perfiles/canal.json` con `"plantilla": false` (formato igual al ejemplo; `estilo`: `agil` o `clase`;
  `fondos.usar`: `rotar`, `marca` o `mezclar`; colores `#RRGGBB`; `idioma` tipo `es-PE`, `es-MX`, `es-ES`, `en-US`).
- Corre `npm run perfiles` y corrige hasta "✔ Perfiles válidos".
- Si cambió fondos o colores: `npm run ambientes` (tabla de contraste e imágenes en `out/ambientes/`). Mira las de
  marca: si algún texto no se lee, el script ya oscurece o aclara el color; si igual no convence, propón otro tono.
  Dile que puede verlas abriendo `out/ambientes.html`.
- Resume la línea editorial en 5–6 líneas y pide su visto bueno.

**Cambiar algo** (`/nuevo-video editorial más humor en TikTok`, "que YouTube dure 75 s", "cambia mi @", "usa mis colores"):
edita solo esa parte en el archivo que corresponda (guion → `.md`; lo visual y los fondos → `canal.json`), valida con
`npm run perfiles` y confirma el cambio en una línea. Aplica a los videos que se creen después; ofrece rehacer
alguno ya hecho si el cambio lo afecta (un @usuario o colores nuevos se aplican solos al volver a exportar).

Para volver al ejemplo: `npm run perfiles -- --restaurar canal` y `npm run perfiles -- --restaurar editorial` (confirma antes).

## Voces (`/nuevo-video voz`)

- `npm run voces -- --info` → voz de cada personaje, modo y créditos. Si dice `SIN_CLAVE`, explica cómo pegar la clave en `.env`.
- Cambiar la voz de un personaje: sigue la sección "Voces" del skill `personajes` (`npm run voces`, `--usar`, `--escuchar`).
- **Modo** (`config/voces.json`):
  - `lineas` (por defecto): una línea a la vez con `eleven_multilingual_v2`. Funciona en todos los planes.
  - `dialogo`: todas las voces en una sola actuación con `eleven_v3` (más natural, admite `tono`). Antes de cambiar,
    prueba si su plan lo permite: `npm run voces -- --probar` (~90 caracteres). Cambiar: `npm run voces -- --modo dialogo`.
    Si un día falla, `voz:ia` vuelve solo al modo por líneas y lo avisa.
