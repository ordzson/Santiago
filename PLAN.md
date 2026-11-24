# Plan de hitos — Verbo · Estudio de lectura (`estudio/`)

<!-- Formato de /hito. Solo el hito actual va detallado; los demás, una línea. -->

## Hitos cerrados

- [x] H1 — Escena de video: luz, gestos y cierre (2026-11-22, ba5b01a)
- [x] H2 — Notas del original para RVR1960, piloto Santiago + Rut 1 (2026-11-24, 84c44a0)

## Hito actual: H3 — Espectro de voz al pie y progreso en la cabecera

Estado: aprobado
Base: b6d44574685738852629204e9783bb341da7133f

**Objetivo:** en la escena, el pie de página deja de ser «Santiago 1 ─── 42 %» y pasa a ser un espectro de la voz del micrófono, a ancho completo y en el mismo alto; el filete de la cabecera (bajo «Santiago / Capítulo X · NBLA») se convierte en una barra de progreso del capítulo, sin textos ni números.

**Decisiones del usuario (2026-11-24):**
- Se graba desde GitHub Pages (HTTPS → `getUserMedia` disponible). No se toca el servidor de desarrollo.
- Interruptor «Espectro de voz» en la preparación, **encendido por defecto**; el permiso del micrófono se pide al pulsar Comenzar (gesto del usuario, también para `AudioContext` en iOS).
- Pie: solo espectro, ancho completo; se quitan «Santiago 1» y el %.
- Diseño y ajuste visual con la skill `impeccable`.

**Fuera de alcance:** grabar o guardar audio; espectro en portada/cierre; flujo de despliegue a GitHub Pages; H4 (retomar grabación).

**Criterio de terminado:**
- Pruebas de lógica (`tests/voice-spectrum.test.ts`): silencio/ruido de sala (≈ −75 dB) → barras ≈ 0; voz normal (picos −35 dB en 150–3000 Hz) → barras centrales ≥ 0,5; voz baja (−50 dB) visible (≥ 0,35) gracias a la ganancia adaptativa sin levantar el ruido; nunca > 1; ataque más rápido que caída.
- `settings.voice` existe, por defecto `true`, se persiste y se parsea (prueba en `tests/settings.test.ts`).
- E2E `e2e/voice.spec.ts` (Chrome con `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream`): con el interruptor encendido, Comenzar pide micrófono y el canvas del pie dibuja barras que cambian entre frames; apagado → no se llama `getUserMedia` y el pie muestra la línea de reposo; permiso denegado → sin errores de página, línea de reposo; al salir de la escena las pistas del micrófono quedan `ended`; el pie no contiene «%» y su alto (sin cámara abajo) no crece más de 8 px respecto al actual; la barra de cabecera va de ≈0 a ≈1 al desplazar hasta el final y vuelve a 0 al cambiar de capítulo.
- `node scripts/verify.mjs full` pasa y `pnpm --dir estudio e2e` pasa.

### Oleadas

- [x] O1 — Motor del espectro (lógica pura) (a9b9740)
  - Verificación: quick
  - Commit: `feat(estudio): motor del espectro de voz`
  - [x] T1 — Módulo puro `voice-spectrum.ts` + pruebas
    - Leer: `CLAUDE.md`, este plan (Criterio de terminado), `estudio/src/app/settings.ts` (estilo; imports con `.ts`), `estudio/tests/settings.test.ts` (forma de las pruebas `node --test`).
    - Archivos: `estudio/src/app/voice-spectrum.ts`, `estudio/tests/voice-spectrum.test.ts`
    - Contenido: sin DOM ni Web Audio (recibe `Float32Array` en dB). `VOICE_TUNING` exportado con los parámetros iniciales: `fftSize 2048`, `smoothingTimeConstant 0.5`, analizador `minDecibels −95 / maxDecibels −20`, banda 90–7000 Hz en escala logarítmica, inclinación +3 dB/oct sobre 500 Hz, compuerta de ruido −68 dB, ganancia adaptativa (pico móvil con caída τ≈3 s y suelo −55 dB para no amplificar el ruido), ataque τ≈35 ms y caída τ≈220 ms (dependientes de `dt`, no del frame). Funciones: `bandEdges(sampleRate, fftSize, count, fMin, fMax)`, `bandLevels(db, edges, tuning)` → 0..1, `createVoiceSpectrum(count, tuning)` con `update(db, dt)` que devuelve niveles suavizados. Pruebas con espectros sintéticos según el Criterio.
    - Hecho cuando: `node scripts/verify.mjs quick` pasa con las pruebas nuevas.
- [x] O2 — Barra de progreso en la cabecera (c494521)
  - Verificación: quick + build
  - Commit: `feat(estudio): progreso del capítulo en el filete de cabecera`
  - [x] T1 — Filete → barra de progreso
    - Leer: `CLAUDE.md`, `estudio/DESIGN.md` (cabecera, folio, Motion Exception Rule), `estudio/src/app/reader.ts` (`onScroll`, `progress`, `reset`, plantilla de `page-top`), `estudio/src/app/reader.css` (`.page-top::after`, `.folio-line`).
    - Archivos: `estudio/src/app/reader.ts`, `estudio/src/app/reader.css`
    - Contenido: `progress` pasa a fracción 0..1 sin redondear (3 decimales); el filete actual (línea de tinta que se apaga) queda como pista y encima una capa de relleno en `--mark-red` con `transform:scaleX(var(--p))` desde la izquierda, 2 px de alto, `aria-hidden`; transición corta (~200 ms) que se anula con `prefers-reduced-motion` y al reiniciar el capítulo (sin «rebobinado» animado). Funciona en día y noche y con la fila de cámara arriba. Si el pie aún usa `progress` en %, adaptarlo sin romperlo (O3 lo elimina).
    - Hecho cuando: `node scripts/verify.mjs quick` y `node scripts/verify.mjs build` pasan; captura manual con `pnpm --dir estudio dev` + Playwright (deviceScaleFactor 1) muestra la barra a ~0 al inicio y ~1 al final del capítulo.
- [ ] O3 — Micrófono y espectro en el pie
  - Verificación: quick + build
  - Commit: `feat(estudio): espectro de voz del micrófono en el pie de página`
  - [ ] T1 — Ajuste y entrada de micrófono
    - Leer: `CLAUDE.md`, `estudio/src/app/settings.ts`, `estudio/tests/settings.test.ts`, `estudio/src/app/app.ts` (`startScene`, `exitScene`, `ngOnDestroy`), `estudio/src/app/app.html` (sección «Tu lugar en la escena», patrón `switch-label`), `estudio/src/app/voice-spectrum.ts` (`VOICE_TUNING`).
    - Archivos: `estudio/src/app/settings.ts`, `estudio/tests/settings.test.ts`, `estudio/src/app/voice-input.ts`, `estudio/src/app/app.ts`, `estudio/src/app/app.html`
    - Contenido: `Settings.voice:boolean` (por defecto `true`, `parseSettings` acepta solo booleano). Servicio `VoiceInput` (injectable, root): `start()` llamado **síncronamente** dentro de `startScene` si `settings.voice` (crea/reanuda `AudioContext` en el gesto, `getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}})`, `AnalyserNode` con `VOICE_TUNING`, sin conectar a `destination`); `stop()` en `exitScene` y `ngOnDestroy` (detiene pistas, cierra contexto); señal `state: 'off'|'asking'|'on'|'denied'|'unavailable'` y getter del analizador. Sin `navigator.mediaDevices` o denegado → estado sin lanzar errores. Interruptor «Espectro de voz» en la preparación con nota breve («Durante la toma, tu voz se dibuja al pie de la página. No se graba ni se envía nada.»).
    - Hecho cuando: `node scripts/verify.mjs quick` pasa (prueba de `voice` en settings incluida) y `node scripts/verify.mjs build` pasa.
  - [ ] T2 — Componente `v-voice-meter` y nuevo pie
    - Leer: `CLAUDE.md`, `estudio/DESIGN.md` (colores `mark-red`, `head-red`, `page-muted`, noche), `estudio/src/app/voice-spectrum.ts`, `estudio/src/app/voice-input.ts`, `estudio/src/app/reader.ts` (plantilla del `page-bottom`, inputs), `estudio/src/app/reader.css` (`.page-bottom`, `.page-folio`, `.camera-row`), `estudio/src/app/app.html` (uso de `v-reader`).
    - Archivos: `estudio/src/app/voice-meter.ts`, `estudio/src/app/reader.ts`, `estudio/src/app/reader.css`, `estudio/src/app/app.html`
    - Contenido: canvas a ancho completo del pie (comparte fila con `presenter-space` si la cámara está abajo), alto ≈ el del folio actual más el padding que libere (el pie no crece > 8 px). Barras simétricas: graves en el centro abriéndose hacia los lados, crecen arriba y abajo de una línea base; nº de barras según ancho (≈3 px barra + 3 px hueco), DPR correcto con `ResizeObserver`; colores leídos de las variables CSS (día/noche, acento). Bucle `requestAnimationFrame` solo mientras `active` (= escena en lectura y `voice` y analizador listo) y la pestaña visible; si no, dibuja la línea de reposo (puntos de 2 px) y no anima. Quitar `page-folio`/`folio-line` del pie y su CSS muerto. `aria-hidden` en el canvas.
    - Hecho cuando: `node scripts/verify.mjs quick` y `build` pasan; captura con Chrome `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream` (deviceScaleFactor 1, 390×844 y 1440×1000) muestra barras moviéndose en escena y la línea de reposo en la preparación.
- [ ] O4 — Pulido con impeccable y E2E
  - Verificación: full + `pnpm --dir estudio e2e`
  - Commit: `feat(estudio): pulido del espectro y pruebas e2e de voz`
  - [ ] T1 — Pase de diseño con `impeccable`
    - Leer: `CLAUDE.md`, `estudio/PRODUCT.md`, `estudio/DESIGN.md`, `estudio/src/app/voice-meter.ts`, `estudio/src/app/voice-spectrum.ts` (`VOICE_TUNING`), `estudio/src/app/reader.css` (cabecera y pie).
    - Archivos: `estudio/src/app/voice-meter.ts`, `estudio/src/app/voice-spectrum.ts`, `estudio/src/app/reader.css`, `estudio/DESIGN.md`, `estudio/tests/voice-spectrum.test.ts` (solo si cambian umbrales)
    - Contenido: invocar la skill `impeccable` (polish) sobre el espectro y la barra de cabecera; iterar con capturas (Chrome con dispositivo falso; día/noche; teléfono/escritorio; cámara abajo) ajustando nº/ancho/radio de barras, alto útil, color/opacidad, suavizado y sensibilidad para que llene bien el pie al hablar y quede sereno en silencio; barra de cabecera discreta. Documentar en `DESIGN.md` ambos elementos y la excepción de movimiento del espectro (movimiento continuo en lectura permitido solo porque refleja la voz; con reduced-motion: mismo espectro sin transición de la barra de cabecera). Las pruebas de O1 deben seguir pasando.
    - Hecho cuando: `node scripts/verify.mjs full` pasa; capturas finales en `.impeccable/review/voice-*.png`.
  - [ ] T2 — E2E de voz y progreso
    - Leer: `CLAUDE.md`, este plan (Criterio de terminado), `estudio/playwright.config.ts`, `estudio/e2e/helpers.ts`, `estudio/e2e/studio.spec.ts` (patrón de entrar en escena).
    - Archivos: `estudio/e2e/voice.spec.ts`, `estudio/e2e/helpers.ts` (si hace falta), `estudio/playwright.config.ts` (solo si hace falta un proyecto con flags de medios falsos)
    - Contenido: lanzar Chrome con `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream` (o proyecto propio); casos del Criterio: interruptor encendido por defecto y persistido; barras que cambian entre frames; apagado sin `getUserMedia` (contar llamadas con `addInitScript`); denegado (stub que rechaza) sin `pageerror`; pistas `ended` al salir; pie sin «%» y alto ≤ actual + 8 px; barra de cabecera ≈0 → ≈1 y reinicio al cambiar de capítulo. Ajustar specs existentes que dependan del folio.
    - Hecho cuando: `pnpm --dir estudio e2e` pasa completo.

### Notas de ejecución

<!-- Una línea por decisión, desvío o bloqueo. Fecha + oleada. -->

- 2026-11-24 O1: compuerta (−68 dB) aplicada al nivel medido, antes de la inclinación (si no, el ruido de sala encendía los agudos). `bandEdges` devuelve objeto `{sampleRate,fftSize,count,bins,freqs}`; `createVoiceSpectrum(count, tuning, sampleRate=48000)` → O3 debe pasar `audioContext.sampleRate`; `bandLevels(db,edges,tuning,peakDb?)`.
- 2026-11-24 O2: barra `.page-progress` en el header; `reset()` activa `snap` (sin rebobinado animado). Pie aún usa `percent` (O3 lo quita). Sin captura visual aún (se hace en O3/O4).

## Próximos hitos

- H4 — Retomar grabación: guardar marcas y elegidos de la sesión y poder volver a ellos tras recargar.
- H5 — Variantes de portada/cierre (paletas de luz, posición del título) elegibles en la preparación.
- H6 — Instalación offline (PWA) para grabar sin red.
- H7 — Notas del original RVR1960 para el resto del NT y AT (aplicando TVTMS donde los conteos difieran), con el mismo pipeline.
