# Referencia · perfiles/personajes.json

Todos los colores van como `#RRGGBB`. Los videos usan fondos claros y oscuros (rotan): en los claros los personajes
llevan un contorno oscuro y en los oscuros un borde de luz. Evita ropa o cuerpos casi negros sin un color de detalle
(`accent`) que resalte.

## Formato

```json
{
  "plantilla": false,
  "narrador": {
    "nombre": "Voz en off",
    "voz": { "voiceId": "l1zE9xgNpUTaQCZzpNJa" }
  },
  "principal": {
    "nombre": "Ana",
    "rol": "Qué hace en los videos (presenta, explica, corrige…)",
    "personalidad": "Cómo es (se usa al escribir guiones)",
    "look": { ...ver "look de una persona"... },
    "lookAlterno": { "outfit": "hoodie", "top": "#5B6CFF" },
    "voz": { "voiceId": "l1zE9xgNpUTaQCZzpNJa" }
  },
  "secundario": {
    "nombre": "Bip",
    "tipo": "robot",
    "rol": "Qué papel cumple (pregunta, pone el humor, se equivoca…)",
    "personalidad": "Cómo es",
    "colores": { "cuerpo": "#7C8CF8", "luz": "#C8F25A", "base": "ruedas" },
    "look": { ...solo si tipo = "humano"... },
    "voz": { "voiceId": "l1zE9xgNpUTaQCZzpNJa" }
  },
  "extras": {
    "cliente": { ...look... },
    "jefa": { ...look..., "voz": { "voiceId": "..." } }
  },
  "vozExtras": { "voiceId": "l1zE9xgNpUTaQCZzpNJa" },
  "miniBots": ["#8A93B8", "#A7B5A0", "#C9A0B8"]
}
```

- `narrador`: la voz en off (no se ve en pantalla). `nombre` es como aparece en el guion por voces.
- `lookAlterno` solo lleva lo que cambia respecto a `look` (se usa con `vestuario: "alterno"` en una escena).
- `extras`: el nombre de cada extra es una palabra en minúsculas sin tildes ni espacios (`cliente`, `profe`).
- `vozExtras`: la voz de todos los extras. Un extra con su propio `voz` usa esa en lugar de `vozExtras`.
- `miniBots`: colores de las figuritas pequeñas en escenas de multitud con bots.

## Voz de un personaje (`voz`)

| campo | obligatorio | qué es |
|---|---|---|
| `voiceId` | sí | ID de la voz en ElevenLabs: 20 letras y números (en elevenlabs.io → Voices → la voz → "Copy voice ID") |
| `nombre` | no | nombre de la voz, solo como recordatorio |
| `modelo` | no | lo guarda `npm run voces -- --elegir` (ej. `eleven_multilingual_v2`); si no está, usa el de `config/voces.json` |
| `ajustes` | no | lo guarda `--elegir` (estabilidad, parecido, estilo) o `"voz"` para usar los ajustes guardados en ElevenLabs |

La voz por defecto de todos es `l1zE9xgNpUTaQCZzpNJa`. Se cambia sin editar el archivo:
`npm run voces -- --usar <personaje> <voiceId>`.

## Look de una persona (principal, extras o secundario humano)

| campo | obligatorio | opciones |
|---|---|---|
| `especie` | no | `persona` (por defecto) o `perro` (cabeza de perro con hocico y orejas caídas: `skin` = pelaje, `hair` = orejas y mechón; ignora `hairStyle` y `beard`) |
| `skin` | sí | color de piel |
| `hair` | sí | color de pelo |
| `hairStyle` | sí | `peinado` (volumen con raya al costado), `corto`, `rulos`, `cresta`, `largo` (melena a los lados), `calvo`, `mono` (moño arriba), `cola` (cola de caballo) |
| `beard` | no | `ninguna`, `candado`, `barba`, `bigote`, `sombra` (barba de pocos días) |
| `beardColor` | no | color de la barba (si no, usa el del pelo) |
| `glasses` | no | `ninguno`, `rectangulares`, `redondos` |
| `glassesColor` | no | color del marco |
| `outfit` | sí | `blazer` (saco con camisa interior), `polo`, `hoodie` (polerón con capucha), `camisa` |
| `top` | sí | color de la prenda principal |
| `inner` | no | color de la camisa interior (solo `blazer`) |
| `pants` | sí | color del pantalón |
| `shoes` | no | color de los zapatos |
| `accent` | no | color de detalle: pin del blazer, logo del polo, cordones del hoodie, liga de la cola, audífonos, corbata |
| `accessory` | no | `ninguno`, `corbata`, `audifonos` |

### De una foto a parámetros

- **Piel:** toma el tono medio de la mejilla, sin brillo ni sombra. Rangos útiles: clara `#F0C7A4`, media clara `#E0B48C`,
  media `#C68A64`, morena `#B57A55`, oscura `#8A5A3C`.
- **Pelo:** el color base (no los reflejos). Canas: `#9A9A96` o `#D8D8D2`.
- **Peinado:** el más parecido de la lista. Pelo largo suelto → `largo`; recogido atrás → `cola`; recogido arriba → `mono`.
- **Ropa:** la prenda que más lleva en sus videos o en la foto; si lleva saco → `blazer` con `inner` del color de la camisa.
- **Detalle (`accent`):** un color de su marca o uno que contraste con la prenda.

## Personaje secundario

| `tipo` | cómo se ve | `colores` |
|---|---|---|
| `robot` | robot con pantalla-cara, ojos LED, antena y pinzas | `cuerpo`, `luz` (ojos, antena, botones), `base`: `orugas`, `ruedas` o `flotante` |
| `foco` | foco de luz con cara, brazos, piernas y destellos | `cuerpo` (vidrio), `luz` (halo y destellos) |
| `panda` | panda que va saltando, con bufanda | `cuerpo` (pelaje blanco), `manchas` (negro), `luz` (bufanda) |
| `humano` | otra persona, como el principal | usa `look` (tabla de arriba) en lugar de `colores` |

Expresiones del secundario: neutral, feliz, sorprendido, enojado, pensando, cargando, error, triste, corazon
(si es humano, cargando → pensando, error → sorprendido, corazon → feliz).
Todos los personajes hacen los gestos del diálogo (explicar, señalar, asentir, negar, encoger, pensar, celebrar,
saltar, facepalm, saludo).

## Comandos

- `npm run perfiles` → valida y muestra el resumen (con la voz de cada personaje)
- `npm run personajes` → hoja del elenco en `out/personajes.png`
- `npm run voces -- --info` · `npm run voces` · `npm run voces -- --usar <personaje> <voiceId>` · `npm run voces -- --escuchar <personaje>`
- `npm run perfiles -- --restaurar personajes` → vuelve al ejemplo (Sofi, Chispa y extras)
