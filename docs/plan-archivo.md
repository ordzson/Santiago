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

## H2 (cerrado 2026-11-24, 84c44a0): — Notas del original para RVR1960 (piloto Santiago + Rut 1)

Estado: aprobado
Base: 307fb0b56ead98c602dbb830700f55bdd93582a3

**Objetivo:** un pipeline offline (Python 3, solo biblioteca estándar) en `estudio/herramientas/original/` genera borradores de notas del griego/hebreo asociadas a palabras de la RVR1960, con el contrato de `griego.json`/`hebreo.json`, listos para revisión manual. Puente: RV1909 alineada a mano (Clear Bible) → RVR1960 por comparación de versículos. Léxico español propio y reutilizable traducido de STEPBible.

**Fuera de alcance:** NBLA; libros distintos de Santiago y Rut 1; escribir `context`; fusionar los borradores con `griego.json` (las 286 notas NBLA no se tocan); carga automática de los borradores en la app (se cargan desde «Contenido»); aplicar TVTMS (ver Notas); E2E nuevos.

**Criterio de terminado:**
- `griego.rvr1960.borrador.json` (Santiago) y `hebreo.rvr1960.borrador.json` (Rut 1) pasan `parseOriginal` de la app (`pnpm --dir estudio test`).
- `node --experimental-strip-types estudio/herramientas/original/validar-app.ts …` (T19) → «0 faltan»: 100 % de los `word` se encuentran en su versículo según `tokenize` de la app.
- `estudio/herramientas/original/reportes/JAS.medicion.md`: precisión ≥ 95 % en confianza `alta` contra la muestra de oro; incluye % de tokens alineados.
- Existen `reportes/JAS.revisar.md` y `reportes/RUT-1.revisar.md`, legibles.
- `node scripts/verify.mjs full` pasa.

### Contratos (comunes a todas las tareas)

Todas las rutas, relativas a la raíz del repo. `HO` = `estudio/herramientas/original/`.

- **Ejecución:** siempre `python3 -I <script>` (aislado: no importa nada del directorio actual). Cada script ejecutable empieza con `sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))` para importar sus módulos hermanos. Solo biblioteca estándar (`json`, `csv`, `difflib`, `unicodedata`, `re`, `urllib`, `hashlib`, `argparse`, `unittest`). Nada de spaCy ni dependencias pip.
- **Caché:** `HO/.cache/` (ignorada por git). `HO/.cache/fuentes/<ruta del repo de origen>` = descargas crudas; `HO/.cache/salida/` = intermedios; `HO/.cache/lotes/` = lotes de traducción. Nunca se commitea nada de `.cache/` ni `estudio/public/data/*_vid_*.json`.
- **Regla de costo:** ningún modelo abre archivos de `.cache/fuentes/` enteros ni `RVR1960_vid_149.json` entero. Solo `head`, `grep` de un versículo o `sed -n` de pocas líneas para ver el formato. El trabajo sobre datos lo hace el código.
- **Pruebas:** `HO/tests/test_*.py` (unittest) con fixtures pequeñas en `HO/tests/fixtures/` (≤ 30 líneas cada una, copiadas de las fuentes; RVR1960: ≤ 3 versículos). Runner: `python3 -I estudio/herramientas/original/pruebas.py`.
- **Libros:** `HO/libros.py` define `LIBROS` = los 66 códigos USFM en orden canónico (`GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV`); `numero(usfm)` → 1–66 (`JAS`=59, `RUT`=8); `step(usfm)` → abreviatura STEPBible (`JAS`→`Jas`, `1SA`→`1Sa`, `SNG`→`Sng`: primer carácter alfabético en mayúscula, resto en minúscula); `id_app(nombre)` → slug del nombre español de la RVR1960 (NFD, sin diacríticos, minúsculas, espacios→`-`: `Santiago`→`santiago`, `1 Corintios`→`1-corintios`).
- **Ids de Clear:** fuente NT `n` + `BBCCCVVVWWW` (11 dígitos); fuente AT `o` + `BBCCCVVVWWWS` (12 dígitos; `S` = segmento morfológico); destino RV09 `BBCCCVVVWWW` (versificación **española**; la columna `source_verse` trae la del original).
- **Strong:** `strong_base(s, lengua)` → letra + número sin ceros ni sufijo (`G0976`→`G976`, `G2385I`→`G2385`, WLCM `0871a`→`H871`); `strong_canon(s)` → sin ceros pero con sufijo (`G2385I`→`G2385I`). Ambos en `libros.py`. El léxico se indexa por `strong_canon` del dStrong de STEPBible; si un token no se enlazó, por `strong_base`.
- **Referencias:** `"JAS.1.2"` (USFM.cap.vers, versificación española).
- **Texto RVR1960:** el de `HO/rvr1960.py` (`texto_versiculo`). Es exactamente el que se exporta a la Biblia de la app, así que lo que el pipeline valida es lo que la app muestra.
- **Borrador (salida):** `estudio/public/data/griego.rvr1960.borrador.json` y `estudio/public/data/hebreo.rvr1960.borrador.json` (se commitean). Forma: `{"generado": "<fecha ISO>", "creditos": "<texto de T22>", "notes": [...]}`. Cada nota:
  ```json
  {"book": "santiago", "chapter": 1, "verse": 2, "word": "gozo", "original": "χαρά", "transliteration": "chara", "meaning": "gozo", "context": "",
   "strong": "G5479", "lemma": "χαρά", "morph": "N-ASF", "confidence": "alta", "source": "RV09 manual → RVR1960 (igual)"}
  ```
  La app tolera campos extra (`parseOriginal` conserva `...rest`; `OriginalNote` no los usa): **no hace falta paso de publicar**. Volver a generar un libro reemplaza solo las notas de ese libro (y capítulo, si se pidió uno).
- **Cómo se prueba en la app:** «Contenido» → cargar Biblia `HO/.cache/salida/rvr1960.biblia.json` (limpia notas) → «Cargar notas del griego/hebreo» con el borrador.

### Oleadas

- [x] O1 — Base: verificación, descarga, lectores y muestra de oro
  - Verificación: quick
  - Commit: `feat(herramientas): base del pipeline del original y muestra de oro de Santiago`
  - [x] T1 — Verificación del repo · Modelo: haiku, esfuerzo xhigh
    - Leer: `~/.claude/skills/preparar-proyecto/SKILL.md`, `~/.claude/skills/preparar-proyecto/verify.mjs` (bloques `STEPS`/`MODES`), `estudio/package.json`, `.gitignore`.
    - Archivos: `scripts/verify.mjs`, `CLAUDE.md`, `.gitignore`, `estudio/herramientas/original/pruebas.py`.
    - Hacer: copiar `verify.mjs` a `scripts/verify.mjs` y dejar `STEPS` = `test`: `pnpm --dir estudio test`; `pipeline`: `python3 -I estudio/herramientas/original/pruebas.py`; `build`: `pnpm --dir estudio build`. `MODES`: `quick` = test, pipeline; `full` = test, pipeline, build. `pruebas.py`: inserta su directorio en `sys.path`, `unittest.TestLoader().discover(start_dir=<dir>/tests, top_level_dir=<dir>)`, sale 1 si falla, 0 si pasa o no hay pruebas. `.gitignore` (raíz): añadir `.verify/`, `estudio/herramientas/original/.cache/`, `estudio/public/data/*_vid_*.json`. `CLAUDE.md` (raíz, nuevo, ≤ 15 líneas): stack (Angular 21 + pipeline Python stdlib), comandos de `quick`/`full`, la regla de costo de §Contratos.
    - Hecho cuando: `node scripts/verify.mjs quick` → test y pipeline OK; `git status --short` ya no lista `estudio/public/data/*_vid_*.json`.
  - [x] T2 — Descarga de fuentes a la caché · Modelo: haiku, esfuerzo xhigh
    - Leer: §Contratos.
    - Archivos: `HO/fuentes.json`, `HO/descargar.py`, `HO/tests/test_descargar.py`.
    - Hacer: `fuentes.json` = lista `{repo, rama, ruta}`. Clear-Bible/Alignments (`main`): `data/sources/SBLGNT.tsv`, `data/sources/WLCM.tsv`, `data/spa/targets/RV09/nt_RV09.tsv`, `data/spa/targets/RV09/ot_RV09.tsv`, `data/spa/alignments/RV09/SBLGNT-RV09-manual.json`, `…/SBLGNT-RV09-manual.toml`, `…/WLCM-RV09-manual.json`, `…/WLCM-RV09-manual.toml`. STEPBible/STEPBible-Data (`master`): `Translators Amalgamated OT+NT/TAGNT Mat-Jhn - Translators Amalgamated Greek NT - STEPBible.org CC-BY.txt`, `…/TAGNT Act-Rev - Translators Amalgamated Greek NT - STEPBible.org CC-BY.txt`, los 4 `TAHOT` (`Gen-Deu`, `Jos-Est`, `Job-Sng`, `Isa-Mal`, sufijo ` - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt`), `Lexicons/TBESG - Translators Brief lexicon of Extended Strongs for Greek - STEPBible.org CC BY.txt`, `Lexicons/TBESH - Translators Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY.txt`, `Morphology codes/TEGMC - Translators Expansion of Greek Morphhology Codes - STEPBible.org CC BY.txt`, `Morphology codes/TEHMC - Translators Expansion of Hebrew Morphology Codes - STEPBible.org CC BY.txt`, `Versification/TVTMS - Translators Versification Traditions with Methodology for Standardisation for Eng+Heb+Lat+Grk+Others - STEPBible.org CC BY.txt` (19 archivos; NO TTESV). URL = `https://raw.githubusercontent.com/<repo>/<rama>/<ruta con urllib.parse.quote>`. Destino `HO/.cache/fuentes/<repo>/<ruta>`; si existe, imprime «ya está» y no baja. User-Agent genérico `verbo-herramientas/0.1` (sin correo). Escribe `HO/.cache/fuentes/manifiesto.json` con tamaño y sha256. Prueba: `url_de()` codifica espacios y `+` (`OT+NT` → `OT%2BNT`).
    - Hecho cuando: `python3 -I estudio/herramientas/original/descargar.py` termina con 19 archivos en el manifiesto; al repetirlo imprime 19 «ya está»; pruebas OK.
  - [x] T3 — Libros y lectores de Clear · Modelo: haiku, esfuerzo xhigh
    - Leer: §Contratos; ver formato con `head -3` de cada TSV y `head -c 600` de los JSON en caché.
    - Archivos: `HO/libros.py`, `HO/fuentes.py`, `HO/tests/test_fuentes.py`, `HO/tests/fixtures/` (recortes).
    - Formato de entrada (real):
      ```
      SBLGNT.tsv:  id  altId  text  strongs  gloss  gloss2  lemma  pos  morph
                   n40001001002	γενέσεως-1	γενέσεως	G1078	of [the] genealogy	genealogy	γένεσις	noun	N-GSF
      WLCM.tsv:    id  altId  text  strongs  gloss  gloss2  pos  morph
                   o010010010012	רֵאשִׁ֖ית-1	רֵאשִׁית	7225	beginning		noun
      nt_RV09.tsv: id  source_verse  text  skip_space_after  exclude  id_range_end  source_verse_range_end
                   40001001007	40001001	,		y
      SBLGNT-RV09-manual.json: {"records": [{"source": ["n40001001005"], "target": ["40001001009", "40001001008", "40001001010"], "meta": {"id": "40001001.5", "origin": "manual"}}, …]}
      ```
    - Hacer: `libros.py` según §Contratos (con `strong_base`, `strong_canon`). `fuentes.py`: `leer_fuente(usfm)` → lista de dicts del TSV fuente filtrada por prefijo (`n59…`/`o08…`); `leer_rv09(usfm)` → tokens del TSV destino del libro (con `exclude` booleano); `leer_alineacion(usfm)` → lista `(fuente_ids, destino_ids)` cuyos destinos empiezan por `BB` del libro; `frecuencias(testamento)` → `Counter` por `strong_base` sobre todo el TSV fuente. CLI `python3 -I HO/fuentes.py resumen --libro JAS` imprime `fuente N · rv09 N · registros N`.
    - Hecho cuando: pruebas OK (incluye `numero('JAS')==59`, `step('1SA')=='1Sa'`, `id_app('1 Corintios')=='1-corintios'`, `strong_base('0871a','H')=='H871'`); `resumen --libro JAS` imprime `fuente 1739 ·` y los otros dos conteos > 0; `resumen --libro RUT` también > 0.
  - [x] T4 — Lector de la RVR1960 y exportación a la app · Modelo: haiku, esfuerzo xhigh
    - Leer: §Contratos; `estudio/README.md` §«Agregar tu Biblia al repo»; `estudio/src/app/content.ts` (`parseBible`, `tokenize`).
    - Archivos: `HO/rvr1960.py`, `HO/tests/test_rvr1960.py`, `HO/tests/fixtures/rvr1960_mini.json`.
    - Formato de entrada (real, `RVR1960_vid_149.json` → `books[i].chapters[j].items`, se usa `items`; el `html` NO se parsea):
      ```
      {"usfm": "JAS", "human": "Santiago", "chapters": [{"usfm": "JAS.1", "items": [
        {"type": "heading1", "verse_numbers": [], "lines": ["Salutación"]},
        {"type": "verse", "verse_numbers": [1], "lines": ["Santiago, siervo de Dios y del Señor Jesucristo, a las doce tribus que están en la dispersión: Salud."]},
        {"type": "verse", "verse_numbers": [2], "lines": ["Hermanos míos, tened por sumo gozo cuando os halléis en diversas pruebas,"]}]}]}
      ```
    - Hacer: `leer(ruta)` → `{usfm: {"nombre", "capitulos": {cap: {vers: texto}}}}`. Solo `type == "verse"`; los encabezados se excluyen. Un versículo repartido en varios items se concatena en orden. Texto = líneas unidas con un espacio, espacios colapsados, `strip()`. Si `verse_numbers` trae más de un número: texto al primero y aviso impreso. `texto_versiculo(datos, usfm, cap, vers)`. CLI `python3 -I HO/rvr1960.py exportar --libros JAS,RUT --salida HO/.cache/salida/rvr1960.biblia.json` → contrato `parseBible`: `{"version": "RVR1960", "name": "Reina-Valera 1960", "demo": false, "copyright": "Reina-Valera 1960 © Sociedades Bíblicas en América Latina, 1960. Renovado © Sociedades Bíblicas Unidas, 1988.", "books": [{"id": id_app(human), "name": human, "chapters": [{"number", "title"?: primer heading del capítulo, "verses": [{"number", "text"}]}]}]}`. Ruta de entrada por defecto `estudio/public/data/RVR1960_vid_149.json`.
    - Hecho cuando: pruebas OK con la fixture; `exportar --libros JAS,RUT` crea el archivo; un `python3 -c` sobre él da versículos por capítulo de Santiago `[27, 26, 18, 17, 20]`, Rut 1 = 22, y JAS 1:2 empieza por «Hermanos míos, tened por sumo gozo».
  - [x] T5 — Candidatos para la muestra de oro · Modelo: haiku, esfuerzo xhigh
    - Leer: §Contratos; `head -c 1200 estudio/public/data/griego.json` (claves `book, chapter, verse, word, greek|original, transliteration, meaning, context`).
    - Archivos: `HO/oro.py`, `HO/tests/test_oro.py`.
    - Hacer: `python3 -I HO/oro.py candidatos` lee las 286 notas NBLA (`griego.json`), conserva las que tienen el término griego de una sola palabra (sin espacios); busca en SBLGNT del mismo versículo el token cuyo `text` o `lemma`, normalizado (NFD, sin diacríticos, minúsculas), es igual al de la nota. Con match: candidato `{ref, strong: strong_base, lemma, gloss, nbla: word}`. Selección determinista: por capítulo, ordenados por ref, tomar como máximo 12 espaciados uniformemente (≤ 60 en total). Escribe `HO/.cache/salida/oro-candidatos.json` y `HO/.cache/salida/oro-candidatos.txt`, una línea por candidato: `JAS.1.2 · G5479 · χαρά · joy · NBLA «gozo» · RVR1960: Hermanos míos, tened por sumo gozo cuando os halléis en diversas pruebas,`.
    - Hecho cuando: pruebas OK; `wc -l HO/.cache/salida/oro-candidatos.txt` ≤ 60 y ≥ 40, con candidatos de los 5 capítulos.
  - [x] T6 — Muestra de oro de Santiago · Modelo: opus, esfuerzo medium
    - Leer: solo `HO/.cache/salida/oro-candidatos.txt` (≤ 60 líneas). No leer capítulos, ni borradores, ni ejecutar el pipeline (evita sesgo).
    - Archivos: `HO/oro/santiago.json`.
    - Hacer: por cada línea, la palabra o frase **contigua y literal** de la RVR1960 que traduce ese término griego (la más corta que lo exprese; sin artículo inicial salvo que sea parte del sentido). Si la RVR1960 no lo expresa, `null`. Formato: `[{"ref": "JAS.1.2", "strong": "G5479", "word": "gozo"}, …]`.
    - Hecho cuando: `python3 -I HO/oro.py comprobar` (añádelo si falta: cada `word` no nulo aparece en su versículo con la regla de la app) → «N asociaciones · 0 fuera del versículo».
- [x] O2 — Enlace con STEPBible y selección de palabras
  - Verificación: quick
  - Commit: `feat(herramientas): enlace con STEPBible y selección de palabras`
  - [x] T7 — Lectores de STEPBible · Modelo: haiku, esfuerzo xhigh
    - Leer: §Contratos; con `grep -n "^Jas\.1\.1#0[12]"` en TAGNT, `grep -n "^Rut\.1\.1#0[12]"` en TAHOT, `grep -n "^G2316\b"` en TBESG y `grep -m3 -n "^H1961"` en TBESH (más la línea de cabecera de cada uno) ver el formato.
    - Archivos: `HO/stepbible.py`, `HO/tests/test_stepbible.py`, `HO/tests/fixtures/` (recortes).
    - Formato de entrada (real, tabulado):
      ```
      TAGNT: Jas.1.1#04=NKO	κυρίου (kuriou)	of [the] Lord	G2962G=N-GSM-T	κύριος=lord	NA28+NA27+Tyn+SBL+WH+Treg+TR+Byz			de Señor	…
             (col0 ref#n=tipo · col1 forma (translit.) · col3 dStrong=morf · col4 lema=glosa · col5 ediciones · col8 traducción española)
      TAHOT: Rut.1.1#02=L	בִּ/ימֵי֙	bi./Mei	in/ [the] days of	H9003/{H3117G}	HR/Ncmpc	…
             (col0 ref puede ser «Psa.3.1(3.2)#01=L»: entre paréntesis, la ref. hebrea · segmentos separados por «/» · {…} = raíz)
      TBESG: G2316	G2316 =	G2316	θεός	theos	G:N-M/F	God	 <b>θεός</b>, -οῦ, ὁ … (eStrong · dStrong · uStrong · lema · translit · morf · glosa · definición HTML)
      ```
    - Hacer: `leer_tagnt(usfm)` → filas del libro `{ref_es, ref_orig, n, forma, translit, dstrong, morf, lema, glosa, ediciones, es}` (regex de ref `^([1-3]?[A-Z][a-z]{2})\.(\d+)\.(\d+)(?:\((\d+)\.(\d+)\))?#(\d+)=`; ignorar líneas que no casan). `leer_tahot(usfm)` → igual con `segmentos: [{dstrong, morf, hebreo, translit}]` (quitar `{}`). `leer_lexico('G'|'H')` → `{strong_canon(dStrong): {lema, translit, gloss_en, short_en}}`; `short_en` = definición sin `<ref…>…</ref>`, sin etiquetas, espacios colapsados, cortada a ≤ 200 caracteres en límite de palabra. Si TBESH tiene otra columna de cabecera, adáptalo y anótalo en el reporte. CLI `resumen --libro JAS|RUT`.
    - Hecho cuando: pruebas OK (`κυρίου` → dstrong `G2962G`, morf `N-GSM-T`, es `de Señor`; `Rut.1.1#02` → 2 segmentos, raíz `H3117G`; `leer_lexico('G')['G2316']['translit']=='theos'`); `resumen --libro JAS` imprime filas TAGNT con «SBL» > 1700.
  - [x] T8 — Enlace SBLGNT ↔ TAGNT · Modelo: sonnet, esfuerzo medium
    - Leer: §Contratos; `HO/fuentes.py`, `HO/stepbible.py`.
    - Archivos: `HO/enlace.py`, `HO/tests/test_enlace.py`, fixtures de Jas 1:1 (SBLGNT + TAGNT, extraídas por `grep`).
    - Hacer: `enlazar_nt(usfm)` → `({sblgnt_id: {dstrong, morf_step, translit_forma, es_step, ref_tagnt}}, no_enlazados)`. Por versículo, solo filas TAGNT cuyas ediciones contienen `SBL`. Clave = `(strong_base, forma normalizada)` (NFD, sin diacríticos, minúsculas, sin puntuación). `difflib.SequenceMatcher(autojunk=False)` sobre las claves; en bloques `replace` del mismo largo, enlazar 1:1 si coincide `strong_base` aunque cambie la forma; el resto, a `no_enlazados` con motivo (`variante`, `sin_par`). Nunca inventar un enlace. CLI `python3 -I HO/enlace.py nt --libro JAS` escribe `HO/.cache/salida/JAS.enlace.json` y `JAS.enlace.txt` (no enlazados legibles: ref, forma, strong, motivo).
    - Hecho cuando: pruebas OK; en Santiago ≥ 99 % de los 1739 tokens enlazados y los no enlazados listados en el `.txt`.
  - [x] T9 — Enlace WLCM ↔ TAHOT · Modelo: haiku, esfuerzo xhigh
    - Leer: §Contratos; `HO/fuentes.py`, `HO/stepbible.py`, `HO/enlace.py`.
    - Archivos: `HO/enlace.py` (añadir `enlazar_at`), `HO/tests/test_enlace_at.py`, fixture de Rut 1:1.
    - Hacer: id WLCM `oBBCCCVVVWWWS` → versículo hebreo `CCC.VVV`, palabra `WWW`, segmento `S`. Fila TAHOT de la misma ref **hebrea** (la de paréntesis si existe) y `#n == WWW`. Para cada segmento WLCM cuyo `strong_base` no sea prefijo (`H9xxx` en TAHOT) ni su `pos` esté en `conjunction, particle, preposition, pronoun, suffix`: buscar en los segmentos de esa fila TAHOT el único con igual `strong_base`; si no hay en esa palabra, probar las palabras `WWW±1`, `WWW±2`. Uno solo → enlace; cero o varios → `no_enlazados`. CLI `enlace.py at --libro RUT --capitulo 1` → `HO/.cache/salida/RUT-1.enlace.json`/`.txt`.
    - Hecho cuando: pruebas OK; en Rut 1 ≥ 98 % de los segmentos de contenido enlazados.
  - [x] T10 — Selección de palabras con nota · Modelo: haiku, esfuerzo xhigh
    - Leer: §Contratos; `HO/fuentes.py`, `HO/enlace.py` (solo firmas).
    - Archivos: `HO/config.json`, `HO/seleccion.py`, `HO/tests/test_seleccion.py`.
    - Hacer: `config.json` exactamente:
      ```json
      {"original": "lema",
       "nt": {"excluir_pos": ["det", "conj", "prep", "pron", "ptcl"], "umbral_frecuencia": 1000},
       "at": {"excluir_pos": ["conjunction", "particle", "preposition", "pronoun", "suffix"], "excluir_prefijo_strong": ["H9"], "umbral_frecuencia": 2000},
       "siempre": [], "excluir": ["G1510", "G3004", "H1961", "H559"],
       "max_por_versiculo": 3,
       "reglas_alta": ["igual"],
       "vacias_es": ["el","la","los","las","lo","un","una","unos","unas","de","del","al","a","en","y","e","o","u","que","se","por","para","con","su","sus","mi","mis","tu","tus","nos","os","le","les","me","te"]}
      ```
      Conjunto `siempre` efectivo = `config.siempre` ∪ claves de `HO/glosario.json` si existe (lo crea T11). `seleccionar(usfm, capitulo=None)`: tokens fuente con pos no excluido, `strong_base` no excluido, frecuencia (`fuentes.frecuencias`) ≤ umbral salvo que esté en `siempre`. Por versículo, máximo `max_por_versiculo`, priorizando `siempre` > menor frecuencia > posición. Cada ítem: `{id, ref_orig, strong (dstrong del enlace o strong_base), strong_base, lemma, forma, morph, pos, frecuencia}`. CLI `seleccion.py --libro JAS` / `--libro RUT --capitulo 1` → `HO/.cache/salida/<JAS|RUT-1>.seleccion.json` y última línea `tokens N · lemas M`.
    - Hecho cuando: pruebas OK (pos excluidos ausentes, tope por versículo respetado, `siempre` entra aunque supere el umbral); ambos CLI imprimen conteos > 0.
- [x] O3 — Léxico en español
  - Verificación: quick
  - Commit: `feat(herramientas): léxico español del original (Santiago, Rut 1)`
  - [x] T11 — Léxico: lotes, validación y glosario · Modelo: haiku, esfuerzo xhigh
    - Leer: §Contratos; `HO/stepbible.py`, `HO/seleccion.py` (firmas).
    - Archivos: `HO/lexico.py`, `HO/glosario.json`, `HO/instrucciones-traduccion.md`, `HO/tests/test_lexico.py`.
    - `glosario.json` (`strong_base` → término fijo): `G4102 fe · G4100 creer · G1343 justicia · G1344 justificar · G1342 justo · G5485 gracia · G3551 ley · G266 pecado · G264 pecar · G4982 salvar · G4991 salvación · G4151 espíritu · G4561 carne · G2889 mundo · G1401 siervo · G2962 Señor · G2316 Dios · G26 amor · G25 amar · G1577 iglesia · G3986 prueba · G3985 tentar · G5590 alma · G2041 obra · G80 hermano · G4678 sabiduría · G3340 arrepentirse · G932 reino · G1391 gloria · G40 santo · G1680 esperanza · G1656 misericordia · G2222 vida · G2288 muerte · G3056 palabra · G3709 ira · G5281 paciencia · G5046 perfecto · G1242 pacto · H2617 misericordia · H1350 redimir · H3068 Jehová · H430 Dios · H7706 Todopoderoso · H1285 pacto · H8451 ley · H6666 justicia · H2403 pecado · H7307 espíritu · H5315 alma · H7965 paz · H1288 bendecir · H2580 gracia · H3467 salvar · H5650 siervo · H136 Señor`.
    - `instrucciones-traduccion.md` (fijo, se reutiliza en cada lote): entrada = arreglo JSON `{strong, lemma, gloss_en, short_en, es_rv09, glosario}`; salida = **solo** un arreglo JSON, mismo orden, claves `{strong, gloss, short}`. Español neutro latinoamericano, registro de estudio bíblico (no académico). `gloss`: 1–3 palabras. `short`: ≤ 20 palabras, una frase. Preferir el término de la RVR1960 cuando exista (`es_rv09` es la palabra que usa la RV1909 en ese libro; úsala como pista). Si `glosario` no es nulo, `gloss` empieza con ese término. Nombres propios: la forma española de la RVR1960. No explicar, no comentar, no añadir campos.
    - `lexico.py`: `preparar --libro JAS [--capitulo N]` → llama a `seleccion.seleccionar` (no al archivo en caché) y toma los dStrongs únicos de la selección que faltan en `HO/lexico-es.json`, en lotes de 50 `HO/.cache/lotes/<JAS|RUT-1>-NNN.json`; `es_rv09` = palabra RV09 (no excluida, minúsculas) más frecuente alineada a ese strong en el libro; `glosario` = término o `null`. `incorporar <lote.respuesta.json>` valida contra su lote (mismas claves y orden, sin vacíos, `gloss` ≤ 3 palabras, `short` ≤ 20 palabras, término de glosario presente) y fusiona en `lexico-es.json` (`{strong: {lemma, translit, gloss, short, review, fuente}}`, claves ordenadas). `review: true` si el strong está en el glosario o `gloss_en`/`short_en` contiene alguna de: god, lord, holy, sin, faith, believe, righteous, grace, mercy, law, spirit, soul, flesh, save, salvation, redeem, covenant, glory, kingdom, church, repent, forgive, sacrifice, temple, priest, worship, bless, curse, judge. Nunca sobrescribe una entrada existente. `estado --libro JAS [--capitulo N]` → `pendientes N`.
    - Hecho cuando: pruebas OK (respuesta con clave de más, vacía o `short` de 21 palabras → rechazada con mensaje); `preparar --libro JAS` imprime los lotes creados.
  - [x] T12 — Traducir Santiago, lotes 001–004 (ajustado: solo hay 4) · Modelo: haiku, esfuerzo xhigh
    - Leer: `HO/instrucciones-traduccion.md` (una vez) y cada lote `HO/.cache/lotes/JAS-00{1..4}.json`.
    - Archivos: `HO/.cache/lotes/JAS-00N.respuesta.json`, `HO/lexico-es.json` (vía `incorporar`).
    - Hacer: por lote, escribir la respuesta siguiendo las instrucciones y correr `python3 -I HO/lexico.py incorporar HO/.cache/lotes/JAS-00N.respuesta.json`. Si la validación rechaza, corregir solo lo señalado (máx. 2 veces por lote). No leer otros archivos.
    - Hecho cuando: los 4 lotes incorporados sin error y `lexico.py estado --libro JAS` → `pendientes 0`.
  - [x] T13 (sin lotes: JAS solo tiene 4, cubiertos por T12) — Traducir Santiago, lotes 006 en adelante · Modelo: haiku, esfuerzo xhigh
    - Igual que T12 con los lotes restantes de `JAS`. Si hay más de 6, hacer 6 y reportar `parcial`.
    - Hecho cuando: `python3 -I HO/lexico.py estado --libro JAS` → `pendientes 0`.
  - [x] T14 — Traducir Rut 1 · Modelo: haiku, esfuerzo xhigh
    - Igual que T12: primero `lexico.py preparar --libro RUT --capitulo 1`, luego sus lotes.
    - Hecho cuando: `lexico.py estado --libro RUT --capitulo 1` → `pendientes 0`.
  - [x] T15 — Lista de revisión teológica · Modelo: haiku, esfuerzo xhigh
    - Leer: `HO/lexico.py`, `HO/rvr1960.py` (firmas).
    - Archivos: `HO/lexico.py` (subcomandos `revision`, `aplicar-revision`), `HO/tests/test_lexico.py`.
    - Hacer: `revision --libro JAS [--capitulo N] --max 40` → entradas `review: true` del libro, priorizando glosario > mayor frecuencia en el libro; escribe `HO/.cache/salida/<JAS|RUT-1>.revision.txt`, una línea: `G4102 · πίστις · fe · <short> · JAS.1.3: sabiendo que la prueba de vuestra fe produce paciencia.` (versículo RVR1960 de la primera aparición, ≤ 160 caracteres). Las que pasen del tope van a `HO/reportes/<JAS|RUT-1>.revision-pendiente.md` (para el usuario). `aplicar-revision <respuesta.json>` (`{strong: {gloss, short}}`) valida longitudes, actualiza y marca `review: false, revisado: "opus"`.
    - Hecho cuando: pruebas OK; los dos `.revision.txt` existen con ≤ 40 líneas cada uno.
  - [x] T16 — Revisión teológica del léxico · Modelo: opus, esfuerzo medium
    - Leer: solo `HO/.cache/salida/JAS.revision.txt` y `HO/.cache/salida/RUT-1.revision.txt` (≤ 40 líneas cada uno) y `HO/instrucciones-traduccion.md`.
    - Archivos: `HO/.cache/salida/<JAS|RUT-1>.revision.respuesta.json`, `HO/lexico-es.json` (vía `aplicar-revision`).
    - Hacer: corregir `gloss`/`short` donde la traducción sea imprecisa teológicamente o no use el término de la RVR1960; devolver todas las líneas (las correctas, sin cambios).
    - Hecho cuando: `aplicar-revision` de ambos sin error; `grep -c '"review": true' HO/lexico-es.json` baja en el número de líneas revisadas.
- [x] O4 — Transferencia RV1909 → RVR1960 y borradores
  - Verificación: quick
  - Commit: `feat(herramientas): transferencia a RVR1960 y borradores de Santiago y Rut 1`
  - [x] T17 — Algoritmo de transferencia · Modelo: sonnet, esfuerzo medium
    - Leer: §Contratos; `HO/fuentes.py`, `HO/rvr1960.py`, `HO/config.json`; `estudio/src/app/content.ts` (`tokenize`); muestra: RV09 y RVR1960 de JAS 1:4 y 1:5 (vía `grep`/`texto_versiculo`).
    - Archivos: `HO/transferir.py`, `HO/equivalencias.json`, `HO/tests/test_transferir.py`.
    - Hacer: `encontrar_app(texto, word)` = port exacto de la búsqueda de `tokenize` (minúsculas `es`, `indexOf`, sin letra `\p{L}` a ambos lados) → lista de posiciones. `transferir(tokens_rv09_versiculo, texto_rvr, destinos_por_fuente, pistas_es)` → por id fuente `{word, confidence, regla}` o `{regla}` si falla. Tokens RVR1960 = `[^\W\d_]+` con posiciones; RV09 = tokens no excluidos. Clave = NFD sin diacríticos, minúsculas, mapeada por `equivalencias.json` (grupos de formas equivalentes; inicial: `[["mas","pero","empero"],["crio","creo"],["aqueste","este"],["aquesta","esta"],["do","donde"],["cuasi","casi"],["agora","ahora"],["mesmo","mismo"],["ansi","asi"],["obscuridad","oscuridad"],["entonce","entonces"]]`). `SequenceMatcher(autojunk=False)`: bloque `equal` → regla `igual`; `replace` n:n con clave equivalente → `equivalencia`; `replace` 1:1 cuyo token RVR1960 comparte los 4 primeros caracteres de la clave con la glosa española (`pistas_es`) → `pista`; resto → `sin_par`. Word: índices RVR1960 mapeados, sin `vacias_es` en los bordes; contiguos → `texto[ini:fin]`; no contiguos → el token más largo, regla `no_contiguo`. Si el `word` aparece en otra posición del versículo mapeada a otro strong → `ambiguo`. Si la similitud del versículo completo (`ratio()`) < 0,5 → todo el versículo `versiculo_distinto`. Confianza: regla en `config.reglas_alta` → `alta`; `equivalencia`/`pista` → `media`; resto → `revisar`. Verificar siempre `encontrar_app(texto, word)` no vacío; si vacío, falla `no_literal`. Además `comparar_versificacion(usfm)`: conteo de versículos por capítulo RV09 vs RVR1960; capítulos distintos → sus notas a `revisar` y listados.
    - Hecho cuando: pruebas OK (un caso `igual`, uno `equivalencia` mas→pero, uno `no_contiguo`, uno `ambiguo`, uno `no_literal`); `python3 -I HO/transferir.py medir --libro JAS` imprime conteos por confianza y regla, con ≥ 80 % de tokens seleccionados con `word` (si menos: `parcial` con los 10 fallos más frecuentes).
  - [x] T18 — CLI `generar` y reporte de revisión · Modelo: haiku, esfuerzo xhigh
    - Leer: §Contratos (contrato del borrador); firmas de `HO/seleccion.py`, `HO/enlace.py`, `HO/lexico.py`, `HO/transferir.py`, `HO/rvr1960.py`.
    - Archivos: `HO/generar.py`, `HO/tests/test_generar.py`.
    - Hacer: `python3 -I HO/generar.py --libro JAS [--capitulo N]`: enlace → selección → transferencia → nota con el contrato. `original`/`transliteration`: si `config.original == "lema"`, lema y translit del léxico STEPBible; si `"forma"`, forma y translit de TAGNT/TAHOT. `meaning` = `gloss` de `lexico-es.json`; si faltan strongs, termina con error listándolos («corre lexico.py preparar»). `context: ""`. `source`: `"RV09 manual → RVR1960 (<regla>)"`. Solo entran notas con `word` válido; dos notas con el mismo `word` en un versículo → queda la de mayor prioridad, la otra al reporte como `duplicado`. NT → `griego.rvr1960.borrador.json`, AT → `hebreo.rvr1960.borrador.json`, reemplazando solo el libro/capítulo generado. Reportes: `HO/reportes/<JAS|RUT-1>.revisar.md` (tabla por versículo: ref · versículo RVR1960 · lema · glosa · word propuesto o «—» · regla; incluye fallos y duplicados) y `HO/reportes/<…>.resumen.txt` (conteos por confianza y regla, % tokens alineados).
    - Hecho cuando: pruebas OK; `generar.py --libro JAS` y `generar.py --libro RUT --capitulo 1` crean ambos borradores y reportes.
  - [x] T19 — Validación con el código de la app · Modelo: haiku, esfuerzo xhigh
    - Leer: `estudio/src/app/content.ts`, `estudio/tests/content.test.ts` (estilo de prueba).
    - Archivos: `HO/validar-app.ts`, `estudio/tests/borradores.test.ts`.
    - Hacer: `validar-app.ts <biblia.json> <borrador.json>…` importa `parseBible`, `parseOriginal`, `tokenize` de `../../src/app/content.ts`; idioma por prefijo del nombre (`griego`/`hebreo`); por cada nota busca libro/capítulo/versículo y comprueba que `tokenize(texto, [nota])` marque algún token. Imprime `N notas · N encontradas · K faltan` (y las que faltan); sale 1 si `K > 0`. `borradores.test.ts`: `parseOriginal` acepta los dos borradores commiteados sin lanzar.
    - Hecho cuando: `python3 -I HO/rvr1960.py exportar --libros JAS,RUT --salida HO/.cache/salida/rvr1960.biblia.json && node --experimental-strip-types estudio/herramientas/original/validar-app.ts estudio/herramientas/original/.cache/salida/rvr1960.biblia.json estudio/public/data/griego.rvr1960.borrador.json estudio/public/data/hebreo.rvr1960.borrador.json` → `0 faltan`; `pnpm --dir estudio test` pasa.
- [x] O5 — Medición, créditos y cierre
  - Verificación: full
  - Commit: `feat(herramientas): medición contra oro y créditos de fuentes`
  - [x] T20 — Medición contra la muestra de oro · Modelo: haiku, esfuerzo xhigh
    - Leer: §Contratos; `HO/oro/santiago.json` (formato), firmas de `HO/generar.py`.
    - Archivos: `HO/medir.py`, `HO/tests/test_medir.py`.
    - Hacer: une oro y borrador por `(ref, strong_base)`. Correcta si, comparando tokens en minúsculas, el `word` del borrador ⊆ el de oro o el de oro ⊆ el del borrador; oro `null` con nota → incorrecta. Tabla por confianza y por regla: `n · correctas · precisión`; cobertura (oro con nota / oro no nulo); % de tokens seleccionados con alineación RV09 y % con `word`. Escribe `HO/reportes/JAS.medicion.md`; última línea `alta: n · precisión p %`.
    - Hecho cuando: pruebas OK; `python3 -I HO/medir.py --libro JAS` escribe el reporte.
  - [x] T21 (sin cambios: alta 100 % ≥ 95 %) — Ajuste de reglas si `alta` < 95 % · Modelo: haiku, esfuerzo xhigh
    - Leer: `HO/reportes/JAS.medicion.md`, `HO/config.json`.
    - Archivos: `HO/config.json`, borrador y reportes regenerados.
    - Hacer: si `alta` ≥ 95 %, nada (tarea hecha). Si no: quitar de `reglas_alta` toda regla con precisión < 95 % en la tabla por regla; si `igual` es la culpable, añadir `"alta_requiere_unico": true` y en `transferir.py` exigir que el `word` aparezca una sola vez en el versículo para `alta`. Regenerar JAS, revalidar (T19) y re-medir. Si sigue < 95 % → `bloqueada` (decide el usuario).
    - Hecho cuando: `tail -1 HO/reportes/JAS.medicion.md` → precisión ≥ 95 %; T19 sigue en `0 faltan`.
  - [x] T22 — Créditos, licencias y guía · Modelo: haiku, esfuerzo xhigh
    - Leer: los `.toml` de `HO/.cache/fuentes/Clear-Bible/Alignments/data/spa/alignments/RV09/`, `head -40` de TAGNT y TBESG (sección de licencia), `estudio/README.md` §«Agregar palabras del idioma original», `estudio/src/app/app.html` (diálogo Contenido, solo el bloque de notas).
    - Archivos: `licencias/FUENTES-ORIGINAL.md`, `estudio/README.md`, `estudio/src/app/app.html`, `HO/LEEME.md`.
    - Hacer: `FUENTES-ORIGINAL.md`: alineaciones RV1909 de Clear Bible / BiblioNexus (CC BY 4.0), SBLGNT (SBL y Logos, CC BY 4.0), WLC/UXLC (tanach.us, dominio público), TAGNT/TAHOT/TBESG/TBESH de STEPBible – Tyndale House (CC BY 4.0), RV1909 (dominio público); copiar los avisos exactos de los `.toml`; indicar que el léxico español es obra derivada traducida. App: en el diálogo Contenido, bajo las casillas de notas, una línea `<p class="dialog-intro">` con «Notas generadas con datos de Clear Bible (BiblioNexus), STEPBible (Tyndale House), SBLGNT y UXLC · CC BY 4.0.». README: subsección «Borradores de la RVR1960» (qué son, cómo cargarlos, enlace al LEEME). `LEEME.md`: pasos del pipeline (descargar → seleccion → lexico preparar/incorporar → revision → generar → validar → medir) y la regla de costo.
    - Hecho cuando: `node scripts/verify.mjs full` pasa; `FUENTES-ORIGINAL.md` nombra las 5 fuentes.

### Notas de ejecución

<!-- Una línea por decisión, desvío o bloqueo. Fecha + oleada. -->
- 2026-11-24 O1/T1: `pruebas.py` usa `tests/` como top_level_dir si no hay `tests/__init__.py` (evita ImportError del discover). quick OK (88 tests app).
- 2026-11-24 O1/T3: lectores aceptan `raiz=` (fixtures); `strong_canon(s, lengua=)` (WLCM sin letra); Strong múltiple → primer valor; `leer_alineacion` solo registros con todos los destinos del libro. Conteos agregados con awk/grep (solo cifras).
- 2026-11-24 O1/T4: `rvr1960.leer()` añade `titulos` por libro (para `title` de capítulo). Item sin `verse_numbers` continúa el versículo anterior. Rutas reales: `HO` = `estudio/herramientas/original`.
- 2026-11-24 O1/T5: candidatos descartan tokens sin Strong y duplicados (ref+strong). 135 notas de una palabra → 60 candidatos (12 por capítulo).
- 2026-11-24 O1/T6: oro = 60 entradas (59 con palabra, 1 `null`: JAS.2.20 G692, la RVR1960 sigue la variante «muerta»). Se eligió por orden del texto griego, no por la NBLA (p. ej. 1.4 «cabales»).
- 2026-11-24 O2/T7: TBESH = mismo diseño que TBESG. Léxico indexado por dStrong (col. 2 sin « ="). TAHOT: `dstrong`/`morf` de la fila = segmento con raíz `{}` o el último; `lema`/`ediciones`/`es` vacíos. 2 filas de Jas traen «SBL»1»: contar SBL por nombre base. Normalizar NFD/NFC al comparar griego.
- 2026-11-24 O2/T8: desvío menor de la spec: STEPBible a veces cambia el dStrong (μου G3450 vs G3165). En bloques `replace` se enlaza primero por forma igual y luego 1:1 por `strong_base`. Resultado JAS 1736/1739 (99,8 %); 3 `sin_par` (1.22, 2.3, 5.4). Sigma final = sigma en la clave.
- 2026-11-24 O2/T9: decisión del usuario: segmentos WLCM sin Strong (10 en Rut 1: בֵּית, לֶחֶם de Belén) salen de la base del % de enlace; siguen listados en el .txt. Rut 1: 236/237 (99,6 %); único fallo RUT.1.11#14 (WLCM H376 vs STEPBible H582). Strong con `\` o `+` pegado se toma por el principal. Porcentajes con coma decimal.
- 2026-11-24 O2/T10: JAS 324 tokens · 280 lemas; RUT 1 65 · 45 (`lemas` = strong_base distintos). `glosario.json` (T11) debe ser objeto con claves Strong. `ref_orig` AT sale del id WLCM (hebrea; coincide en Rut 1, mapear en Salmos). Tokens sin Strong no entran.
- 2026-11-24 O3/T11: JAS = 4 lotes (50,50,50,48; 198 pendientes) porque el glosario (`siempre`) concentra 143 de 324 tokens. T12 → lotes 001–004; T13 no aplica. `preparar` no rehace lotes existentes (borrar `.cache/lotes/`). `fuente` = «lote JAS-001»; translit del léxico STEPBible al incorporar. RUT 1: 43 pendientes (1 sin glosa inglesa ni lema en TBESH: T14 la traduce desde el contexto o la deja revisar). `.cache/salida/JAS.seleccion.json` queda viejo; se regenera en `generar`.
- 2026-11-24 O3/T12: `lexico-es.json` JAS = 198 entradas, 43 `review: true`. Glosas repetidas con strongs distintos (prueba, engañar, resistir, afligirse): aceptable, T15/T16 lo ven.
- 2026-11-24 O3/T14: RUT 1 = 1 lote (43 strongs), 9 `review`. H430J sin entrada en TBESH: gloss «Dios», lema vacío, `review: true` (generar debe tolerar lema vacío). Pistas `es_rv09` ruidosas (H1481A «á», H2204 «yo», H6912 «seré»): ignoradas; pendiente mejorar `preparar` (filtrar `es_rv09` por `vacias_es` y longitud) si se repite en otros libros.
- 2026-11-24 O3/T15: listas JAS 40 líneas (+3 pendientes para el usuario en `reportes/JAS.revision-pendiente.md`: G3550 νομοθέτης, G2746 καύχησις, G3649 ὀλολύζω), RUT-1 9 líneas. `aplicar-revision` rechaza entradas ya con `review: false` (no reejecutable sobre lo aplicado).
- 2026-11-24 O3/T16: Opus revisó 49 líneas, cambió 11 (JAS 8, RUT 3); `review: true` 52 → 3 (solo los pendientes humanos). H430J quedó «Dios, dioses» (RVR1960 Rut 1:15 «sus dioses»); el usuario puede preferir solo «Dios».
- 2026-11-24 O4/T17: `transferir_libro(usfm, items, enlaces, datos_rvr)` → por id fuente `{word, confidence, regla, ref}` o `{regla, ref}`. JAS: 324 tokens, 267 con word (82,4 %); reglas igual 261, pista 3, ambiguo 3, sin_par 57; versificación sin diferencias. `ambiguo` conserva word con confianza `revisar`. Contiguo = índices consecutivos y solo espacios (una coma → `no_contiguo`). `medir` solo cubre NT (`enlazar_nt`): T18 debe cubrir Rut/AT (`enlazar_at`).
- 2026-11-24 O4/T18: JAS 255 notas (12 duplicados quitados; alta 251, media 3, revisar 1); RUT 1 48 notas (1 duplicado). `strong` canónico (H430J). H430J sin lema: original = forma hebrea. En AT la pista usa la glosa del léxico (no hay es_step). `creditos` provisional (T22). Duplicados: gana confianza, luego regla, luego orden. `.cache/salida/*.seleccion.json` viejos (generar no los regenera).
- 2026-11-24 O4/T19: `validar-app.ts` → 303 notas · 303 encontradas · 0 faltan (control negativo da exit 1). `pnpm --dir estudio test` 90 pass (incluye `borradores.test.ts`).
- 2026-11-24 O5/T20: medición JAS: `alta: 22 · precisión 100,0 %`. Cautelas: muestra pequeña (n=22); solo 22 de 59 palabras del oro tienen nota (cobertura baja: la selección topa 3 por versículo y el glosario ocupa 143 de 324 tokens); JAS.1.13 tiene dos notas con la misma clave («tienta» no evaluada; si cuenta como incorrecta, 22/23 = 95,7 %); la regla de contención acepta «anillo» por «anillo de oro». T21 no aplica.
- 2026-11-24 O5/T22: `creditos` y `app.html` añaden «(UXLC: uso libre con cita)»: WLCM.toml da licencia «Custom» (sin restricciones, con cita), no CC BY ni dominio público; FUENTES-ORIGINAL.md lo dice así. La licencia del texto RVR1960 mostrado no está en FUENTES (la aporta la Biblia cargada): pendiente de decidir. `full` OK.
- 2026-11-24 plan: el TSV de RV09 trae `source_verse`: Clear ya resuelve original↔versificación española (p. ej. Sal 3:1 RV09 = 3:2 hebreo). Solo falta RV09↔RVR1960 (misma tradición): se comparan conteos (T17). TVTMS se descarga, pero se aplica en el hito que trate un libro con diferencias.
- 2026-11-24 plan: `SBLGNT.tsv` de Clear ya trae strong, lema, morfología y glosa. El enlace con TAGNT aporta el dStrong (clave del léxico), la transliteración y la columna «Spanish translation», que sirve de pista. Un token no enlazado sigue con los datos SBLGNT.
- 2026-11-24 plan: `RVR1960_vid_149.json` trae `items` con líneas ya limpias (sin encabezados ni notas `#`). Se usa eso en lugar del HTML.
- 2026-11-24 plan: `original` = lema por defecto (coincide con `meaning`, que es la glosa del léxico). Se cambia con `config.original = "forma"`.

### Hallazgos de revisión H2 (pendientes)

- [menor] `encontrar_app` (transferir.py/generar.py) es menos estricto que `tokenize`: `¡Dios`/`(Dios` pasan el filtro pero no se resaltan. Exigir que un inicio de token caiga dentro del span (relevante en H6).
- [menor] Atribución: añadir enlace a STEPBible-Data y «derivado de la RVR1960» en `creditos`/app; decidir licencia de la RVR1960 mostrada.
- [menor] `H430J` quedó «Dios, dioses»: decidir si solo «Dios». Pendientes humanos: `reportes/JAS.revision-pendiente.md` (G3550, G2746, G3649).
- [info] Medición JAS: alta 22 · 100 % (estricta 22/23 = 95,7 %); cobertura baja (22 de 59 del oro).
