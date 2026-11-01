# Claude Skills · Shorts animados

Crea **shorts animados para TikTok y YouTube** con **tus propios personajes**, **tu línea editorial** y **una voz
para cada personaje**, conversando con Claude. Escribes un tema y recibes el video listo para subir y los textos
para publicarlo. No necesitas programar.

<p align="center">
  <img src="docs/demo.gif" alt="Video de ejemplo: Sofi y Chispa explican por qué el cielo es azul" width="300">
</p>

**▶ Tutorial paso a paso en YouTube:** [ver el tutorial](https://youtu.be/1xqbsVt29h0)
<!-- Si grabas un tutorial de la v2, cambia el enlace de arriba -->

---

## ¿Qué es?

Dos **skills de Claude** y una plantilla de video que producen shorts verticales (1080×1920) para publicar en
**TikTok** y **YouTube Shorts** (también sirven para Instagram Reels y Facebook).

Cada escena es una **conversación**: tu personaje principal explica, el secundario pregunta o pone el humor, una voz
en off aporta datos y, cuando hace falta, aparece un extra. **Cada uno habla con su propia voz** de ElevenLabs
(al inicio todos usan la misma y la cambias cuando quieras). La cámara sigue a quien habla, los personajes hacen
gestos al ritmo de la voz y el fondo cambia entre videos para que tu perfil no se vea siempre igual.

El mismo tema sale en **dos versiones**, porque cada plataforma premia algo distinto:

| | TikTok · versión ágil | YouTube · versión clase |
|---|---|---|
| Objetivo | que lo vean completo y comenten | que lo encuentren por búsqueda |
| Duración (por defecto) | 40–60 s · 6–8 escenas | 60–90 s · 7–10 escenas |
| Estilo | subtítulos grandes, zoom rápido a quien habla, aviso "+ Sígueme" | subtítulos medianos, cámara suave, contador "03/07" |
| Cierre | pregunta para comentarios | tarjeta "Más en el próximo video" |

Todo eso se puede cambiar en tu línea editorial.

**Escribes:**

```
/nuevo-video ambos por qué el cielo es azul
```

**Recibes:**

- La **trama** de cada versión en una tabla (escena · quién habla · qué dice · qué se ve), para aprobarla o pedir cambios.
- El **guion por voces** en texto plano (quién dice cada línea).
- Los **textos para publicar**: descripción de TikTok, y título y descripción de YouTube, con tus hashtags.
- Las **voces** generadas con ElevenLabs (o tu propio audio).
- El **video final** de cada plataforma, con escenas, gestos, cámara y subtítulos sincronizados con la voz.

## Los dos skills

| Skill | Para qué |
|---|---|
| **`/personajes`** | Crea tu elenco: el **personaje principal** a partir de **tu foto** o de una descripción, un **personaje secundario** (robot, foco, panda u otra persona), extras y **la voz de cada uno**. Te muestra una hoja con todos para aprobarla. |
| **`/nuevo-video`** | Crea cada video: trama, textos, voces y MP4. También configura tu **línea editorial y tus fondos** (`/nuevo-video editorial`) y las **voces** (`/nuevo-video voz`). |

Viene con un **ejemplo listo**: Sofi (presentadora), Chispa (un foco con humor), cinco extras y un canal ficticio de
ciencia, @tucanal. Cuando creas tus personajes y tu línea editorial, el ejemplo deja de usarse.

<p align="center">
  <img src="docs/personajes-ejemplo.png" alt="Elenco de ejemplo: Sofi, Chispa y extras" width="360">
</p>

## Novedades de la v2

- **Una voz por personaje**: voz en off, principal, secundario y extras, cada uno con su voice ID de ElevenLabs.
  Por defecto todos usan la misma; la cambias con `/personajes voz`.
- **Escenas en diálogo**: varios personajes conversan en cada escena, con gestos (explicar, señalar, asentir,
  encogerse, celebrar, saltar…) y la cara y el color de quien habla en el subtítulo.
- **Cámara**: sigue a quien habla, enfoca el objeto cuando se explica y cambia el encuadre entre escenas.
- **Escenas nuevas**: diagrama que se dibuja al nombrar cada parte, pizarra, línea de tiempo, la pregunta del público,
  tabla y resumen.
- **Fondos claros y oscuros** que rotan entre videos (6 fijos) y, si quieres, **fondos con tus colores de marca**.
- **Hoja de revisión**: una sola imagen con una toma por cada línea del guion, para revisar todo el video de un vistazo.
- **Plan antes de gastar**: antes de generar las voces ves qué voz hace cada personaje y cuántos créditos usará.

## Requisitos

| Qué | Para qué | Notas |
|---|---|---|
| **Claude** con un plan **Pro, Max, Team o Enterprise** | Usar los skills (Claude Code) | El plan gratuito no incluye Claude Code ([ver planes](https://claude.com/pricing)). |
| **Node.js 20 o superior** | Armar y exportar los videos | Descárgalo de [nodejs.org](https://nodejs.org) (versión LTS). |
| **ElevenLabs** (opcional) | Generar las voces con IA | Necesitas una clave de API. Con el plan gratuito algunas voces no están disponibles. Sin ElevenLabs puedes usar tu propio audio o exportar sin voz. |

> Yo lo uso con **Claude Pro** y el plan **Starter de ElevenLabs**.

## Dos formas de usarlo

| | **Ruta A · App de escritorio de Claude** | **Ruta B · Claude Code en la terminal** |
|---|---|---|
| Para quién | Cualquier persona, sin saber programar | Quien ya usa la terminal o programa |
| Cómo se usa | Escribes en el chat de la app | Escribes en la terminal (`claude`) o corres los comandos `npm` tú mismo |
| Skills | Los mismos: `/personajes` y `/nuevo-video` | Los mismos, más acceso directo a todos los comandos |

---

## Ruta A · App de escritorio de Claude (sin programar)

### Instalación

1. Instala **Node.js 20+** desde [nodejs.org](https://nodejs.org) (botón LTS → siguiente, siguiente).
2. Instala la **app de Claude** desde [claude.com/download](https://claude.com/download) e inicia sesión.
3. En esta página de GitHub: botón verde **Code → Download ZIP**. Descomprímelo donde quieras
   (se crea la carpeta `claude-skills-shorts-animados-main`).
4. En la app de Claude abre la pestaña **Code**. Debajo del cuadro de texto elige el entorno **Local**, luego
   **Open folder…** y selecciona esa carpeta.
5. Escribe: `prepara el estudio`. Claude instala lo necesario (1–2 minutos la primera vez) y te dice qué falta configurar.
6. Escribe `/` y confirma que aparecen **`personajes`** y **`nuevo-video`**.

### Primeros pasos

1. **Mira el ejemplo.** Pide *"abre el Studio"*: verás los videos de ejemplo `cielo-azul-tiktok` y `cielo-azul-youtube`.
2. **Crea tus personajes y sus voces.**
   ```
   /personajes
   ```
   Adjunta tu foto (o descríbete), elige tu personaje secundario, aprueba la hoja del elenco y decide si cada uno
   tiene su propia voz o todos usan la misma.
3. **Define tu línea editorial.**
   ```
   /nuevo-video editorial
   ```
   Claude te muestra el ejemplo y te hace unas preguntas: de qué trata tu canal, para quién, tono, idioma, duración
   por plataforma, @usuario, hashtag y si quieres los fondos que rotan o tus colores de marca.
4. **Crea tu primer video.**
   ```
   /nuevo-video ambos <tu tema>
   ```

> Si pides un video sin haber creado tus personajes o tu línea editorial, Claude te lo pregunta en ese momento.

### Cómo se crea un video

1. **Trama.** Claude propone el guion de cada plataforma en una tabla: escena, tipo de escena, quién habla, qué dice
   y qué se ve. Responde **"aprobado"** o pide cambios (*"la escena 2 más corta"*, *"que Chispa haga la pregunta"*).
2. **Revisión.** Claude arma el video y revisa una hoja con una toma por cada línea. Corrige lo que se vea mal.
3. **Textos.** Te entrega, listos para copiar, el guion por voces y los textos para publicar. También quedan en `out/`.
4. **Voces.** Antes de generar te muestra qué voz hace cada personaje y cuántos créditos usará. Eliges
   **generar**, **cambiar alguna voz** o **sin voz IA**.
5. **Video.** Exporta `out/<id>.mp4` por cada plataforma.
6. **Publica.** Sube el MP4 con sus textos.

Ejemplos:

```
/nuevo-video tiktok cómo ahorrar agua en casa
/nuevo-video youtube qué es la inflación
/nuevo-video ambos por qué el cielo es azul
```

### Las voces

Cada personaje tiene su voz: **voz en off**, **principal**, **secundario** y **extras** (todos los extras comparten una,
o cada uno la suya). Al empezar, todos usan la misma voz por defecto. Tienes tres opciones para cada video:

1. **ElevenLabs con tu cuenta (por defecto).**
   - En [elevenlabs.io](https://elevenlabs.io) → **Developers → API Keys** → crea una clave con permiso **Text to Speech**
     (y, para ver tus créditos y el nombre de las voces, **Voices: Read** y **User: Read**).
   - Abre el archivo **`.env`** de la carpeta y pega la clave después de `ELEVENLABS_API_KEY=`. Guarda.
   - **No pegues la clave en el chat.** Queda solo en tu computadora.
2. **Tu propio audio.** Graba (o genera en otra app) leyendo el guion por voces **en orden, con una pausa corta entre
   líneas**, guárdalo como `public/audio/<id>.mp3` y dile a Claude *"ya dejé mi audio de <id>"*. Lo sincroniza con el video.
3. **Sin voz.** El video sale igual, como vista previa en silencio (`out/<id>-SIN-VOZ.mp4`); le pones la voz después.

Para cambiar voces: `/personajes voz`. Puedes pedir *"muéstrame mis voces de ElevenLabs"*, *"ponle a Chispa la voz
<voice ID>"* o *"quiero escuchar la voz de Sofi"*. Si la voz por defecto no está disponible en tu cuenta, Claude te
muestra tus voces para que elijas.

### Qué puedes personalizar

| Qué | Cómo |
|---|---|
| Tus personajes: aspecto, nombres, papel y personalidad | `/personajes editar <cambio>` |
| La voz de cada personaje | `/personajes voz` |
| Extras para algunas escenas | `/personajes agregar <descripción>` · `/personajes quitar <nombre>` |
| Tema, público, tono, quién habla, duración y estructura por plataforma | `/nuevo-video editorial <cambio>` |
| @usuario, lema de la serie, redes, hashtags y tarjeta final | `/nuevo-video editorial <cambio>` |
| Fondos: los 6 que rotan, tus colores de marca o ambos | `/nuevo-video editorial usa mis colores` |
| Estilo de cada plataforma (`agil` o `clase`) | `/nuevo-video editorial <cambio>` |
| Modo de voz (una línea a la vez o diálogo en una sola actuación) | `/nuevo-video voz` |
| Volver al ejemplo | `/personajes reiniciar` · pide *"restaura todo al ejemplo"* |

Ejemplos: *"ponle lentes redondos a mi personaje"*, *"más humor en TikTok"*, *"que los de YouTube duren 75 segundos"*,
*"usa mi rosado #FF5FA2 como color de marca"*.

---

## Ruta B · Claude Code en la terminal (para programadores)

### Instalación

1. **Node.js 20+** ([nodejs.org](https://nodejs.org)) y **git**.
2. **Claude Code** ([guía oficial](https://code.claude.com/docs/en/setup)):

   ```bash
   # macOS, Linux o WSL
   curl -fsSL https://claude.ai/install.sh | bash
   ```

   ```powershell
   # Windows PowerShell
   irm https://claude.ai/install.ps1 | iex
   ```

   También: `brew install --cask claude-code` (Homebrew) o `winget install Anthropic.ClaudeCode` (WinGet).
   Comprueba con `claude --version`.
3. **El proyecto:**

   ```bash
   git clone https://github.com/miguelcotrinaia/claude-skills-shorts-animados.git
   cd claude-skills-shorts-animados
   npm install
   npm run estado          # crea .env y dice qué falta configurar
   ```

4. **Clave de ElevenLabs** (opcional): edita `.env` → `ELEVENLABS_API_KEY=...`.

### Con Claude Code

```bash
claude                    # dentro de la carpeta del proyecto; inicia sesión la primera vez
```

Dentro de la sesión, los mismos skills de la Ruta A:

```
/personajes
/personajes voz Chispa <voiceId>
/nuevo-video editorial
/nuevo-video ambos por qué el cielo es azul
/nuevo-video voz
```

`CLAUDE.md` le explica a Claude el formato de los videos, los tipos de escena, los encuadres y las reglas.

### Solo con comandos (sin Claude)

Un video es un archivo TypeScript en `src/videos/`. Copia `src/videos/cielo-azul-tiktok.ts`, cambia `id`, `canal`,
`ambiente`, `serie` y el `dialogo` de cada escena, y regístralo al final de `src/videos/index.ts`. Luego:

```bash
npm run ambientes -- --siguiente tiktok     # qué fondo toca
npm run typecheck                           # revisa el formato
npm run revisar -- <id>                     # out/revisar/<id>-hoja.png: una toma por línea
npm run guion -- <id>                       # out/<id>-guion-voz.txt y out/<id>-guion-plano.txt
npm run voz:ia -- <id> --plan               # voces, caracteres y créditos (no gasta)
npm run voz:ia -- <id>                      # genera las voces y los subtítulos sincronizados
npm run render -- <id>                      # out/<id>.mp4
```

Todos los comandos:

| Comando | Qué hace |
|---|---|
| `npm run estado` | Qué falta configurar (personajes, canal, línea editorial, clave, modo de voz) |
| `npm run dev` | Remotion Studio en el navegador |
| `npm run perfiles` | Valida `perfiles/` y muestra un resumen · `-- --restaurar personajes\|canal\|editorial\|todo` |
| `npm run personajes` | Hoja del elenco → `out/personajes.png` |
| `npm run ambientes` | Fondos y tabla de contraste → `out/ambientes.html` · `-- --siguiente tiktok\|youtube` |
| `npm run revisar -- <id>` | Hoja de revisión → `out/revisar/<id>-hoja.png` |
| `npm run guion -- <id>` | Guion por voces y guion plano en `out/` |
| `npm run voces -- --info` | Voz de cada personaje, modo y créditos |
| `npm run voces` | Lo anterior + las voces de tu cuenta |
| `npm run voces -- --usar <personaje> <voiceId>` | Cambia la voz de un personaje (nombre, `principal`, `secundario`, `narrador`, `extra` o un extra) |
| `npm run voces -- --escuchar <personaje>` | Frase corta con su voz → `out/voces/` |
| `npm run voces -- --modo lineas\|dialogo` | Modo de voz por defecto · `--probar` comprueba si tu plan tiene diálogo |
| `npm run voces -- --comparar <personaje>` | 6 variantes de modelo y ajustes → `out/comparar/` · `--elegir <personaje> <1-6>` |
| `npm run voz:ia -- <id>` | Voces con ElevenLabs · `--plan` · `--nuevo` (sin caché) · `--modo dialogo` · `--secundario <voiceId>` (solo este video) |
| `npm run sincronizar -- <id>` | Sincroniza tu propio audio (`public/audio/<id>.mp3`) · `--whisper` palabra por palabra |
| `npm run subtitulos -- <id>` | Aplica correcciones de texto sin rehacer la voz |
| `npm run render -- <id>` | Exporta `out/<id>.mp4` (sin voz: `out/<id>-SIN-VOZ.mp4`) · `-- --todos` |
| `npm run typecheck` | Revisa los tipos |

> En **PowerShell**, si un comando con `--` no toma las opciones, escríbelas sin los guiones iniciales:
> `npm run voz:ia cielo-azul-tiktok plan`.

Formato de una escena:

```ts
{
  tipo: "diagrama",
  titulo: "La luz *rebota*",
  nodos: [
    { id: "sol", texto: "Luz del sol", aparece: "luz" },
    { id: "aire", texto: "Aire", icono: "nube", aparece: "aire" },
  ],
  flujo: true,
  dialogo: [
    { quien: "secundario", texto: "¿Y qué pasa con la luz?", gesto: "pensar" },
    { quien: "principal", texto: "La luz choca con el aire y se desvía.", gesto: "senalar", resalta: true },
  ],
},
```

`quien`: `narrador` · `principal` · `secundario` · `extra` (con `extra: "<nombre>"`). Tipos de escena, encuadres,
cámara, fondos y voces: ver [`CLAUDE.md`](CLAUDE.md).

---

## Problemas frecuentes

| Pasa esto | Haz esto |
|---|---|
| No aparecen `/personajes` ni `/nuevo-video` | Revisa que abriste la carpeta del proyecto (la que tiene `package.json`), no una carpeta de más arriba. |
| `node` no se reconoce | Instala Node.js 20+ y vuelve a abrir la app de Claude (o la terminal). |
| `SIN_CLAVE · Falta tu clave de ElevenLabs` | Pega tu clave en `.env`, o usa tu propio audio, o exporta sin voz. |
| "No encontré esa voz en tu cuenta" | Esa voz no está en tu cuenta: `/personajes voz` y elige una tuya. |
| Todos los personajes suenan igual | Es lo normal al empezar: `/personajes voz` para darle a cada uno su voz. |
| "Text to Dialogue no funcionó con tu cuenta" | Solo pasa en el modo `dialogo`: la voz se genera igual, una línea a la vez (modo `lineas`, funciona en todos los planes). |
| El video se detiene con "voz sin sincronizar" | Pide *"sincroniza la voz de <id>"* y vuelve a exportar. |
| Los subtítulos tienen una palabra mal escrita | Pide el cambio a Claude; corrige el texto sin rehacer la voz. |

## Si vienes de la v1

- Tus perfiles (`perfiles/`) siguen funcionando: todos tus personajes hablan con la voz que tenías en la v1
  (`config/voz.json`), tus colores pasan a ser tus colores de marca y el canal usa los fondos que rotan
  (para usar tus colores: `/nuevo-video editorial usa mis colores`).
- Los videos de la v1 (con `dice` y `habla`) no abren en la v2: pide a Claude *"convierte el video <id> a la v2"*
  o vuelve a crearlo con `/nuevo-video`.
- La v1 sigue disponible en la etiqueta [`v1.0`](https://github.com/miguelcotrinaia/claude-skills-shorts-animados/tree/v1.0).

## Dónde queda todo

| Carpeta / archivo | Qué es |
|---|---|
| `perfiles/` | Tus personajes (con sus voces), tu canal y tu línea editorial |
| `out/` | Videos (`.mp4`), hojas de revisión, guiones de voz y textos para publicar |
| `public/audio/` | Las voces de cada video |
| `public/music/` | Música de fondo opcional |
| `src/videos/` | Un archivo por video (lo escribe Claude) |
| `config/voces.json` | Modo de voz, modelos y pausas |
| `config/rotacion.json` | Orden en que rotan los fondos |
| `plantillas/ejemplo/` | El ejemplo original, para restaurarlo |
| `.claude/skills/` | Los dos skills |
| `.env` | Tu clave de ElevenLabs (no se sube a GitHub) |
| `.cache/voz/` | Voces ya generadas, para no pagar dos veces lo mismo (se puede borrar) |

## Créditos y licencia

- Los videos se arman con [Remotion](https://www.remotion.dev). Remotion es gratis para personas y empresas pequeñas;
  las empresas más grandes necesitan licencia de empresa. Revisa las condiciones en
  [remotion.pro/license](https://www.remotion.pro/license) antes de usarlo con fines comerciales a nombre de una empresa.
- Las voces con IA usan la API de [ElevenLabs](https://elevenlabs.io) con tu propia cuenta.
- Este repositorio se publica con licencia [MIT](LICENSE): puedes usarlo y modificarlo, manteniendo el aviso de autoría.
  La licencia de Remotion se aplica aparte, según sus propias condiciones.

## Autor

Creado por **Miguel Cotrina**, arquitecto de soluciones de IA.

Si te sirvió, sígueme como **@miguelcotrinaia** en todas las redes:

[LinkedIn](https://www.linkedin.com/in/miguelcotrinaia) ·
[YouTube](https://www.youtube.com/@miguelcotrinaia) ·
[TikTok](https://www.tiktok.com/@miguelcotrinaia) ·
[Instagram](https://www.instagram.com/miguelcotrinaia) ·
[Facebook](https://www.facebook.com/miguelcotrinaia)
