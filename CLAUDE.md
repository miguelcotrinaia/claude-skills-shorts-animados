# Estudio de shorts animados

Plantilla en Remotion (React → video) para shorts verticales de 1080×1920 con un elenco voxel configurable:
un **personaje principal**, un **personaje secundario** y personajes extra. Una sola **voz en off** narra cada video.

La persona que usa este proyecto puede no saber programar: habla en simple, sin jerga técnica, y haz tú los
comandos. Nunca le pidas que pegue claves en el chat.

## Dónde está cada cosa

```
perfiles/                 ← TODO lo que es de la persona (lo crean y editan los skills)
  personajes.json         ← elenco: principal, secundario, extras  (/personajes)
  canal.json              ← @usuario, lema, redes, colores y estilo por plataforma  (/nuevo-video editorial)
  linea-editorial.md      ← tono, público, reglas y estructura de guion por plataforma  (/nuevo-video editorial)
plantillas/ejemplo/       ← copia intacta del ejemplo (Sofi, Chispa, @tucanal) para restaurar
config/voz.json           ← voz en off por defecto de ElevenLabs. La clave va en .env (nunca en el repo ni en el chat)
src/
  videos/                 ← un archivo .ts por video + index.ts (registro)
  perfiles.ts             ← lee perfiles/*.json (no tiene datos fijos)
  engine/                 ← tipos (types.ts), sincronía voz↔escenas (timeline.ts), composición (Short.tsx), estilos (perfil.ts)
  scenes/                 ← tipos de escena (Scenes.tsx) y elenco en escena (common.tsx)
  characters/             ← Human (principal y extras), Secundario (robot / foco / humano), MiniBot, cast.ts
  props/  layers/  theme.ts
public/audio/<id>.mp3     ← voz (IA o propia)       public/captions/<id>.json ← subtítulos palabra por palabra
scripts/                  ← estado, perfiles, voz IA, voces, sincronizar, render, guion, subtítulos
```

**Perfiles de ejemplo:** si un archivo de `perfiles/` tiene `"plantilla": true` (o `plantilla: true` en el
encabezado del .md), todavía es el ejemplo y no el de la persona. `npm run estado` lo dice.

## Preparar el estudio

Si la persona dice "prepara el estudio" (o es la primera vez): si no existe `node_modules` corre `npm install`,
luego `npm run estado`, y explica en simple qué falta (personajes, línea editorial, clave de ElevenLabs) y con qué
comando se hace cada cosa. "Abre el Studio" = `npm run dev` (Remotion Studio en el navegador).

## Crear un video

Usa `/nuevo-video <tiktok|youtube|ambos> <tema>` (ver `.claude/skills/nuevo-video/SKILL.md`).
Personajes: `/personajes`. Línea editorial: `/nuevo-video editorial`. Voz: `/nuevo-video voz`.
**Siempre termina exportando el MP4** con `npm run render -- <id>` y da la ruta `out/<id>.mp4`.

Verifica siempre con `npm run typecheck` y stills: `npx remotion still <id> out/check-<n>.png --frame=<f>`.

## Plataformas y estilos

Cada video lleva `canal: "tiktok" | "youtube"`. En `perfiles/canal.json` cada plataforma tiene un **estilo**:

| | `agil` | `clase` |
|---|---|---|
| Subtítulos | grandes, MAYÚSCULAS, 1–3 palabras, palabra activa en píldora | medianos, 4–6 palabras, palabra activa subrayada |
| Movimiento | golpe de zoom y destello entre escenas, sacudida en el contador | transiciones suaves, contador de escena "03/07" |
| Extras | aviso "+ Sígueme @usuario" a mitad | — |
| Cierre `cta` | `pregunta` para comentarios | `curso` (enlace al video relacionado) |

Duración, palabras, número de escenas, gancho, estructura y series de cada plataforma están en
`perfiles/linea-editorial.md`: **léelo antes de escribir cualquier guion** y síguelo.
Si un tema va a las dos plataformas, son dos archivos (`<tema>-tiktok.ts` y `<tema>-youtube.ts`) con guiones propios.

## Reglas de formato (valen para cualquier canal)

- `serie` = `"<TEMA> · <LEMA>"` (lema de `perfiles/canal.json`), en mayúsculas.
- `titulo`: máx. ~5 palabras; la parte importante entre `*asteriscos*`.
- `dice`: lo que dice la voz en off en esa escena. Una idea por escena.
- El @usuario se escribe tal cual en `dice` (ej. `@tucanal`); la voz lo lee como `handleHablado` de `canal.json`.
- Cerrar con escena `cta`. La última frase de voz es la firma definida en la línea editorial.
- Textos de `icono` y `etiqueta`: cortos (1 palabra o ~10 caracteres) para que no tapen a los personajes.
- Datos y cifras: solo si son correctos.

## Tipos de escena (`tipo`)

Campos comunes: `titulo`, `dice`, `habla` ("principal" | "secundario"), `principal` / `secundario` (pose o `false`
para ocultar), `globo` ({quien, texto}), `inicioMs` (forzar inicio).

| tipo | campos propios | uso |
|---|---|---|
| `duo` | `prop?` | principal + secundario conversando; prop al centro: `recibo`, `chat`, `laptop`, `monedas` ({simbolo?}), `documentos`, `icono` |
| `contador` | `etiqueta`, `hasta`, `desde?`, `prefijo?`, `sufijo?`, `color?` | número grande que sube |
| `pila` | `items[]`, `etiqueta?` | conversación o lista que crece |
| `multitud` | `etiqueta`, `cantidad?` (≤15), `con?` ("bots" \| "personas") | escala: usuarios, personas, agentes |
| `pasos` | `pasos[]` (2–5) | lista numerada; el principal señala |
| `terminal` | `lineas[]`, `etiqueta?` | laptop que escribe; líneas con ">" van en color de acento |
| `cita` | `fuente`, `texto`, `pie?` | cita textual de una fuente real (solo citas verificadas) |
| `comparar` | `items[]` {etiqueta, valor, nota?, color?} | barras de bloques (A vs B) |
| `cta` | `pregunta?` (ágil), `curso?` (clase), `llamada?` | cierre con @usuario y redes del canal |

`color` = `"acento"` | `"acento2"` | `"alerta"` (alerta = costos, errores, peligro).
Por defecto: `pila` oculta al principal; `pasos` oculta al secundario; `multitud` oculta a ambos.

## Poses

- Principal `expresion`: neutral, feliz, sorprendido, enojado, pensando, triste, guino, confiado
- Principal `brazos`: abajo, saludo, senalar, celebrar, sostener, pensar, explicar
- Principal `vestuario`: principal (por defecto), alterno
- Secundario `expresion`: neutral, feliz, sorprendido, enojado, pensando, cargando, error, triste, corazon
- Secundario `brazos`: abajo, saludo, senalar, celebrar, sostener, escribir, explicar
- Extras: los nombres de `extras` en `perfiles/personajes.json` (aparecen en escenas `multitud` con `con: "personas"`)

Los nombres reales de los personajes (para guiones y títulos) están en `perfiles/personajes.json`.

## Cómo funciona la sincronía

**Regla:** si existe `public/audio/<id>.mp3`, antes de exportar SIEMPRE corre `npm run sincronizar -- <id>`
(el render se detiene si la voz no está sincronizada o si el audio cambió después de sincronizar).
`npm run voz:ia` ya deja la voz sincronizada (tiempos exactos de ElevenLabs).
`sincronizar` usa las pausas del audio (rápido, sin internet); con `--whisper` transcribe palabra por palabra.

`engine/timeline.ts`: si existe `public/captions/<id>.json`, cada escena empieza cuando se dice su primera palabra.
Si no existe, se estiman tiempos desde el guion (vista previa sin voz).

## Cambiar textos de los subtítulos

- **Video sin voz:** basta con editar `dice`.
- **Video con voz:** edita `dice` y corre `npm run subtitulos -- <id>` (conserva los tiempos; guarda `.backup.json`).
- **Si cambia lo que se dice** (frases nuevas): rehacer la voz (`npm run voz:ia -- <id>` o regrabar + `npm run sincronizar -- <id>`).

## Añadir un tipo de escena nuevo

1. Agrega el tipo a la unión `Escena` en `engine/types.ts`.
2. Implementa el componente en `scenes/Scenes.tsx` (usa `<Cast>` para mantener a los personajes en posiciones estándar).
3. Agrégalo a `SceneRenderer` y a `DEFAULT_SHOW` en `scenes/common.tsx`.
4. Documenta la fila en la tabla de arriba.
