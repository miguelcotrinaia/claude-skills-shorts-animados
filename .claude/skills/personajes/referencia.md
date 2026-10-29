# Referencia · perfiles/personajes.json

Todos los colores van como `#RRGGBB`. Los fondos de los videos son oscuros: evita ropa o cuerpos casi negros
sin un color de detalle (`accent`) que resalte.

## Formato

```json
{
  "plantilla": false,
  "principal": {
    "nombre": "Ana",
    "rol": "Qué hace en los videos (presenta, explica, corrige…)",
    "personalidad": "Cómo es (se usa al escribir guiones)",
    "look": { ...ver "look de una persona"... },
    "lookAlterno": { "outfit": "hoodie", "top": "#5B6CFF" }
  },
  "secundario": {
    "nombre": "Bip",
    "tipo": "robot",
    "rol": "Qué papel cumple (pregunta, pone el humor, se equivoca…)",
    "personalidad": "Cómo es",
    "colores": { "cuerpo": "#7C8CF8", "luz": "#C8F25A", "base": "ruedas" },
    "look": { ...solo si tipo = "humano"... }
  },
  "extras": {
    "cliente": { ...look... },
    "jefa": { ...look... }
  },
  "miniBots": ["#8A93B8", "#A7B5A0", "#C9A0B8"]
}
```

- `lookAlterno` solo lleva lo que cambia respecto a `look` (se usa con `vestuario: "alterno"` en una escena).
- `extras`: el nombre de cada extra es una palabra en minúsculas sin tildes ni espacios (`cliente`, `profe`).
- `miniBots`: colores de las figuritas pequeñas en escenas de multitud con bots.

## Look de una persona (principal, extras o secundario humano)

| campo | obligatorio | opciones |
|---|---|---|
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
| `humano` | otra persona, como el principal | usa `look` (tabla de arriba) en lugar de `colores` |

Expresiones del secundario: neutral, feliz, sorprendido, enojado, pensando, cargando, error, triste, corazon
(si es humano, cargando → pensando, error → sorprendido, corazon → feliz).

## Comandos

- `npm run perfiles` → valida y muestra el resumen
- `npm run personajes` → hoja del elenco en `out/personajes.png`
- `npm run perfiles -- --restaurar personajes` → vuelve al ejemplo (Sofi, Chispa y extras)
