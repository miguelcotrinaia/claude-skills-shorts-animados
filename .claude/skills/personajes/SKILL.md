---
name: personajes
description: Crea o edita el elenco de los videos animados — personaje principal (desde una foto o una descripción), personaje secundario y extras — y lo guarda en perfiles/personajes.json para que /nuevo-video lo use. Úsalo con /personajes, /personajes editar <cambio>, /personajes agregar <extra>, /personajes quitar <extra>, /personajes reiniciar, o cuando la persona pida crear, cambiar o ver cómo se ven sus personajes.
argument-hint: "[editar|agregar|quitar|reiniciar] [detalle]"
---

# Personajes

Crea y mantiene el elenco de los videos. El resultado es **`perfiles/personajes.json`**, que el video lee
directamente (nada del elenco está escrito en el código). La persona puede no saber programar: habla simple,
corre tú los comandos y muéstrale resultados, no JSON.

Antes de empezar, lee `referencia.md` (en esta misma carpeta): opciones disponibles y formato del archivo.

## Modos

| Lo que escribe | Qué haces |
|---|---|
| `/personajes` | Si el elenco es de ejemplo o no existe → **Crear**. Si ya es propio → muestra el resumen y pregunta qué quiere cambiar. |
| `/personajes editar <cambio>` | **Editar** solo lo que pide ("ponle lentes", "el robot en verde", "otro nombre"). |
| `/personajes agregar <descripción>` | Agrega un extra (máx. ~6 para que se vean todos en la hoja). |
| `/personajes quitar <nombre>` | Quita un extra. |
| `/personajes reiniciar` | Vuelve al elenco de ejemplo. **Confirma antes**: borra el elenco actual. `npm run perfiles -- --restaurar personajes` |

## 0. Preparación (solo si hace falta)

- Si no existe la carpeta `node_modules`: corre `npm install` (avisa que la primera vez tarda 1–2 minutos).
- Corre `npm run estado` y fíjate en `personajes=` de la última línea: `ejemplo`, `propio` o `falta`.

## 1. Crear el elenco

Pide los datos **en un solo mensaje**, con ejemplos para que sea fácil responder
(usa la herramienta de preguntas para las opciones cerradas si está disponible):

1. **Personaje principal** (quien presenta): una **foto** adjunta o una descripción
   (piel, pelo, peinado, barba, lentes, ropa y colores). Nombre, qué hace en los videos y cómo es su personalidad.
2. **Personaje secundario** (el compañero): nombre; qué es — **robot**, **foco** o **otra persona**; colores;
   qué papel cumple (por ejemplo: hace las preguntas del público, pone el humor, se equivoca).
3. **Extras** (opcional): personas que aparecen en escenas de grupo. Si no dice nada, se quedan los de ejemplo.
4. **Vestuario alterno** del principal (opcional): otra prenda o color para variar.

Reglas:
- **Foto:** úsala solo si es de la propia persona o de alguien que dio permiso; si no queda claro, pregúntalo en una línea.
  Mira la foto y tradúcela a las opciones de `referencia.md` (tono de piel y pelo en #RRGGBB, el peinado más
  parecido, barba, lentes, prenda y colores). El resultado es un muñeco voxel estilizado, nunca un retrato.
  No copies la foto dentro del proyecto.
- Si describe un secundario que no existe (un gato, un dragón…), explica que hoy puede ser robot, foco o persona y
  propone el más cercano con sus colores. Si quiere una forma nueva, dile que se puede dibujar como un tipo nuevo
  en `src/characters/Secundario.tsx` (toma más trabajo) y hazlo solo si lo confirma.
- Lo que no indique, complétalo tú con algo coherente y dile qué elegiste.

## 2. Guardar y validar

1. Escribe `perfiles/personajes.json` con el formato de `referencia.md` y **`"plantilla": false`**.
2. Corre `npm run perfiles`. Si marca problemas, corrígelos tú y vuelve a correrlo hasta ver "✔ Perfiles válidos".

## 3. Mostrar y aprobar

1. Corre `npm run personajes` → genera `out/personajes.png` (hoja con el elenco, expresiones y extras).
2. Mira la imagen tú mismo: que se parezca a lo pedido, colores con buen contraste sobre fondo oscuro, nada cortado.
   Ajusta si algo no cuadra y vuelve a generarla.
3. Dile a la persona que abra `out/personajes.png` y pregunta: **Aprobar** · **Ajustar** (qué cambiar).
   Repite 2–3 hasta que apruebe.

## 4. Cierre

Resume en 3–4 líneas: nombres, cómo es cada uno y su papel. Recuerda que los cambios ya se ven en todos los
videos (también en los que ya existían, la próxima vez que se exporten) y que puede crear un video con
`/nuevo-video <tiktok|youtube|ambos> <tema>`.

## Editar, agregar o quitar

Lee `perfiles/personajes.json`, cambia **solo** lo pedido (si estaba en `"plantilla": true`, pásalo a `false`),
corre `npm run perfiles` y `npm run personajes`, revisa la imagen y pide su visto bueno.
Si cambia un nombre, los videos ya hechos que lo mencionan en `dice` o `titulo` siguen diciendo el nombre antiguo:
avísale y ofrece actualizarlos.
