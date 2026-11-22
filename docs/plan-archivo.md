# Archivo histórico de hitos

## H1 (cerrado 2026-11-22, ba5b01a) — Escena de video: luz, gestos y cierre

Estado: aprobado
Base: 96b178d7ae61e3734a80019f95adf3aaee9e581a

**Objetivo:** que la escena grabada se vea impresionante en video: portada de episodio con luz y partículas tras la cuenta atrás; dos cintas (ajustes y play/pausa) como únicos controles visibles; resaltado por pulsación larga (2 s) con partículas y arrastre; palabras dentro de versículos resaltados; versículo «elegido» especial (4 s) que aparece en una pantalla de cierre con la misma luz; fundido lento a negro y vuelta al menú. Las notas de palabras pasan a ser **del idioma original**: griego para el Nuevo Testamento y **hebreo** para el Antiguo (fuente hebrea, derecha a izquierda, carga propia).

**Fuera de alcance:**
- Captura/exportación de video, cámara, sonido o música.
- Herramienta Trazo (se elimina, decisión del usuario) y las herramientas Luz/Versículo del dock (las sustituyen los gestos).
- Guardar marcas o elegidos entre sesiones/recargas.
- El lector Santiago de la raíz (`index.html`, `src/`, `herramientas/`): no se toca.
- Nuevos datos bíblicos; notas hebreas reales (el usuario las aporta; solo datos sintéticos en pruebas, nunca en `public/data`); arameo como idioma aparte (si aparece, se carga en el archivo hebreo: misma escritura); PWA/service worker; dependencias npm en tiempo de ejecución (todo con Angular + Canvas 2D + CSS; la fuente hebrea se copia a `public/fonts`, ver O3 T5).

**Criterio de terminado:**
- `cd estudio && pnpm test` pasa, incluidas las pruebas nuevas de `sceneLabel`, ajustes y máquina de pulsación.
- `cd estudio && pnpm build` sin errores ni avisos de presupuesto.
- `cd estudio && pnpm exec playwright test` pasa (arranca su propio servidor), cubriendo: portada no saltable con duración configurada; pulsación 2 s → `.verse-lit`; arrastre resalta varios; toque de palabra en versículo resaltado alterna `.word-lit` y fuera de él no hace nada; pulsación 4 s → `.verse-special`; cinta play mueve el scroll; cierre muestra los elegidos; toque → fundido → negro → toque → preparación; con un `hebreo.json` sintético cargado desde «Mi contenido», una palabra con nota abre el diálogo con el término en `lang="he"` `dir="rtl"` renderizado con Noto Serif Hebrew (`document.fonts.check`), y el griego de Santiago sigue funcionando.
- Capturas de `/impeccable` (móvil 390×844 y escritorio 1440×1000, día y noche) revisadas sin hallazgos abiertos de contraste ni de solapes; ninguna pantalla con scroll horizontal.
- README, DESIGN.md y ayuda en la app describen los gestos nuevos; no queda texto de Trazo/Luz/Versículo como herramienta.
- `node scripts/verify.mjs full` pasa, si para entonces existe (ver nota de verificación).

### Diseño acordado (contrato para todas las tareas)

Fuente de verdad para los ejecutores. Si una tarea choca con esto, se anota en «Notas de ejecución» y se pregunta; no se improvisa.

**Visual / mundo.** Se conserva el mundo de DESIGN.md (marfil, tinta cálida, cinta carmín, grabado, Gelasio/Noto Serif/Archivo). Se amplía con un material nuevo, **«luz de atril»**: rayos cálidos que caen desde arriba-centro, polvo dorado suspendido y hoja de oro para lo elegido. Carmín sigue siendo orientación (cintas, numerales, marcapáginas); oro es luz y énfasis. Movimiento continuo **solo** en portada y cierre (secuencias autorizadas), nunca en la lectura salvo autoscroll elegido. Todo efecto tiene camino `prefers-reduced-motion`: sin partículas ni desplazamientos, se mantienen opacidades y estados.

**Rótulo del recorrido — `sceneLabel(bible, mode, start, end)` en `content.ts`.** Separador `" – "` (raya corta con espacios).
- `book` → `"Santiago"`.
- `chapters` → libro y capítulo inicial: `"Santiago 3"`.
- `range`, mismo libro, mismo capítulo → `"Santiago 1"`.
- `range`, mismo libro, cubre todos sus capítulos → `"Santiago"`.
- `range`, mismo libro → `"Santiago 1 – 3"`.
- `range`, libros distintos → cada extremo lleva capítulo salvo que sea su borde natural (inicio en el cap. 1 / fin en el último): `"Santiago 4 – 1 Pedro 2"`, `"Santiago – 1 Pedro"`, `"Santiago 4 – 1 Pedro"`.
- Se usa el `number` real del capítulo, no el índice.

**Ajustes nuevos (persistidos en `localStorage` `verbo.settings`, validados como los actuales):**
- `intro.enabled: boolean` (def. `true`) — «Mostrar portada».
- `intro.title: string` (def. `"Episodio 1"`, texto libre, máx. 60, se recorta; vacío permitido → la portada muestra solo el rótulo).
- `intro.duration: number` segundos, entero 3–10 (def. 5).
- `original: boolean` (def. `false`) — modo «Idioma original» en escena. Acepta la clave antigua `greek` si viniera guardada.

**Notas del idioma original (griego y hebreo).**
- Tipo `OriginalNote` (reemplaza `GreekNote`): `{book, chapter, verse, word, original, transliteration, meaning, context?, language:'griego'|'hebreo'}`. `word` sigue siendo la palabra en español del versículo (la búsqueda no cambia).
- Archivos opcionales e independientes: `public/data/griego.json` (existente) y `public/data/hebreo.json` (nuevo, puede faltar). Misma forma `{notes:[…]}`. El campo del término es `original`; se acepta `greek` (griego) y `hebrew` (hebreo) como alias para no romper archivos existentes. El idioma lo fija el archivo del que viene la nota, no se adivina.
- `parseOriginal(raw, language)` valida y normaliza; error claro por idioma («El archivo del hebreo debe contener una lista notes.»). Un término hebreo debe contener al menos un carácter U+0590–U+05FF o U+FB1D–U+FB4F; uno griego, U+0370–U+03FF o U+1F00–U+1FFF; si no, error que nombra la nota (evita cargar un archivo en la casilla equivocada).
- Se combinan ambas listas; al cargar otra Biblia se limpian **las dos**. Si hubiera solapes en un mismo versículo, prevalece la primera según el orden griego → hebreo (como hoy, la primera del archivo).
- «Mi contenido»: dos casillas, «Cargar notas del griego» (α) y «Cargar notas del hebreo» (א); el estado muestra «N notas del griego · M del hebreo».
- Interruptor en escena: «Idioma original». Su glifo y nombre accesible siguen las notas del **libro actual**: solo griego → α, «Consultar griego»; solo hebreo → א, «Consultar hebreo»; ambas → «α א», «Consultar idioma original»; ninguna → deshabilitado con la pista «Este libro no tiene notas del idioma original».
- Diálogo de nota: el término va en `lang="grc"` o `lang="he"`; el hebreo con `dir="rtl"`, `unicode-bidi:isolate`, alineado al centro, Noto Serif Hebrew (conserva niqqud y acentos de cantilación) a un tamaño mayor que el griego (≈44 px; ajustar en la ronda de capturas). La transliteración y el significado siguen en LTR. Etiqueta superior: «Griego · Santiago 1:1» / «Hebreo · Génesis 1:1». Texto de cierre del diálogo neutral («Una palabra, un poco más de luz.» se conserva).
- Fuente: Noto Serif Hebrew (OFL), woff2 del subconjunto hebreo, servida local con `font-display:swap` y `unicode-range: U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F`; licencia en `public/licencias/Noto-Serif-Hebrew-OFL.txt`.

**Fases de la escena (máquina en `AppComponent`):** `countdown → intro → reading → ending → fading → black`. `countdown` solo si está activada; `intro` solo si `intro.enabled`. `black` + toque → `exitScene()` (vuelve a la preparación).

**Portada (`intro`), duración D = `intro.duration`, no se puede saltar** (toques y teclas ignorados salvo Escape, que no salta: nada). Secuencia sobre la página ya renderizada debajo (con `live=false`):
- 0–0,9 s: el último número de la cuenta atrás se disuelve; la luz se abre desde arriba-centro (rayos con `conic-gradient` enmascarado + resplandor radial; en día viñeta de tinta 8–12 % en bordes para que la luz se lea sobre marfil; en noche luz aditiva dorada). Empieza el polvo ambiental.
- 0,4–1,6 s: título (`intro.title`) en Noto Serif display grande, entra con desenfoque→nitidez y ajuste de interletra; máscara de revelado.
- 1,0–2,0 s: se dibuja una regla carmín corta; debajo, el rótulo (`sceneLabel`) en Gelasio cursiva.
- Sostén hasta D − 0,9 s: rayos giran ±3° muy lento (solo `transform`), polvo flotando.
- Últimos 0,9 s: «inundación»: la luz se expande, título y rótulo se elevan y desvanecen, la página aparece (fundido). Al terminar → `reading` y aparecen las cintas.
- Reduced motion: composición estática visible D segundos, fundido de opacidad al final, sin partículas.
- Si `intro.enabled=false` → directo a `reading`.

**Cintas (únicos controles visibles al leer).** Dos cintas cuelgan del borde superior con la forma actual (cola en V, área táctil 44 px, forma visible 29–32 px):
- **Ajustes** (existente, carmín, icono sliders/close): abre/cierra el panel.
- **Play/Pausa** (nueva): tinta de página en día / marfil en noche, con hilo dorado de 1 px en el borde; icono play/pause en color papel; al reproducir queda «tirada» (alargada como `.active`). Toggle de autoscroll. Nombre accesible «Iniciar o pausar autoscroll».
- Orden: ajustes junto al borde, play hacia dentro, 8 px de separación. Lado derecho por defecto; si el encuadre del presentador está activo en `top-right`, ambas pasan a la izquierda (espejo).
- Ocultas en `countdown`, `intro`, `fading`, `black`. En `ending` solo la de ajustes.

**Panel de la cinta de ajustes (reemplaza el dock de herramientas):** barra superior actual (Estudio, rótulo, ajustes). Dock: interruptor **Idioma original** (α / א según el libro, `aria-pressed`; ver §Notas del idioma original), **Limpiar marcas** (resaltados y palabras del capítulo actual; no toca elegidos), contador «✦ N para el cierre» si N>0, pista «Mantén 2 s para resaltar · 4 s para el cierre», navegación de capítulo (anterior / Cerrar lectura / siguiente). Se retira a los 5 s como hoy. Se eliminan Luz, Versículo, Trazo y Scroll del dock.

**Gestos sobre el texto (en `v-reader`, Pointer Events, ratón y dedo):** constantes en `press.ts`: `LIT_MS=2000`, `SPECIAL_MS=4000`, `SLOP_PX=10`, `CHARGE_DELAY_MS=350`, `EDGE_PX=64`.
- Pulsar y mover > `SLOP_PX` antes de 2 s → se cancela (es scroll nativo).
- Mantener quieto: desde `CHARGE_DELAY_MS` el versículo «carga luz» (resplandor que crece desde el punto de presión, `--charge` 0→1).
- A los 2 s: alterna resaltado del versículo (si no estaba → se resalta; si estaba → se quita). Ráfaga de partículas `lit`. `navigator.vibrate?.(12)`. Modo de pintura = añadir o quitar según ese resultado.
- Tras 2 s, si arrastra: se bloquea el scroll nativo (listener `touchmove` no pasivo con `preventDefault` solo en esta fase) y cada versículo bajo el dedo (`elementFromPoint` → `.verse[data-verse]`) recibe el mismo modo, con ráfaga `paint` pequeña. Cerca del borde (`EDGE_PX`) del área de lectura el texto se desplaza solo, proporcional a la cercanía, solo si el autoscroll está en pausa. Arrastrar cancela el paso a 4 s.
- Tras 2 s, si sigue quieto: segunda carga en oro con aureola fina; a los 4 s alterna **elegido** y el resaltado vuelve al estado previo a la pulsación (resaltado y elegido son independientes). Ráfaga `special` + anillo. `navigator.vibrate?.([10,40,18])`.
- Soltar después de 2 s → se traga el `click` siguiente (no alterna palabras por accidente).
- Toque corto sobre palabra: si el versículo está resaltado o elegido → alterna `.word-lit` + chispa `word`. Si «Idioma original» está activo y la palabra tiene nota (griega o hebrea) → abre la nota (prioridad sobre el resaltado). En otro caso, nada.
- Quitar el resaltado de un versículo borra sus palabras marcadas.
- Autoscroll: ya no se pausa con `touchstart`; se pausa con wheel o con un desplazamiento manual real (movimiento > `SLOP_PX` que no sea gesto de resaltado). Durante la carga sigue corriendo.
- En `live`: `user-select:none`, `-webkit-touch-callout:none`, sin menú contextual sobre `.scripture`.
- Teclado (alternativa accesible): con foco en una palabra, Enter = toque; `H` = alternar resaltado del versículo; `E` = alternar elegido. Anuncios en una región `aria-live` **sr-only** (nunca toast visible: saldría en el video): «Versículo 3 resaltado», «Versículo 3 elegido para el cierre».
- El número de versículo deja de ser botón (span `aria-hidden`); los nombres accesibles de palabras dicen «Resaltar <palabra>» solo si su versículo está resaltado.

**Aspecto de las marcas (`reader.css`).** Sin reflujo (padding compensado con margen negativo). Texto siempre ≥ 4.5:1 en día y noche.
- Carga: degradado radial ámbar en `--px/--py` que crece con `--charge`; segunda etapa en oro con contorno interior fino creciente.
- `.verse-lit` «luz de versículo»: banda cálida con degradado horizontal (más intensa a la izquierda, se apaga a la derecha), resplandor exterior suave, filete dorado de 3 px a la izquierda del texto. Entrada 700 ms: barrido de luz izquierda→derecha + destello.
- `.word-lit` (en versículo resaltado): trazo de marcador ámbar en la mitad inferior de la palabra + halo; floración de 600 ms con destello de brillo (sin escalar inline).
- `.verse-special` «hoja de oro»: fondo dorado con brillo diagonal, filetes dorados finos arriba/abajo, marcapáginas carmín con cola en V en el margen izquierdo (≈14×22 px), estrella ✦ dorada tras el número. Entrada: barrido de brillo 1,2 s + pulso de resplandor una sola vez. Prevalece visualmente sobre `.verse-lit`.

**Partículas (`particles.ts`, Canvas 2D, sin dependencias).** Un solo `<canvas>` sobre `.preview-frame` (encima del lector, debajo de cintas/panel, `pointer-events:none`), DPR máx. 2, `ResizeObserver`. Sprites precalculados (punto con halo, chispa). Tope 500 partículas, `dt` acotado a 64 ms, rAF solo mientras haya vida o ambiente, pausa con `document.hidden`. Expone `data-live` con el número de partículas vivas (para pruebas).
- `burst('lit', rect)`: 28–40 motas ámbar desde los bordes del versículo (sesgo al borde superior), suben y derivan, vida 0,9–1,4 s, 2–5 px.
- `burst('paint', rect)`: ~10 motas. `burst('word', rect)`: 10–14 chispas, 0,6 s.
- `burst('special', rect)`: 60–80 doradas + 6–8 carmín, salen radiales y luego flotan, vida 1,6–2,2 s, más un anillo dorado que se expande 700 ms desde el centro.
- `ambient(on)`: polvo en el haz de luz: 70 motas en teléfono, 120 en escritorio, deriva lenta y parpadeo de alfa; al apagar se desvanece 600 ms.
- Tema: día → `source-over`, ámbar/oro con alfa (`#c9962e`, `#e0b54a`, `#a8741f`); noche → `lighter` (`#ffd27a`, `#f3b54a`).
- Reduced motion: `burst` no hace nada; `ambient` no dibuja.

**Cierre (`ending`).** Mismo mundo que la portada (luz + polvo ambiental), composición:
- Arriba, pequeño: `intro.title · sceneLabel` (Archivo versalitas).
- Centro: los **elegidos** del tramo, en orden canónico (libro, capítulo, versículo), cada uno con su texto en Gelasio y referencia «Santiago 1:2» en Archivo + marcapáginas carmín. 1 → cita grande centrada; 2–3 → apilados con reglas; 4+ → columnas en escritorio / pila compacta en móvil. Ajuste automático de tamaño: baja la letra en pasos hasta caber (mínimo 15 px); si aun así no cabe, la lista hace scroll interno.
- Debajo: el mensaje final (`endMessage`) y la hoja. Sin elegidos → el mensaje final grande (composición actual mejorada).
- Los elegidos se guardan en `AppComponent` (sobreviven al cambio de capítulo): `{bookId, bookName, chapter, verse, text}`. Se vacían al empezar escena y al «Continuar lectura» (cada pantalla de cierre muestra los de su tramo).
- La cinta de ajustes abre las acciones actuales (Volver al estudio / Continuar lectura o Leer de nuevo).
- Toque fuera de la cinta → `fading`: velo negro 0→1 en `FADE_MS=6000` (ease-in-out), el polvo se apaga a la vez. Toques ignorados durante el fundido. En `black`, tras 600 ms de guarda, un toque → `exitScene()`. Reduced motion: mismo fundido (es opacidad y es el cierre buscado).

**Verificación en todas las oleadas.** El repo aún no tiene `scripts/verify.mjs`. Recomendado: correr `/preparar-proyecto` una vez antes de ejecutar el hito; si existe, usar `node scripts/verify.mjs quick|full`. Si no, los comandos de cada oleada son los de abajo (todos desde `estudio/`). Las pruebas e2e usan `reducedMotion:'reduce'`: validan estado, no animación; los tiempos de pulsación se prueban con espera real (`waitForTimeout(2200)` / `(4200)`).

**/impeccable.** Las tareas de UI empiezan invocando el skill `impeccable` con el subcomando indicado y `--target` en el archivo principal; siguen su `craft-floor.md` antes de editar y hacen **una** ronda de capturas (móvil + escritorio) + un lote de arreglos, no un bucle.

### Paso previo (orquestador, antes de O1)

- [x] P0 (96b178d) — Línea base: `git add estudio && git commit -m "chore(estudio): add Verbo studio baseline"` (respeta `estudio/.gitignore`: sin `node_modules`, `dist`, `.impeccable/review`, `test-results`). Comprueba con `git show --stat HEAD` que no entraron esos directorios. Reemplaza `Base:` arriba por ese SHA y cambia Estado a «aprobado».

### Oleadas

- [x] O1 (ae980cc) — Arnés de pruebas y lógica pura
  - Verificación: `pnpm test && pnpm build && pnpm exec playwright test` (las e2e actuales siguen pasando).
  - Commit: `feat(estudio): add scene label, settings and press logic`
  - [x] T1 — Playwright autosuficiente
    - Leer: `estudio/playwright.config.ts`, `estudio/package.json`, `estudio/README.md` §Ejecutar
    - Archivos: `estudio/playwright.config.ts`, `estudio/package.json`
    - Hacer: añadir `webServer` (`pnpm dev`, url `http://127.0.0.1:4200`, `reuseExistingServer:true`, timeout 120 s) y script `"e2e": "playwright test"`.
    - Hecho cuando: con el puerto 4200 libre, `pnpm exec playwright test` arranca el servidor y pasa las pruebas actuales.
  - [x] T2 — `sceneLabel()`
    - Leer: este plan §Rótulo del recorrido, `estudio/src/app/content.ts`, `estudio/tests/content.test.ts`
    - Archivos: `estudio/src/app/content.ts`, `estudio/tests/content.test.ts`
    - Hecho cuando: `pnpm test` pasa con un caso por cada regla del rótulo (7 casos, con una Biblia sintética de 3 libros, uno de ellos con nombre «1 Pedro»).
  - [x] T3 — Ajustes extraídos y extendidos
    - Leer: este plan §Ajustes nuevos, `estudio/src/app/app.ts` (`Settings`, `DEFAULTS`, `loadSettings`)
    - Archivos: `estudio/src/app/settings.ts` (nuevo: tipo, `DEFAULTS`, `parseSettings(raw:unknown):Settings` puro), `estudio/src/app/app.ts` (usarlo; sin cambio de comportamiento), `estudio/tests/settings.test.ts` (nuevo)
    - Hecho cuando: `pnpm test` cubre: valores por defecto, recortes de rango (fuente, velocidad, tamaño de encuadre, `intro.duration` 3–10), `intro.title` recortado a 60 y vacío permitido, basura/JSON inválido → defaults, ajustes viejos sin `intro` ni `original` → defaults en esos campos, clave antigua `greek:true` → `original:true`. `pnpm build` pasa.
  - [x] T4 — Máquina de pulsación pura
    - Leer: este plan §Gestos sobre el texto
    - Archivos: `estudio/src/app/press.ts` (nuevo), `estudio/tests/press.test.ts` (nuevo)
    - Hacer: reductor sin DOM ni temporizadores: `pressDown(state,{verse,x,y,t,lit,special})`, `pressMove(state,{x,y,t,verseUnder})`, `pressTick(state,t)`, `pressUp(state,t)`; cada uno devuelve `{state, effects}`. Efectos: `charge{verse,stage:1|2,level}`, `setLit{verse,on}`, `toggleSpecial{verse}`, `paint{verse,on}`, `swallowClick`, `burst{verse,kind}`, `haptic{kind}`, `cancel`. Exporta las constantes del contrato.
    - Hecho cuando: `pnpm test` cubre: mover antes de 2 s cancela; 2 s alterna resaltado (ambos sentidos) y fija modo de pintura; arrastre tras 2 s pinta cada versículo una sola vez y anula el paso a 4 s; 4 s alterna elegido y restaura el resaltado previo; soltar tras 2 s produce `swallowClick`; soltar antes de 2 s no produce efectos de marca; `charge.level` sube de 0 a 1 entre `CHARGE_DELAY_MS` y 2 s, y de nuevo entre 2 s y 4 s.
  - [x] T5 — Contrato de notas del idioma original
    - Leer: este plan §Notas del idioma original, `estudio/src/app/content.ts`, `estudio/tests/content.test.ts`, `estudio/src/app/app.ts` (`loadContent`, `importFile`), `estudio/src/app/reader.ts` (uso de `GreekNote`)
    - Archivos: `estudio/src/app/content.ts`, `estudio/tests/content.test.ts`, `estudio/src/app/app.ts` y `estudio/src/app/reader.ts` (solo renombrar tipo y llamar a `parseOriginal(raw,'griego')`; sin cambio visible todavía)
    - Hecho cuando: `pnpm test` cubre: griego con campo `greek` (formato actual, el `griego.json` instalado sigue cargando sus 286 notas) y con `original`; hebreo con `hebrew` y con `original`; término latino en archivo hebreo → error que nombra la nota; término hebreo en archivo griego → error; `tokenize` asocia una nota hebrea por su palabra española igual que la griega; mezcla griego+hebreo conserva `language` de cada una. `pnpm build` pasa.

- [x] O2 (668982d) — Motor de luz y partículas
  - Verificación: `pnpm test && pnpm build`
  - Commit: `feat(estudio): add light and particle engine`
  - [x] T1 — Partículas · invoca `/impeccable animate --target estudio/src/app/particles.ts`
    - Leer: este plan §Partículas, §Visual, `estudio/src/app/engraving.ts` (estilo de componente)
    - Archivos: `estudio/src/app/particles.ts` (componente `v-particles` con `burst(kind, rect:DOMRect)`, `ambient(on)`, `theme` input `day|night`; lógica de pool/emisión en funciones puras exportadas), `estudio/tests/particles.test.ts` (nuevo)
    - Hecho cuando: `pnpm test` verifica funciones puras (conteos por tipo y por teléfono/escritorio, tope 500, partículas mueren al terminar su vida, `dt` acotado, reduced motion → 0 emitidas). `pnpm build` pasa.
  - [x] T2 — Capa de luz reutilizable · invoca `/impeccable animate --target estudio/src/app/lumen.ts`
    - Leer: este plan §Visual, §Portada, §Cierre, `estudio/DESIGN.md`, `estudio/src/styles.css` (tokens `:root`, `.dark-scene`)
    - Archivos: `estudio/src/app/lumen.ts` (nuevo componente `v-lumen`: rayos + resplandor + viñeta, inputs `phase: 'off'|'rise'|'hold'|'flood'|'dim'` y `night`, estilos propios, solo `transform`/`opacity`/`filter` acotados)
    - Hecho cuando: `pnpm build` pasa y una captura manual (página temporal o el propio preview con `phase='hold'` forzado y luego revertido) muestra la luz en día y noche; el forzado temporal no queda en el diff.

- [x] O3 (8c2e747) — Gestos de resaltado y dos cintas
  - Verificación: `pnpm test && pnpm build && pnpm exec playwright test`
  - Commit: `feat(estudio): long-press highlights, chosen verses and ribbons`
  - [x] T1 — Gestos en el lector (lógica) · invoca `/impeccable animate --target estudio/src/app/reader.ts` (solo para la sensación de la carga 0→2→4 s, el tiempo de las ráfagas y la respuesta háptica; el aspecto final de las marcas es T2)
    - Leer: este plan §Gestos, `estudio/src/app/reader.ts`, `estudio/src/app/press.ts`
    - Archivos: `estudio/src/app/reader.ts`, `estudio/src/app/reader.css` (solo clases mínimas de estado; el aspecto final es T2)
    - Hacer: quitar Trazo (ink-layer, `drawings`, `undo`, input `tool`) y sustituirlo por input `greek:boolean`; `data-verse` en cada `.verse`; conectar `press.ts` con pointer events + temporizador rAF mientras haya pulsación; listener `touchmove` no pasivo solo en fase de pintura; arrastre con autoscroll de borde; tragar click; input `specials:Set<number>` del capítulo y outputs `specialToggle(verse)`, `burst({kind,rect})`, `note`; región `aria-live` sr-only; teclas Enter/H/E; cambio de la regla de pausa del autoscroll.
    - Hecho cuando: `pnpm build` pasa y, en `pnpm dev`, ratón: mantener 2 s resalta, 4 s marca elegido (clase `.verse-special`), clic en palabra de versículo resaltado alterna `.word-lit`.
  - [x] T2 — Aspecto de marcas · invoca `/impeccable bolder --target estudio/src/app/reader.css`
    - Leer: este plan §Aspecto de las marcas, `estudio/src/app/reader.css`, `estudio/DESIGN.md` §Scripture emphasis
    - Archivos: `estudio/src/app/reader.css`, `estudio/src/app/reader.ts` (solo si hace falta un span/atributo para el marcapáginas o la estrella)
    - Hecho cuando: capturas móvil día y noche con un versículo cargando, uno resaltado con dos palabras, uno elegido; contraste del texto ≥ 4.5:1 medido en cada estado (anotar valores en el reporte); sin reflujo al resaltar (la altura de `.reading-content` no cambia).
  - [x] T3 — Cintas, panel y elegidos en la app · invoca `/impeccable polish --target estudio/src/app/app.html`
    - Leer: este plan §Cintas, §Panel, §Cierre (almacén de elegidos), `estudio/src/app/app.ts`, `estudio/src/app/app.html`, `estudio/src/styles.css` (`.control-ribbon`, `.scene-controls`, `.scene-dock`, bloque final de `.control-ribbon`)
    - Archivos: `estudio/src/app/app.ts`, `estudio/src/app/app.html`, `estudio/src/styles.css`, `estudio/src/app/icon.ts` (quitar `pen`/`undo` si quedan sin uso)
    - Hacer: cinta play/pausa; posición espejo con encuadre `top-right`; panel nuevo; interruptor «Idioma original» ligado a `settings.original` (glifo, nombre y deshabilitado según las notas del libro actual; el diálogo hebreo completo es T5); almacén de elegidos con texto y referencia; montar `v-particles` en `.preview-frame` y reenviar `burst` del lector (rect relativo al frame); quitar `tool` y la lógica de Trazo de `scheduleHide`.
    - Hecho cuando: `pnpm build` pasa; en `pnpm dev` (móvil 390×844) se ven solo las dos cintas, play mueve el texto, el panel muestra Griego/Limpiar/contador/navegación, y con encuadre arriba-derecha las cintas están a la izquierda.
  - [x] T4 — E2E de escena
    - Leer: este plan §Gestos, §Cintas, `estudio/e2e/studio.spec.ts`, `estudio/e2e/captures.spec.ts`
    - Archivos: `estudio/e2e/studio.spec.ts`, `estudio/e2e/captures.spec.ts`
    - Hacer: reemplazar los pasos de Luz/Versículo/Trazo/Scroll por: pulsación 2,2 s (`mouse.down` + espera + `mouse.up`) → `.verse-lit`; repetir → se quita; pulsar 2,2 s y arrastrar sobre dos versículos más → 3 `.verse-lit`; clic en palabra de versículo resaltado alterna `.word-lit` y en uno no resaltado no; 4,2 s → `.verse-special` y el estado de resaltado previo se conserva; el interruptor «Consultar griego» del panel abre la nota «siervo»; cinta play aumenta `scrollTop`; encuadre arriba-derecha → cintas a la izquierda sin solaparse con `.presenter-space`. Desactivar portada en estas pruebas vía ajustes.
    - Hecho cuando: `pnpm exec playwright test` pasa.
  - [x] T5 — Hebreo en la app: fuente, carga y diálogo · invoca `/impeccable typeset --target estudio/src/app/app.html`
    - Leer: este plan §Notas del idioma original, `estudio/public/fonts/fuentes.css`, `estudio/src/app/app.html` (diálogo «Tu contenido» y `#noteDialog`), `estudio/src/app/app.ts` (`loadContent`, `importFile`), `estudio/src/styles.css` (`.greek-dialog`, `.greek-word`, `.greek-tool`)
    - Archivos: `estudio/public/fonts/noto-serif-hebrew-*.woff2` + `estudio/public/fonts/fuentes.css`, `estudio/public/licencias/Noto-Serif-Hebrew-OFL.txt`, `estudio/src/app/app.ts`, `estudio/src/app/app.html`, `estudio/src/styles.css`, `estudio/e2e/hebrew.spec.ts` (nuevo)
    - Hacer: obtener la fuente con `pnpm add -D @fontsource/noto-serif-hebrew` (o `@fontsource-variable/…` si existe con eje de peso), copiar solo el woff2 del subconjunto hebreo y su OFL, y `pnpm remove` el paquete (no queda dependencia). Cargar `data/hebreo.json` opcional en `loadContent`; casilla de carga hebrea; estado con ambos conteos; diálogo con `lang`/`dir` y etiqueta de idioma; renombrar clases `.greek-*` a `.original-*` donde aplique.
    - Hecho cuando: `pnpm exec playwright test` pasa `hebrew.spec.ts`: Biblia sintética «Génesis» (marcada como prueba) + `hebreo.json` sintético con `original:"בְּרֵאשִׁית"` para «principio» → el panel muestra «Consultar hebreo», tocar «principio» abre el diálogo con `.original-word[lang="he"][dir="rtl"]` y `document.fonts.check('44px "Noto Serif Hebrew"','בְּרֵאשִׁית')` es `true`; un archivo hebreo con término latino muestra el error en `role=alert`. Captura `.impeccable/review/mobile-hebrew.png` revisada: niqqud visibles, sin cortes ni cajas vacías.

- [x] O4 (70a7be5) — Portada de episodio
  - Verificación: `pnpm test && pnpm build && pnpm exec playwright test`
  - Commit: `feat(estudio): episode title card with light`
  - [x] T1 — Ajustes de portada en la preparación · invoca `/impeccable polish --target estudio/src/app/app.html`
    - Leer: este plan §Ajustes nuevos, §Portada, `estudio/src/app/app.html` (aside `.scene-settings`), `estudio/src/styles.css` (`.setting-group`)
    - Archivos: `estudio/src/app/app.html`, `estudio/src/app/app.ts`, `estudio/src/styles.css`
    - Hacer: grupo «La portada» en «Hazla tuya.»: «Mostrar portada», campo «Título» (placeholder «Episodio 1», ej. de tema en la ayuda: «Fe que obra»), duración 3–10 s, vista del rótulo calculado (`sceneLabel`) en solo lectura; botón «Ver portada» que la reproduce dentro de la vista previa sin entrar en escena. En «Tu próxima lectura» usar `sceneLabel`.
    - Hecho cuando: `pnpm build` pasa; cambiar título/duración persiste tras recargar; el rótulo cambia con modo y selección; sin scroll horizontal a 320 px.
  - [x] T2 — Secuencia de portada · invoca `/impeccable animate --target estudio/src/app/title-card.ts`
    - Leer: este plan §Fases, §Portada, `estudio/src/app/lumen.ts`, `estudio/src/app/particles.ts`, `estudio/src/app/app.ts` (`startScene`, cuenta atrás), `estudio/src/styles.css` (`.countdown-overlay`)
    - Archivos: `estudio/src/app/title-card.ts` (nuevo: título + regla + rótulo con sus animaciones, input `phase`, reutilizable por el cierre en modo compacto), `estudio/src/app/app.ts` (fases `countdown→intro→reading`, temporizadores limpiados en `exitScene`/`ngOnDestroy`), `estudio/src/app/app.html`, `estudio/src/styles.css` (cuenta atrás reestilizada para enlazar con la luz: número en carmín sobre marfil que se disuelve en luz)
    - Hecho cuando: en `pnpm dev`, día y noche, la secuencia completa con D=5 s se ve como describe el contrato; tocar o pulsar teclas no la salta; reduced motion muestra la composición estática y el fundido final.
  - [x] T3 — E2E de portada
    - Leer: este plan §Portada, `estudio/e2e/studio.spec.ts`
    - Archivos: `estudio/e2e/intro.spec.ts` (nuevo)
    - Hecho cuando: `pnpm exec playwright test` pasa con: título «Fe que obra» y duración 3 s → tras entrar sin cuenta atrás se ve `.title-card` con ese título y el rótulo esperado; un clic a 1 s no la quita; a ~3,5 s está oculta y las cintas son visibles; con portada desactivada las cintas aparecen de inmediato. Captura `.impeccable/review/mobile-intro.png`.

- [x] O5 (3007f9f) — Cierre con versículos elegidos y fundido a negro
  - Verificación: `pnpm test && pnpm build && pnpm exec playwright test`
  - Commit: `feat(estudio): ending with chosen verses and fade to black`
  - [x] T1 — Pantalla de cierre · invoca `/impeccable layout --target estudio/src/app/ending.ts`
    - Leer: este plan §Cierre, `estudio/src/app/app.html` (`.ending-screen`), `estudio/src/styles.css` (`.ending-*`), `estudio/src/app/title-card.ts`, `estudio/src/app/lumen.ts`
    - Archivos: `estudio/src/app/ending.ts` (nuevo componente: cabecera compacta, lista de elegidos con ajuste automático de tamaño vía `ResizeObserver`, mensaje final, hoja), `estudio/src/styles.css` (quitar estilos `.ending-*` obsoletos)
    - Hecho cuando: capturas móvil y escritorio, día y noche, con 0, 1, 3 y 7 elegidos (incluido uno largo, p. ej. Santiago 1:5) sin solapes ni texto cortado; la letra no baja de 15 px.
  - [x] T2 — Flujo de cierre en la app · invoca `/impeccable animate --target estudio/src/app/app.html` (fundido a negro, apagado del polvo y aparición de acciones bajo la cinta)
    - Leer: este plan §Fases, §Cierre, `estudio/src/app/app.ts` (`finishScene`, `continueScene`, `exitScene`, `move`)
    - Archivos: `estudio/src/app/app.ts`, `estudio/src/app/app.html`, `estudio/src/styles.css` (velo negro)
    - Hacer: fases `ending→fading→black`, velo `FADE_MS`, guarda de 600 ms, acciones bajo la cinta en `ending`, vaciar elegidos al iniciar y al continuar, polvo ambiental encendido en `ending` y apagado al fundir.
    - Hecho cuando: en `pnpm dev`: cerrar lectura con 2 elegidos → se ven; toque → fundido de ~6 s; toques durante el fundido no hacen nada; en negro un toque vuelve a la preparación.
  - [x] T3 — E2E de cierre
    - Leer: este plan §Cierre, `estudio/e2e/studio.spec.ts`
    - Archivos: `estudio/e2e/ending.spec.ts` (nuevo), `estudio/e2e/studio.spec.ts` (ajustar el final que hoy espera `.ending-screen`)
    - Hecho cuando: `pnpm exec playwright test` pasa con: elegir v.2 del cap. 1 y v.1 del cap. 2 → cierre muestra ambos en orden con referencias «Santiago 1:2» y «Santiago 2:1»; clic → velo con opacidad creciente; clic a los 2 s no navega; tras ~6,8 s un clic muestra la preparación (`Entrar en escena` visible). Regla «cada capítulo» + «Continuar lectura» → el siguiente cierre no repite los elegidos del tramo anterior. Captura `.impeccable/review/mobile-ending.png`.

- [x] O6 (a650b26) — Pulido de la escena y documentación
  - Verificación: `pnpm test && pnpm build && pnpm exec playwright test` (o `node scripts/verify.mjs full` si existe)
  - Commit: `feat(estudio): scene polish and docs for video flow`
  - [x] T1 — Página más llamativa · invoca `/impeccable bolder --target estudio/src/app/reader.css`
    - Leer: este plan §Visual, `estudio/src/app/reader.css`, `estudio/src/app/reader.ts` (cabecera de capítulo), `estudio/DESIGN.md`
    - Archivos: `estudio/src/app/reader.css`, `estudio/src/app/reader.ts`, `estudio/src/styles.css`
    - Hacer: grano de papel estático (SVG `feTurbulence` como fondo, sin coste en scroll) y viñeta cálida suave; numeral del capítulo con entrada de tinta/luz al cambiar de capítulo (500–800 ms, una vez); barrido de luz breve sobre la página al pasar de capítulo; folio y cabecera con más carácter sin competir con el texto. Nada de movimiento continuo en la lectura.
    - Hecho cuando: capturas móvil/escritorio día/noche antes y después adjuntas en el reporte; el autoscroll sigue fluido (sin caídas visibles en `pnpm dev` con 26 px/s); contraste de lectura ≥ 7:1 en papel y noche.
  - [x] T2 — Auditoría y pulido final · invoca `/impeccable audit` y luego `/impeccable polish` sobre `estudio/src/app/app.html`
    - Leer: este plan completo §Diseño acordado, `estudio/e2e/captures.spec.ts`
    - Archivos: los que señale la auditoría dentro de `estudio/src/` (≲6), `estudio/e2e/captures.spec.ts` (añadir capturas de portada, marcas y cierre en día y noche)
    - Hecho cuando: una ronda de capturas + un lote de arreglos + como mucho una ronda de confirmación; `estudio/.impeccable/review/finish-review.md` actualizado con veredicto `ship` y sin pendientes de accesibilidad (foco visible, nombres, reduced motion, contraste).
  - [x] T3 — Documentación y ayuda · invoca `/impeccable document` para regenerar `DESIGN.md` y su sidecar desde el código final, y `/impeccable clarify --target estudio/src/app/app.html` para los textos de ayuda
    - Leer: este plan §Diseño acordado, `estudio/README.md`, `estudio/DESIGN.md`, `estudio/PRODUCT.md`, `estudio/src/app/app.html` (diálogo de ayuda)
    - Archivos: `estudio/README.md`, `estudio/DESIGN.md`, `estudio/.impeccable/design.json` (si registra componentes de énfasis), `estudio/PRODUCT.md`, `estudio/src/app/app.html` (solo textos del diálogo de ayuda)
    - Hecho cuando: `grep -niE "trazo|dibuja|herramienta luz" estudio/README.md estudio/DESIGN.md estudio/src/app/app.html` no devuelve restos; README explica portada, cintas, gestos (2 s, arrastre, palabra, 4 s, teclado), cierre y fundido, y documenta `hebreo.json` junto a `griego.json` (campo `original`, alias `greek`/`hebrew`, validación por escritura, ejemplo con niqqud); PRODUCT.md dice «idioma original (griego y hebreo)»; DESIGN.md registra la tipografía hebrea y su tamaño; DESIGN.md documenta «luz de atril», hoja de oro, partículas y la excepción de movimiento en portada/cierre.

### Notas de ejecución

<!-- Una línea por decisión, desvío o bloqueo. Fecha + oleada. -->
- 2026-11-21 plan: decisiones del usuario — título de portada en texto libre (def. «Episodio 1», admite temas); se elimina Trazo y Griego queda como interruptor; portada con duración configurable y no saltable; commit de línea base de `estudio/` antes de O1.
- 2026-11-21 plan: el usuario pide hebreo para el Antiguo Testamento además del griego → notas «del idioma original» (O1 T5, O3 T5, O6 T3). Supuestos: archivo separado `hebreo.json`; idioma fijado por archivo; interruptor único con glifo según el libro; arameo va en el archivo hebreo.
- 2026-11-21 plan: revisión de cobertura de /impeccable — añadido a O2 T1 (animate), O3 T1 (animate), O5 T2 (animate) y O6 T3 (document + clarify). Toda tarea visual lo invoca; las e2e y la lógica pura no.
- 2026-11-21 plan: supuestos del planificador (corregibles al aprobar) — el resaltado y el elegido son independientes (4 s restaura el resaltado previo); cada cierre muestra los elegidos de su tramo; fundido de 6 s fijo; cruces de libro en el rótulo llevan capítulo salvo en bordes naturales.

- 2026-11-22 O1 T1: e2e `studio.spec.ts:56` falló 1 vez en arranque en frío (`.presenter-space` boundingBox null); pasó después. Vigilar flaky; README §Ejecutar aún dice que hace falta servidor en 4200 (corregir en O6 T3).

- 2026-11-22 O1 T4: `press.ts` añade `pressCancel` (pointercancel). Para O3 T1: llamar `pressTick` cada frame rAF mientras `phase!==idle`; `pressUp` nunca emite `charge` (la UI limpia la carga al soltar); el versículo de origen no emite `paint`.

- 2026-11-22 O1: flaky e2e `studio.spec.ts:56` arreglado (expect.poll sobre solape del encuadre; 5/5 verde). T5 tocó `app.html` (`note.greek`→`note.original`) sin cambio visible; clave de `importFile` sigue `greek` hasta O3 T5.

- 2026-11-22 O2 T1: lógica pura en `particles-engine.ts` (tests node no parsean decoradores); `particles.ts` reexporta. `burst`/`ambient` no hacen nada antes del primer render. Montar `<v-particles>` en `.preview-frame` en O3 T3; revisar visualmente entonces.

- 2026-11-22 O2 T2: `v-lumen` listo (aún sin montar). Para O4 T2: pasar de `flood` a `off` cuando la página empiece a aparecer (en día `flood` deja la luz casi blanca). `dim` oscila a ≈50 %; para cierre quieto en O5 es una línea.

- 2026-11-22 O3 T1: gestos listos en `reader.ts`. e2e `studio.spec.ts:2` y `captures.spec.ts:2` rotas a propósito (T4 las reescribe). Para T3: `burst.rect` viene en coords de viewport (restar origen de `.preview-frame`); app.ts tiene `chosen`/`toggleSpecial`/`tool` transitorios que T3 reemplaza; se quitó output `missingNote` (sin toast). `touchmove` no pasivo bloquea scroll en lit/painting/special.

- 2026-11-22 O3 T2: marcas listas en `reader.css`; contraste mínimo medido 5.30–7.82 día / 5.45–9.74 noche (≥4.55 en animación); sin reflujo (4740.47 px antes/después). Número de versículo en noche pasó de #b92d40 (2.82:1) a #e17581. Noche simulada con `.night` a mano: revisar en T3/T4 con la app real. Capturas en scratchpad `marks/`.

- 2026-11-22 O3 T3: cintas/panel/elegidos listos (`chosen.ts` puro). Desvíos: área táctil de cintas 37–40×59–65 px (plan: 44) para separación de 8 px; contador usa icono `star`; botón «Scroll» eliminado (lo sustituye play); `.dark-scene` ahora fija `color:var(--ink)`. Pendiente: botón sliders de la barra del panel repite el icono de la cinta (valorar en O6 T2 audit); textos de ayuda con Trazo → O6 T3; glifo «א» con fuente de respaldo hasta T5.

- 2026-11-22 O3 T5: fuente `@fontsource-variable/noto-serif-hebrew` (eje de peso) copiada y paquete retirado. Input del lector sigue llamándose `greek` (`[greek]="originalOn()"`): renombrar si se toca. Aviso demo «Santiago es contenido de ejemplo» sale también con Biblia sintética (revisar en O6 T2).

- 2026-11-22 O4 T1: ajustes de portada listos. Para T2: sustituir el marcador estático `.intro-preview` de `.preview-frame` por `<v-title-card>` y enganchar la fase `intro` en `toggleIntroPreview()` (señal `introPreview`, dura `intro.duration`). Revisión de noche del grupo «La portada» pendiente (O6 T2).

- 2026-11-22 O4 T2: secuencia lista (`intro.ts` línea de tiempo pura, `title-card.ts` con modo `compact` para O5, `v-lumen`+polvo en `.intro-stage`). Los helpers e2e sin `quiet` entran con portada D=5 s: para T3 fijar `intro.duration`=3 vía `verbo.settings` y cuenta atrás desactivada. El ejecutor pudo matar con `pkill` un `ng serve` ajeno (puerto 4201; hoy hay uno activo): avisar al usuario. Flaky del poll de encuadre endurecido (null-safe, 3/3 verde).

- 2026-11-22 O5 T1: `v-ending` + `ending-fit.ts` listos; `lumen` fase `dim` ahora quieta. Para T2: acciones siguen abajo (`.ending-actions`, relleno inferior 88 px en `v-ending`); cinta de ajustes visible en cierre (correcto); `v-particles` z-index 36 en `.is-finished`. Cabecera del cierre usa `settings.intro.title` aunque la portada esté desactivada.

- 2026-11-22 O5 T2: flujo `ending→fading→black` listo (FADE_MS 6000, guarda 600 ms; teclado Escape/Enter/Espacio añadido). RIESGO a revisar en O6 T2: la regla global reduced-motion `animation/transition:none!important` puede anular el fundido de opacidad final de la portada (`.intro-cover`); el velo ya tiene excepción. La cinta sigue visible (inert) bajo el velo durante el fundido.

- 2026-11-22 O5 T3: riesgo de O5 T2 CONFIRMADO y arreglado (prueba mostró corte seco de `.intro-cover` bajo reduced motion; ahora `transition:opacity .9s linear!important`).

- 2026-11-22 O6 T1: página con grano SVG estático, viñeta, numeral 92/118 px y entrada de capítulo. Contraste lectura 8,2–10,6:1 peor píxel; autoscroll 0 frames >20 ms. Para T3 (DESIGN.md): `--page-muted` día #675d52, `--head-red` (día #922235, noche #f2a0a9), numeral, grano/viñeta, barrido y entrada del numeral como excepción de movimiento. Capturas antes/después en scratchpad `o6t1/`.

- 2026-11-22 O6 T2: auditoría hecha, `finish-review.md` veredicto ship. Abierto (aceptado): cintas 37×59 móvil / 40×65 escritorio (>24 px WCAG AA, <44); `side-tab` del detector en `.verse-lit::before` (contrato); capturas de portada/cierre solo en reduced motion. Textos de ayuda con Trazo → T3.
