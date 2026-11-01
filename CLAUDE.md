# Estudio de shorts animados · v2 (diálogo)

Plantilla en Remotion (React → video) para shorts verticales de 1080×1920 con un elenco voxel configurable:
un **personaje principal**, un **personaje secundario** y personajes extra. Cada escena es un **diálogo**:
hablan la voz en off, el principal, el secundario y los extras, **cada uno con su propia voz** de ElevenLabs
(por defecto todos con la misma). La cámara sigue a quien habla, los gestos van sincronizados con la voz y el
fondo rota entre videos.

La persona que usa este proyecto puede no saber programar: habla en simple, sin jerga técnica, y haz tú los
comandos. Nunca le pidas que pegue claves en el chat.

## Dónde está cada cosa

```
perfiles/                 ← TODO lo que es de la persona (lo crean y editan los skills)
  personajes.json         ← elenco y VOZ de cada personaje: voz en off, principal, secundario, extras  (/personajes)
  canal.json              ← @usuario, lema, redes, cierre, estilo por plataforma y fondos  (/nuevo-video editorial)
  linea-editorial.md      ← tono, público, quién habla, estructura y duración por plataforma  (/nuevo-video editorial)
plantillas/ejemplo/       ← copia intacta del ejemplo (Sofi, Chispa, @tucanal) para restaurar
config/voces.json         ← modo de voz ("lineas" o "dialogo"), modelos y pausas. La clave va en .env (nunca en el repo ni en el chat)
config/rotacion.json      ← orden en que rotan los 6 fondos fijos en cada plataforma
src/
  videos/                 ← un archivo .ts por video + index.ts (registro; el orden define la rotación de fondos)
  perfiles.ts             ← lee perfiles/*.json (no tiene datos fijos)
  engine/
    types.ts              ← tipos: Escena, Linea (diálogo), Encuadre, Camara, VideoSpec
    timeline.ts           ← tiempos de escenas, líneas y palabras (con quién habla)
    encuadres.ts          ← dónde va cada personaje y el objeto; elige encuadres variados
    camara.ts             ← director de cámara (tomas por línea, transiciones según el estilo)
    ambientes.ts          ← los fondos (6 fijos + 2 con los colores de marca)
    perfil.ts             ← estilo por plataforma (agil / clase): ritmo, subtítulos, cámara, gestos
    context.ts            ← sincronía con la voz (línea actual, quién habla, cuándo aparece algo)
    Short.tsx             ← composición: mundo (con cámara) + capa fija (títulos, subtítulos, firma)
  scenes/                 ← tipos de escena (Scenes.tsx); elenco, gestos y zona del objeto (common.tsx)
  characters/             ← Human (principal y extras), Secundario (robot / foco / panda / humano), MiniBot, cast.ts
  props/  layers/  theme.ts
  Revision.tsx            ← hoja de revisión (una toma por línea, en una sola imagen)
public/audio/<id>.mp3     ← voz (IA o propia)       public/captions/<id>.json ← cada palabra con tiempos y quién la dice
scripts/                  ← estado, perfiles, voz IA, voces, sincronizar, revisar, ambientes, render, guion, subtítulos
.cache/voz/               ← voz ya generada (para no pagar dos veces lo mismo); se puede borrar
```

**Perfiles de ejemplo:** si un archivo de `perfiles/` tiene `"plantilla": true` (o `plantilla: true` en el
encabezado del .md), todavía es el ejemplo y no el de la persona. `npm run estado` lo dice.

## Preparar el estudio

Si la persona dice "prepara el estudio" (o es la primera vez): si no existe `node_modules` corre `npm install`,
luego `npm run estado`, y explica en simple qué falta (personajes, línea editorial, clave de ElevenLabs) y con qué
comando se hace cada cosa. "Abre el Studio" = `npm run dev` (Remotion Studio en el navegador).

## Crear un video

Usa `/nuevo-video <tiktok|youtube|ambos> <tema>` (ver `.claude/skills/nuevo-video/SKILL.md`).
Personajes y sus voces: `/personajes`. Línea editorial y fondos: `/nuevo-video editorial`. Voces y modo: `/nuevo-video voz`.
**Siempre termina exportando el MP4** con `npm run render -- <id>` y da la ruta `out/<id>.mp4`. Sin voz, el render
sale como `out/<id>-SIN-VOZ.mp4`: una vista previa **en silencio** con tiempos estimados (avísalo con esas palabras).

A mano (para quien programa):

1. Copia `src/videos/cielo-azul-tiktok.ts` o `cielo-azul-youtube.ts` → `src/videos/<tema>-<canal>.ts`; cambia `id`, `canal`, `ambiente`, `serie` y escenas.
2. Regístralo **al final** de `src/videos/index.ts`.
3. `npm run typecheck` y `npm run revisar -- <id>` → `out/revisar/<id>-hoja.png` (una toma por línea en una sola imagen).
4. Voz: `npm run voz:ia -- <id> --plan` (voces y caracteres, no gasta) → `npm run voz:ia -- <id>`.
   O voz propia: el diálogo en orden, con una pausa corta entre líneas → `public/audio/<id>.mp3` → `npm run sincronizar -- <id>`.
5. `npm run render -- <id>` → `out/<id>.mp4`.
6. `npm run guion -- <id>` → `out/<id>-guion-voz.txt` (con quién habla) y `out/<id>-guion-plano.txt`.

## El diálogo

Cada escena tiene `dialogo`: una lista de líneas `{ quien, texto, ... }` (normalmente 1–3 por escena).

| campo | uso |
|---|---|
| `quien` | `"narrador"` (voz en off) · `"principal"` · `"secundario"` · `"extra"` |
| `texto` | lo que dice (es también el subtítulo) |
| `extra` | si `quien: "extra"`: el nombre de un extra de `perfiles/personajes.json` (si no se pone, el primero) |
| `gesto` | opcional: `explicar`, `senalar`, `senalar-arriba`, `asentir`, `negar`, `encoger`, `pensar`, `celebrar`, `saltar`, `facepalm`, `saludo`, `quieto` (si no se pone, se elige según el texto) |
| `cara` | opcional: expresión mientras habla (ver "Poses") |
| `tono` | opcional, solo en modo de voz `dialogo` (eleven_v3), en inglés: `excited`, `laughs`, `sighs`, `whispers`… Úsalo poco |
| `ir` | opcional: quien habla camina hacia `"objeto"`, `"centro"`, `"izq"` o `"der"` |
| `resalta` | opcional: el objeto de la escena brilla y la cámara lo enfoca durante esta línea |

**Quién dice qué** lo define `perfiles/linea-editorial.md` (sección "Quién habla"). Regla general: cada línea la dice
quien mejor transmite la idea; no se fuerza a que hablen todos. El principal explica y cierra; el secundario pregunta
o pone el humor (no en todas las escenas); la voz en off solo datos, fechas o transiciones (máx. 1 línea por escena);
los extras solo cuando la idea necesita a esa persona (máx. 1–2 escenas).

Mientras alguien habla: mueve la boca, hace su gesto, tiene una luz de su color en el piso, y su cara y color
aparecen en el subtítulo. Quien escucha lo mira.

## Plataformas y estilos

Cada video lleva `canal: "tiktok" | "youtube"`. En `perfiles/canal.json` cada plataforma tiene un **estilo**:

| | `agil` (TikTok por defecto) | `clase` (YouTube por defecto) |
|---|---|---|
| Cámara | golpes de zoom, primer plano de quien habla, destello entre escenas | movimientos suaves, planos de dos (personaje + objeto) |
| Subtítulos | grandes, MAYÚSCULAS, 1–3 palabras, palabra activa en píldora del color de quien habla | medianos, hasta 6 palabras, palabra activa subrayada |
| Extras | saltito al empezar a hablar, sacudida en el contador, aviso "+ Sígueme" a mitad | quien escucha asiente, contador de escena "03/07" |
| Cierre `cta` | `pregunta` para comentarios | `curso`: tarjeta con `cierre.cursoPorDefecto` de `canal.json` |

Duración, palabras, escenas, líneas, gancho, estructura y series de cada plataforma están en
`perfiles/linea-editorial.md`: **léelo antes de escribir cualquier guion** y síguelo.
Si un tema va a las dos plataformas, son dos archivos (`<tema>-tiktok.ts` y `<tema>-youtube.ts`) con guiones propios.

## Fondos (ambientes)

`ambiente` del video: `grafito`, `noche`, `ciruela` (oscuros) · `arena`, `niebla`, `durazno` (claros) ·
`marca-oscuro`, `marca-claro` (se arman con los colores de `fondos.marca` de `perfiles/canal.json`).

`perfiles/canal.json` → `fondos.usar` decide cuáles rotan:
- `"rotar"` (por defecto): los 6 fijos, en el orden de `config/rotacion.json`.
- `"marca"`: solo los dos de marca.
- `"mezclar"`: los 6 fijos y los 2 de marca.

`npm run ambientes -- --siguiente <tiktok|youtube>` dice cuál toca (mira el último video registrado de esa plataforma).
`npm run ambientes` → tabla de contraste y `out/ambientes.html` con todos los fondos.
Los personajes no cambian: en fondos claros llevan contorno oscuro y en oscuros un borde de luz. Los colores de
cada voz en los subtítulos se ajustan al fondo para que se lean.

## Encuadres y cámara

`encuadre` (opcional; si no se pone, se elige solo según el tipo de escena y quién habla, sin repetir el anterior):

| encuadre | qué se ve |
|---|---|
| `duo` | principal a la izquierda, secundario a la derecha, objeto arriba al centro |
| `invertido` | secundario a la izquierda, principal a la derecha |
| `solo-principal` | principal grande a la izquierda, objeto grande a la derecha |
| `solo-secundario` | secundario grande a la derecha, objeto a la izquierda |
| `pequenos` | los dos pequeños en las esquinas, el objeto ocupa casi todo |
| `pantalla` | sin personajes, solo el objeto (diagramas grandes, multitud) |
| `trio` | principal, el extra al centro y secundario |

Entre escenas, los personajes caminan de su lugar anterior al nuevo.

`camara` (opcional, por escena): `auto` (por defecto), `general`, `hablante`, `objeto`, `paneo`, `empuje`.
En `auto`: la primera línea es plano general; si cambia quien habla, la cámara va a esa persona; la voz en off y
las líneas con `resalta` enfocan el objeto.

`tituloModo`: `grande` (por defecto), `etiqueta` (pequeño, da más espacio al objeto) u `oculto`.

## Tipos de escena (`tipo`)

Campos comunes: `titulo`, `dialogo`, `tituloModo?`, `encuadre?`, `camara?`, `extra?`, `principal?` / `secundario?`
(pose base o `false` para ocultar), `globo?` ({quien, texto}), `inicioMs?`.
`aparece`: palabra (o frase corta) del diálogo; el elemento sale justo cuando se dice. Si no se pone, se reparten en la escena.

| tipo | campos propios | uso |
|---|---|---|
| `duo` | `prop?` | conversación con un objeto: `recibo`, `chat` (un mensaje por línea), `laptop`, `monedas` ({simbolo?}), `documentos`, `icono` ({texto, sub?}), `objeto` (icono voxel grande) |
| `contador` | `etiqueta`, `hasta`, `desde?`, `prefijo?`, `sufijo?`, `color?`, `aparece?` | número que sube cuando se dice |
| `pila` | `items[]`, `etiqueta?` | lista o conversación que crece |
| `multitud` | `etiqueta`, `cantidad?` (≤15), `con?` ("bots" \| "personas"), `quienes?` (extras), `saludan?` | escala; con `quienes` (≤5) salen grandes en fila y el que habla mueve la boca |
| `pasos` | `pasos[]` (texto o {texto, aparece}) | lista numerada; el paso actual se resalta |
| `terminal` | `lineas[]`, `etiqueta?` | laptop que escribe; líneas con ">" en color de acento |
| `cita` | `fuente`, `texto`, `pie?` | cita textual de una fuente real (solo citas verificadas) |
| `comparar` | `items[]` {etiqueta, valor, nota?, color?, aparece?} | barras de bloques (A vs B) |
| `diagrama` | `nodos[]` {id, texto, icono?, aparece?}, `flechas?` [{de, a, texto?, aparece?}], `direccion?`, `flujo?` | proceso: los nodos aparecen al nombrarse, las flechas se dibujan y con `flujo: true` un punto recorre el camino |
| `pizarra` | `encabezado?`, `lineas[]` (texto o {texto, aparece}) | el principal explica y la pizarra se escribe sola |
| `linea` | `eventos[]` {fecha, texto, aparece?} | línea de tiempo (historia, casos, versiones) |
| `pregunta` | `pregunta`, `de?` ("secundario" \| "extra" \| "publico") | la duda del público en grande |
| `tabla` | `columnas[]`, `filas[]` {celdas[], aparece?}, `previas?`, `encabezado?` | comparación que se llena fila a fila |
| `resumen` | `puntos[]` (texto o {texto, aparece}), `encabezado?` | lista que se marca a medida que se dice |
| `cta` | `pregunta?` (agil), `curso?` (clase), `llamada?` | cierre con @usuario y redes del canal |

`color` = `"acento"` | `"acento2"` | `"alerta"` (alerta = costos, errores, peligro).
Iconos voxel (`icono`): doc, db, nube, chip, usuario, servidor, robot, app, candado, lupa, alerta, check.

## Reglas de formato (valen para cualquier canal)

- `serie` = `"<TEMA> · <LEMA>"` (lema de `perfiles/canal.json`), en mayúsculas.
- `titulo`: máx. ~5 palabras; la parte importante entre `*asteriscos*`.
- Una idea por escena. Gancho en la primera línea.
- El @usuario se escribe tal cual en `texto` (ej. `@tucanal`); la voz lo lee como `handleHablado` de `canal.json`.
- Cerrar con escena `cta`. La última línea es la firma definida en la línea editorial, dicha por el principal.
- Textos de `icono`, `etiqueta` y nodos: cortos (1–2 palabras o ~10 caracteres) para que no tapen a los personajes.
- Variedad: no más de 2 escenas `duo` seguidas; al menos una escena dinámica (`diagrama`, `pizarra`, `linea`, `pasos`, `comparar`).
- Datos y cifras: solo si son correctos.

## Poses

- Principal `cara`/`expresion`: neutral, feliz, sorprendido, enojado, pensando, triste, guino, confiado
- Principal `brazos` (pose base): abajo, saludo, senalar, celebrar, sostener, pensar, explicar · `vestuario`: principal, alterno
- Secundario `cara`/`expresion`: neutral, feliz, sorprendido, enojado, pensando, cargando, error, triste, corazon
- Secundario `brazos`: abajo, saludo, senalar, celebrar, sostener, escribir, explicar
- Extras: las mismas caras del principal. Sus nombres están en `extras` de `perfiles/personajes.json`.
- Una persona puede tener `especie: "perro"` (cabeza de perro): usa las mismas caras, gestos y ropa.

Los nombres reales de los personajes (para guiones y títulos) están en `perfiles/personajes.json`.

## Voces (ElevenLabs)

Cada personaje tiene su voz en `perfiles/personajes.json`: `narrador.voz`, `principal.voz`, `secundario.voz`,
`vozExtras` (para todos los extras) y, si se quiere, `voz` dentro de un extra concreto. Por defecto todas son
`l1zE9xgNpUTaQCZzpNJa`. El modo está en `config/voces.json`:
- `lineas` (por defecto): una llamada por línea con `eleven_multilingual_v2` y pausas entre líneas. Funciona en todos los planes.
- `dialogo`: Text to Dialogue con `eleven_v3`, todas las voces en una sola actuación (admite `tono`). Si la cuenta no lo
  permite, `voz:ia` pasa solo al modo por líneas.

Comandos: `npm run voces -- --info` (voz de cada personaje y créditos) · `npm run voces` (además lista las voces de su
cuenta) · `npm run voces -- --usar <personaje> <voiceId>` (cambia la voz por defecto; `<personaje>` = su nombre,
`principal`, `secundario`, `narrador`, `extra` o el nombre de un extra; funciona sin clave) ·
`npm run voces -- --escuchar <personaje>` (frase corta en `out/voces/`) · `npm run voces -- --modo lineas|dialogo` ·
`npm run voz:ia -- <id> --secundario <voiceId>` (solo para ese video; también `--principal`, `--narrador`, `--extra`).
Acento o parecido: `npm run voces -- --comparar <personaje>` (6 variantes en `out/comparar/`, ~700 caracteres) →
`npm run voces -- --elegir <personaje> <1-6>`.
**Antes de generar, confirma con la persona las voces y los caracteres** (`npm run voz:ia -- <id> --plan`, no gasta).
Sin clave, los scripts dicen `SIN_CLAVE` y explican qué hacer.

## Cómo funciona la sincronía

`public/captions/<id>.json`: cada palabra con sus tiempos, `quien` y `linea`. Si existe, cada escena empieza con su
primera palabra y cada gesto, toma de cámara y aparición sigue a la voz. Si no existe, se estiman tiempos desde el guion
(vista previa con el aviso "PREVIEW").
**Regla:** si existe `public/audio/<id>.mp3`, antes de exportar corre `npm run sincronizar -- <id>` o `voz:ia`
(el render se detiene si la voz no está sincronizada o si el audio cambió después).
`voz:ia` ya deja la voz sincronizada. `sincronizar` usa las pausas del audio (rápido, sin internet); con `--whisper`
transcribe palabra por palabra.

## Cambiar textos de los subtítulos

- **Sin voz todavía:** basta con editar `texto` en el diálogo.
- **Con voz:** edita `texto` y corre `npm run subtitulos -- <id>` (conserva los tiempos; guarda un `.backup.json`).
  Para corregir palabras, tildes o puntuación. Si cambia lo que se dice, rehaz la voz (`voz:ia` solo paga lo que cambió).
- Palabras en color: lista `resaltar` del video.

## Añadir un tipo de escena nuevo

1. Agrega el tipo a la unión `Escena` en `engine/types.ts`.
2. Implementa el componente en `scenes/Scenes.tsx`: contenido dentro de `<Zona ancho={...}>` y `<Cast>` para el elenco.
   Para sincronizar con la voz usa `momentoDe(ctx, aparece, fracción)` de `engine/context.ts`.
3. Agrégalo a `SceneRenderer` y a `OPCIONES` en `engine/encuadres.ts` (encuadres que le quedan bien).
4. Documenta la fila en la tabla de arriba.
