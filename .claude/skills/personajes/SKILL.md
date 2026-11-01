---
name: personajes
description: Crea o edita el elenco de los videos animados — personaje principal (desde una foto o una descripción), personaje secundario, extras y la voz de ElevenLabs de cada uno — y lo guarda en perfiles/personajes.json para que /nuevo-video lo use. Úsalo con /personajes, /personajes editar <cambio>, /personajes voz <personaje> <voiceId>, /personajes agregar <extra>, /personajes quitar <extra>, /personajes reiniciar, o cuando la persona pida crear, cambiar, ver o escuchar a sus personajes.
argument-hint: "[editar|voz|agregar|quitar|reiniciar] [detalle]"
---

# Personajes

Crea y mantiene el elenco de los videos y la **voz de cada personaje**. El resultado es **`perfiles/personajes.json`**,
que el video lee directamente (nada del elenco está escrito en el código). La persona puede no saber programar:
habla simple, corre tú los comandos y muéstrale resultados, no JSON. Nunca le pidas que pegue claves en el chat.

Antes de empezar, lee `referencia.md` (en esta misma carpeta): opciones disponibles y formato del archivo.

## Modos

| Lo que escribe | Qué haces |
|---|---|
| `/personajes` | Si el elenco es de ejemplo o no existe → **Crear**. Si ya es propio → muestra el resumen (con la voz de cada uno) y pregunta qué quiere cambiar. |
| `/personajes editar <cambio>` | **Editar** solo lo que pide ("ponle lentes", "el robot en verde", "otro nombre"). |
| `/personajes voz [personaje] [voiceId]` | **Voces**: ver, escuchar o cambiar la voz de un personaje (sección "Voces" de abajo). |
| `/personajes agregar <descripción>` | Agrega un extra (máx. ~6 para que se vean todos en la hoja). Puede tener su propia voz. |
| `/personajes quitar <nombre>` | Quita un extra. |
| `/personajes reiniciar` | Vuelve al elenco de ejemplo. **Confirma antes**: borra el elenco actual. `npm run perfiles -- --restaurar personajes` |

## 0. Preparación (solo si hace falta)

- Corre `npm run estado` y fíjate en la última línea: `personajes=` (`ejemplo`, `propio` o `falta`) y `clave=` (`si` / `no`).
- Si `npm` o `node` no se reconocen, o dice `node=viejo` o `paquetes=faltan`: haz "Preparar el estudio" de `CLAUDE.md`
  (instala lo que falte) y vuelve aquí.

## 1. Crear el elenco

Pide los datos **en un solo mensaje**, con ejemplos para que sea fácil responder
(usa la herramienta de preguntas para las opciones cerradas si está disponible):

1. **Personaje principal** (quien presenta): una **foto** adjunta o una descripción
   (piel, pelo, peinado, barba, lentes, ropa y colores). Nombre, qué hace en los videos y cómo es su personalidad.
   También puede ser un perro con ropa (`especie: "perro"`).
2. **Personaje secundario** (el compañero): nombre; qué es — **robot**, **foco**, **panda** o **otra persona**; colores;
   qué papel cumple (por ejemplo: hace las preguntas del público, pone el humor, se equivoca).
3. **Extras** (opcional): personas que aparecen en algunas escenas (un estudiante, una clienta…). Si no dice nada,
   se quedan los de ejemplo.
4. **Vestuario alterno** del principal (opcional): otra prenda o color para variar.
5. **Voces** (opcional): "Por defecto todos hablan con la misma voz. ¿Quieres darle una voz distinta a alguno?"
   Opciones: **Todos con la voz por defecto** · **Elegir voces ahora** · **Más adelante**.

Reglas:
- **Foto:** úsala solo si es de la propia persona o de alguien que dio permiso; si no queda claro, pregúntalo en una línea.
  Mira la foto y tradúcela a las opciones de `referencia.md` (tono de piel y pelo en #RRGGBB, el peinado más
  parecido, barba, lentes, prenda y colores). El resultado es un muñeco voxel estilizado, nunca un retrato.
  No copies la foto dentro del proyecto.
- Si describe un secundario que no existe (un gato, un dragón…), explica que hoy puede ser robot, foco, panda o persona y
  propone el más cercano con sus colores. Si quiere una forma nueva, dile que se puede dibujar como un tipo nuevo
  en `src/characters/Secundario.tsx` (toma más trabajo) y hazlo solo si lo confirma.
- Lo que no indique, complétalo tú con algo coherente y dile qué elegiste.
- Cada personaje lleva `"voz": { "voiceId": "..." }`. Si no eligió voces, usa `l1zE9xgNpUTaQCZzpNJa` en todos
  (voz en off, principal, secundario y `vozExtras`). Si el archivo ya tenía voces elegidas, consérvalas.

## 2. Guardar y validar

1. Escribe `perfiles/personajes.json` con el formato de `referencia.md` y **`"plantilla": false`**.
2. Corre `npm run perfiles`. Si marca problemas, corrígelos tú y vuelve a correrlo hasta ver "✔ Perfiles válidos".

## 3. Mostrar y aprobar

1. Corre `npm run personajes` → genera `out/personajes.png` (hoja con el elenco, expresiones y extras).
2. Mira la imagen tú mismo: que se parezca a lo pedido, colores que se distingan, nada cortado.
   Ajusta si algo no cuadra y vuelve a generarla.
3. Dile a la persona que abra `out/personajes.png` y pregunta: **Aprobar** · **Ajustar** (qué cambiar).
   Repite 2–3 hasta que apruebe.
4. Si eligió **Elegir voces ahora**, sigue con "Voces" antes de cerrar.

## 4. Cierre

Resume en 3–4 líneas: nombres, cómo es cada uno, su papel y su voz (o "voz por defecto"). Recuerda que los cambios
ya se ven en todos los videos (también en los que ya existían, la próxima vez que se exporten) y que puede crear
un video con `/nuevo-video <tiktok|youtube|ambos> <tema>`.

## Voces

Cada personaje habla con su voz de ElevenLabs: voz en off, principal, secundario, una voz para todos los extras
(`vozExtras`) y, si quiere, una voz propia para un extra concreto. Se cambia cuando quiera; vale para los videos
que se generen después.

- **Ver:** `npm run voces -- --info` → voz de cada personaje (con nombre si hay clave) y créditos.
- **Elegir de su cuenta:** `npm run voces` → lista las voces de su cuenta de ElevenLabs (nombre + voice ID).
  Muéstrale la lista en simple y pregunta qué voz para qué personaje. También puede pegar un voice ID que copió
  de elevenlabs.io (Voices → la voz → "Copy voice ID").
- **Cambiar:** `npm run voces -- --usar <personaje> <voiceId>`. `<personaje>` = su nombre (ej. `Chispa`),
  `principal`, `secundario`, `narrador`, `extra` (todos los extras) o el nombre de un extra (ej. `abuelo`).
  Funciona sin clave (queda guardado sin verificar).
- **Escuchar:** `npm run voces -- --escuchar <personaje>` → genera una frase corta con su voz en `out/voces/` (el comando muestra el archivo)
  (~80 caracteres de su plan). Dile que lo abra y pregunta si le gusta.
- **Acento o parecido** (la voz suena con otro acento): `npm run voces -- --comparar <personaje>` genera la misma frase
  con 6 variantes en `out/comparar/` (~700 caracteres) → que escuche → `npm run voces -- --elegir <personaje> <1-6>`.
- **Sin clave** (`SIN_CLAVE`): puede guardar IDs igual con `--usar`; para escuchar o listar necesita la clave. Explícale:
  elevenlabs.io → Developers → API Keys → crear una con permiso Text to Speech (y Voices: Read para ver nombres)
  → abrir el archivo `.env` de esta carpeta → pegarla después de `ELEVENLABS_API_KEY=` → guardar → avisarte.
- Si todos tienen la misma voz, igual se distingue quién habla: el subtítulo lleva su cara y su color.

## Editar, agregar o quitar

Lee `perfiles/personajes.json`, cambia **solo** lo pedido (si estaba en `"plantilla": true`, pásalo a `false`),
corre `npm run perfiles` y `npm run personajes`, revisa la imagen y pide su visto bueno.
Si cambia un nombre, los videos ya hechos que lo mencionan en `texto` o `titulo` siguen diciendo el nombre antiguo:
avísale y ofrece actualizarlos. Si quita un extra que usa algún video (`extra: "<nombre>"`), avísale y ofrece cambiarlo.
