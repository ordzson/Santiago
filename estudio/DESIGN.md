---
name: "Verbo · Estudio de lectura"
description: "Un atril editorial para preparar una lectura y dejar que el texto ocupe la escena."
colors:
  paper: "#f6f1e4"
  ground: "#eee8db"
  ink: "#2c251f"
  muted: "#6e6458"
  red: "#b92d40"
  red-dark: "#922235"
  rule: "#cfc6b5"
  gold: "#bc8c31"
  page-ink: "#30271f"
  page-muted: "#675d52"
  head-red: "#922235"
  night-paper: "#211c18"
  night-ink: "#eee4d2"
  night-muted: "#b6aa98"
  night-rule: "#564a3c"
  night-red: "#e17581"
  night-head-red: "#f2a0a9"
  mote-amber: "#c9962e"
  mote-gold: "#e0b54a"
  mote-deep: "#a8741f"
  night-mote-amber: "#f3b54a"
  night-mote-gold: "#ffd27a"
  word-light: "#dba7349e"
  verse-light: "#dba7344d"
  gold-leaf: "#e0b54a66"
typography:
  display:
    fontFamily: "Noto Serif, Georgia, serif"
    fontSize: "50px"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Gelasio, Georgia, serif"
    fontSize: "26px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Gelasio, Georgia, serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  reading:
    fontFamily: "Gelasio, Georgia, serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.73
  body:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 500
  label-small:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  caption:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "10px"
    fontWeight: 400
  numeral:
    fontFamily: "Gelasio, Georgia, serif"
    fontSize: "92px"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  cover-title:
    fontFamily: "Noto Serif, Georgia, serif"
    fontSize: "84px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  cover-label:
    fontFamily: "Gelasio, Georgia, serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.35
  greek:
    fontFamily: "Noto Serif, Georgia, serif"
    fontSize: "38px"
    fontWeight: 400
    lineHeight: 1.4
  hebrew:
    fontFamily: "Noto Serif Hebrew, Noto Serif, Georgia, serif"
    fontSize: "44px"
    fontWeight: 400
    lineHeight: 1.9
    letterSpacing: "0"
rounded:
  sheet: "3px"
  control: "5px"
  field: "6px"
  tool: "7px"
  surface: "12px"
  preset: "30px"
spacing:
  "4": "4px"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0px 24px"
  button-primary-hover:
    backgroundColor: "{colors.red-dark}"
  button-text:
    textColor: "{colors.ink}"
    typography: "{typography.label-small}"
  button-text-hover:
    textColor: "{colors.red}"
  button-icon:
    textColor: "{colors.ink}"
    width: "44px"
    height: "44px"
  input-text:
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "10px 14px"
  mode-option:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "14px 6px"
  mode-option-selected:
    textColor: "{colors.red}"
  theme-choice:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  message-preset:
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.preset}"
    padding: "0px 12px"
  paper-preview:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.page-ink}"
    rounded: "{rounded.sheet}"
  ribbon:
    backgroundColor: "{colors.red}"
    textColor: "{colors.paper}"
  ribbon-play:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    width: "37px"
    height: "59px"
  tool-toggle-active:
    textColor: "{colors.red}"
    rounded: "{rounded.tool}"
  illuminated-word:
    backgroundColor: "{colors.word-light}"
    textColor: "{colors.page-ink}"
    typography: "{typography.reading}"
    rounded: "{rounded.sheet}"
  illuminated-verse:
    backgroundColor: "{colors.verse-light}"
    textColor: "{colors.page-ink}"
    typography: "{typography.reading}"
    rounded: "{rounded.sheet}"
  chosen-verse:
    backgroundColor: "{colors.gold-leaf}"
    textColor: "{colors.page-ink}"
    typography: "{typography.reading}"
    rounded: "{rounded.sheet}"
  dialog:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
---

# Design System: Verbo · Estudio de lectura

## Overview

**Creative North Star: "El atril de grabación"**

Verbo reúne los materiales de un escritorio editorial: marfil, tinta cálida, reglas finas, una cinta carmín y un grabado geométrico. La preparación es compacta y práctica; la página conserva una lectura amplia y pausada. Comparte esos materiales con la referencia Santiago, pero este sistema pertenece únicamente a la app independiente de `estudio/`.

En escena, la página ocupa la ventana y el único rastro de interfaz son dos cintas que cuelgan del borde superior. Sobre ese papel actúa un material propio, la **luz de atril**: rayos cálidos que caen desde arriba al centro, polvo dorado suspendido y, para lo elegido, hoja de oro. El carmín sigue orientando (cintas, numerales, marcapáginas); el oro es luz y énfasis. La ornamentación procede del canvas geométrico original, de SVG de línea y de efectos procedurales (Canvas 2D, CSS); no hay imágenes rasterizadas en la interfaz.

**Key Characteristics:**

- Papel marfil sobre un escritorio ligeramente más oscuro.
- Serif de lectura generosa junto a controles Archivo compactos.
- Carmín para orientar, marcar límites y recuperar los ajustes.
- Profundidad suave reservada a la página y a superficies superpuestas.
- Texto, encuadre del presentador y cintas con espacios propios.
- Luz de atril en la portada y el cierre; en la lectura, solo marcas que se encienden una vez.

## Colors

La paleta combina neutrales cálidos con carmín de orientación y luz ámbar de anotación. Los valores normativos están en el frontmatter.

### Primary

- **Carmín de cinta** (`red`): cinta, numerales, selección, foco y acentos de recorrido. **Carmín profundo** (`red-dark`) responde al hover del botón principal y a errores de selección.
- **Carmín de noche** (`night-red`): reemplaza el acento de los controles dentro de la escena nocturna.
- **Carmín de cabecera** (`head-red`): variante legible del carmín para la cabecera y el folio de la página, `#922235` en día y `#f2a0a9` en noche.

### Secondary

- **Oro de luz** (`gold`): hilo de la cinta de reproducción y acento de lo iluminado.
- **Luz de palabra** (`word-light`) y **luz de versículo** (`verse-light`): fondos translúcidos que mantienen visible el texto; el versículo es un degradado horizontal (el valor registrado es su extremo izquierdo, más intenso) que se apaga hacia la derecha. El resplandor completo está en el sidecar.
- **Hoja de oro** (`gold-leaf`): fondo del versículo elegido, con filetes dorados y brillo diagonal (ver Components).
- **Motas** (`mote-amber`, `mote-gold`, `mote-deep`; de noche `night-mote-amber`, `night-mote-gold`): polvo y chispas del motor de partículas. En día se pintan con alfa normal sobre el papel; en noche se suman (`lighter`) para que brillen.

### Neutral

- **Papel marfil** (`paper`): página, diálogos y herramientas superpuestas. **Escritorio cálido** (`ground`): preparación y sus márgenes.
- **Tinta cálida** (`ink`) y **tinta de página** (`page-ink`): interfaz y lectura respectivamente. La diferencia existente se conserva.
- **Tinta secundaria** (`muted`) y **folio tenue** (`page-muted`): ayudas de preparación y metadatos de la página respectivamente. No intercambiar sus contextos.
- **Regla de papel** (`rule`): separadores, contornos de campos y organización de ajustes.
- **Folio tenue** se oscureció a `#675d52` en día para que numerales, folio y metadatos de la página alcancen contraste de lectura; el folio de noche es `#b6aa98`.
- **Papel de noche**, **tinta de noche**, **folio de noche** y **regla de noche** (`night-paper`, `night-ink`, `night-muted`, `night-rule`): sustituciones de la lectura y de los controles durante la escena nocturna. La preparación conserva el escritorio claro.

**The Carmine Wayfinding Rule.** El carmín identifica selección, foco, numerales y la cinta; el botón principal descansa en tinta cálida y usa carmín profundo al pasar el puntero.

**The Gold Is Light Rule.** El oro nunca orienta ni rotula: solo ilumina (marcas, polvo, hoja de oro, hilo de la cinta de reproducción). Si un elemento necesita decir «aquí», es carmín.

## Typography

**Display Font:** Noto Serif, con Georgia y serif de respaldo. **Original-language Font:** Noto Serif Hebrew para el hebreo, con Noto Serif de respaldo.
**Body Font:** Gelasio para la lectura; Archivo para la interfaz, con Georgia/serif y Arial/sans-serif de respaldo respectivamente.

Las cuatro familias se sirven localmente con `font-display: swap`. Noto Serif incluye griego y griego extendido. **Noto Serif Hebrew** (variable en peso) solo se descarga para el rango hebreo (`unicode-range: U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F`) y conserva niqqud y cantilación. Gelasio dispone de romana, cursiva y negrita; Archivo es variable. Las licencias están en `public/licencias/`.

### Hierarchy

- **Display** (`display`): título de preparación en Noto Serif. El énfasis del título usa Gelasio cursiva y carmín. El tamaño observado cambia a 57 px en escritorio amplio, 40 px en móvil y 36 px bajo 360 px. El cierre usa la misma familia con una escala propia de 45 px, o 40 px en móvil.
- **Headline** (`headline`): encabezado de ajustes en Gelasio. El título del capítulo usa la misma familia y tamaño con interlineado 1.2; en escena de al menos 700 px aumenta a 34 px.
- **Title** (`title`): títulos de diálogos; en móvil se reducen a 26 px.
- **Reading** (`reading`): texto bíblico. El tamaño inicial es el token registrado y el lector permite ajustarlo entre 17 y 32 px; conserva el interlineado amplio. 
- **Body / Label / Caption** (`body`, `label`, `label-small`, `caption`): Archivo distingue instrucciones, acciones y metadatos. Las etiquetas pequeñas pertenecen a preparación y folio, nunca al texto bíblico.
- **Numeral** (`numeral`): numeral de capítulo en Gelasio carmín, 92 px (118 px en escena a partir de 700 px), interlineado .9, con sombra de relieve (desplazada y difusa) además del color. Entra con una animación de «tinta» de .75 s una sola vez al cambiar de capítulo.
- **Cover title / label** (`cover-title`, `cover-label`): título de la portada en Noto Serif (`clamp(36px, 11.2vw, 84px)`, interletra -.03em) y rótulo del recorrido en Gelasio cursiva (`clamp(19px, 5.4vw, 28px)`). En el cierre, la cita elegida usa Gelasio con tamaño que baja en pasos hasta caber (mínimo 15 px) y la referencia va en Archivo 15 px.
- **Greek** (`greek`): término griego en Noto Serif carmín, 38 px; transliteración en Gelasio cursiva y significado en Gelasio romana.
- **Hebrew** (`hebrew`): término hebreo en Noto Serif Hebrew carmín, **44 px** con interlineado 1.9 (los puntos vocálicos y los acentos arriba y abajo no se cortan), `lang="he"`, `dir="rtl"`, `unicode-bidi: isolate`, centrado y con `mark`/`mkmk` activos. Es mayor que el griego porque la escritura hebrea es más compacta a igual tamaño. La transliteración y el significado siguen en LTR.

**The Reading Voice Rule.** Gelasio sostiene el texto bíblico y Noto Serif sostiene títulos y griego; Archivo organiza la operación sin competir con la lectura.

**The Right-to-Left Isolation Rule.** Un término hebreo siempre va en su propio elemento con `lang="he"` y `dir="rtl"`; nunca se mezcla en línea con texto en español ni se alinea a la izquierda por herencia.

## Layout

La preparación de escritorio usa tres columnas: selección, prueba de página y ajustes. El contenedor ocupa el 91% del ancho con un máximo inicial de 1310 px; sus columnas son `minmax(250px, 1fr)`, `minmax(300px, 380px)` y `minmax(235px, .85fr)`. La separación fluye entre 32 y 80 px. A partir de 1550 px, el máximo pasa a 1400 px y la página central a 400 px.

Entre 701 y 1100 px hay dos columnas con los ajustes debajo en tres grupos. Hasta 700 px el orden se vuelve vertical, con márgenes laterales de 24 px, modos en tres columnas y acción de entrada fija al borde inferior mediante un pie sticky. Bajo 360 px los márgenes se reducen a 18 px. Los valores del grupo `spacing` son distancias observadas y repetidas; el código no declara una escala CSS global ni una cuadrícula estricta para todas las medidas.

La prueba de página mantiene proporción vertical mediante una altura controlada; no simula un teléfono con bisel. En escena ocupa `100dvh`, sin esquinas ni sombra de tarjeta. A partir de 700 px, lectura, encabezado y folio tienen una medida máxima de 780 px; el contenido añade 50 px de margen interior horizontal. En móvil el contenido conserva los márgenes propios de la página y el scroll vive entre encabezado y folio.

**Reserva protegida.** El espacio del presentador pertenece a una fila superior o inferior de la página. Su reserva de 72 a 150 px reduce el área de lectura; los versículos nunca pasan detrás de ella. Ocultar la guía conserva la reserva.

## Elevation & Depth

El escritorio es plano: reglas finas y diferencias de tono agrupan la preparación. La página recibe una sombra ambiental cálida y, en escena, un grano de papel SVG estático (un solo mosaico `feTurbulence` de 240 px, sin coste al desplazar) más una viñeta cálida suave y un resplandor superior bajo el texto; el dock, los diálogos y los avisos tienen sombras de superposición. Al entrar en escena desaparece la sombra exterior de la página. Los resplandores de las marcas (`box-shadow` de color ámbar u oro con difusión amplia y desplazamiento corto) pertenecen al texto iluminado, no a una tarjeta. La luz de las marcas es un tratamiento del texto y del versículo, no una elevación de tarjeta. Los valores exactos están en `extensions.shadows` del sidecar.

## Shapes

La página es casi recta (`sheet`); botones y opciones usan esquinas suaves (`control`), campos y carga de archivos usan `field`, el interruptor del panel usa `tool` y diálogos usan `surface`. Las cápsulas de mensajes usan `preset`. Los botones de icono y las reservas circulares emplean un círculo real; la reserva cuadrada comparte las esquinas suaves de los diálogos.

La cinta tiene cola recortada en V. Su forma visible es más pequeña que su botón: conserva un área interactiva de 44 px de ancho. Los iconos son SVG de línea de 24 unidades, grosor 1.5, remates y uniones redondeados. El signo alfa representa literalmente el griego; no sustituye un icono genérico de navegación. El grabado combina rayos, elipses y líneas finas en tinta gris cálida con una pequeña semilla carmín.

## Components

### Buttons

La acción principal es sólida y sobria: tinta sobre papel invertidos, altura mínima de 52 px y padding horizontal del token del componente. En móvil la entrada a escena se compacta a una altura mínima de 48 px. El hover cambia al carmín profundo. Los botones de texto cambian a carmín; los botones de icono son circulares con una película tenue de tinta al pasar el puntero. Disabled reduce opacidad a .4.

El foco visible usa contorno carmín de 2 px con separación de 4 px. El estado pulsado desplaza el botón 1 px. La respuesta habitual dura .18 s; el easing de transformación es `--ease`.

### Chips

Las opciones Papel/Noche son botones contorneados con muestra circular. El seleccionado conserva un contorno de tinta y fondo de papel translúcido. Las cápsulas de mensaje son atajos de texto, con borde de regla y hover carmín; no representan filtros persistentes.

### Cards / Containers

La página es el contenedor protagonista, con una cinta vertical de 5 px en el borde izquierdo. Los grupos de preparación se separan con reglas en lugar de cajas. Los diálogos nativos usan papel, esquina `surface`, ancho máximo de 480 px y scroll interno acotado a la ventana; la nota del idioma original reduce el máximo a 430 px. El fondo del diálogo se oscurece con tinta cálida translúcida. Cada diálogo toma su nombre accesible del título visible; la nota también vincula su significado. Su etiqueta superior nombra idioma y lugar («Griego · Santiago 1:1», «Hebreo · Génesis 1:1»).

### Inputs / Fields

Los selects permanecen nativos, transparentes y apoyados en una regla inferior compartida. El campo de mensaje tiene contorno de regla y esquina `field`. Sliders, checks y cursor de escritura usan carmín. La carga de archivos usa borde discontinuo y foco visible del contenedor; las ayudas continúan en tinta secundaria. El error de selección usa carmín profundo, fondo rojo muy tenue y borde translúcido.

### Navigation

El encabezado reúne marca, Mi contenido y ayuda. La selección de modo es una lista dividida por reglas en escritorio y un grupo de tres opciones contorneadas en móvil; selección combina carmín y check.

Durante la lectura el único control visible son **dos cintas**: la de **ajustes** (carmín, icono de sliders que pasa a cerrar) y la de **reproducción** (tinta de página en día, marfil en noche, hilo dorado de 1 px y icono play/pausa; queda «tirada», alargada, mientras reproduce). Tienen cola en V, 37×59 px en móvil y 40×65 px en escritorio, y 8 px de separación; ajustes junto al borde. Si el encuadre del presentador está arriba a la derecha, ambas pasan a la izquierda. Se ocultan en cuenta atrás, portada y negro; en el cierre queda solo la de ajustes.

La cinta de ajustes abre una barra superior y un panel inferior de hasta 420 px: interruptor **Idioma original** (α, א o «α א» según el libro; deshabilitado con pista si el libro no tiene notas), «Limpiar marcas», contador de elegidos, pista de gestos y avance de capítulo. El panel se retira a los cinco segundos, salvo mientras el foco está dentro. Sus controles ocultos son `inert`. Escape lo abre o retira. Una sola parada Tab entra a las palabras y las flechas, Inicio y Fin las recorren; así la página sigue legible y el teclado utilizable sin cientos de paradas.

### Scripture emphasis and presenter frame

No hay herramientas que elegir: las marcas nacen de gestos (mantener 2 s, arrastrar, tocar una palabra, mantener 4 s; teclado H y E). Son independientes y reversibles, no producen reflujo del texto y mantienen un contraste mínimo de 5.3:1 en día y 5.45:1 en noche.

- **Carga.** Desde 350 ms el versículo «carga luz»: un resplandor radial ámbar crece desde el punto de presión. Tras los 2 s, una segunda carga en oro con aureola fina anuncia el paso a los 4 s.
- **Luz de versículo** (`illuminated-verse`). Banda cálida de degradado horizontal, más intensa a la izquierda; resplandor exterior suave y filete dorado de 3 px a la izquierda. Entrada de 700 ms con barrido de luz de izquierda a derecha.
- **Palabra marcada** (`illuminated-word`). Solo dentro de un versículo resaltado o elegido: marcador ámbar en la mitad inferior de la palabra más un halo; florece una vez en 600 ms con un destello, sin escalar la caja.
- **Hoja de oro** (`chosen-verse`). Versículo elegido para el cierre: fondo dorado con brillo diagonal, filetes dorados finos arriba y abajo, marcapáginas carmín con cola en V en el margen izquierdo (14×22 px) y una estrella ✦ tras el número. Entra con un barrido de brillo de 1.2 s y un pulso de resplandor, una sola vez. Prevalece visualmente sobre la luz de versículo.
- **Papel y cabecera.** Grano, viñeta y resplandor superior bajo el texto; numeral de capítulo (`numeral`) con relieve; cabecera y folio en `head-red` y `page-muted`. Al cambiar de capítulo en escena, un barrido de luz de 1.1 s cruza la página una vez.
- **Notas del idioma original.** Solo las palabras con datos reciben subrayado punteado, y solo con «Idioma original» activo. El diálogo presenta el término (griego 38 px, hebreo 44 px RTL), transliteración y significado.
- **Espacio del presentador.** Círculo o cuadrado en cualquiera de las cuatro esquinas; la guía discontinua se muestra en preparación y es opcional en escena.

### Luz de atril: portada, polvo y cierre

La portada y el cierre comparten un mismo material.

- **Rayos.** Un `conic-gradient` enmascarado más un resplandor radial caen desde arriba al centro. En día se apoya en una viñeta de tinta del 8 al 12 % en los bordes para que la luz se lea sobre marfil; en noche la luz es aditiva y dorada. Durante el sostén los rayos oscilan ±3° con un `transform` muy lento (18 s).
- **Portada.** Secuencia de duración configurable (3 a 10 s, por defecto 5): la cuenta atrás se disuelve y la luz se abre; el título entra de desenfoque a nitidez con ajuste de interletra; una regla carmín corta aparece y el rótulo en Gelasio cursiva aparece debajo; en los últimos 0.9 s la luz «inunda», título y rótulo se elevan y la página aparece. No se puede saltar.
- **Partículas** (Canvas 2D, sin dependencias, tope de 500 vivas, DPR máximo 2, en pausa con la pestaña oculta). Cuatro ráfagas con carácter propio: `lit` (28–40 motas ámbar que suben desde los bordes del versículo), `paint` (≈10, pequeñas), `word` (10–14 chispas de .6 s) y `special` (60–80 doradas y 6–8 carmín en salida radial, más un anillo dorado de 700 ms). El polvo ambiental (70 motas en teléfono, 120 en escritorio) deriva y parpadea en la portada y el cierre, y se apaga en 600 ms. El tamaño es de 2 a 5 px.
- **Cierre.** Misma luz y polvo. Arriba, pequeño, `título · rótulo` en Archivo versalitas; en el centro, los versículos elegidos en orden canónico, cada uno con su referencia en Archivo y un marcapáginas carmín (una cita grande, 2–3 apiladas con reglas, 4 o más en columnas en escritorio); debajo, el mensaje final. Sin elegidos, el mensaje final ocupa el centro.
- **Fundido.** Un toque funde a negro con un velo de 6 s (ease-in-out) mientras el polvo se apaga; en negro, tras una guarda de 600 ms, otro toque vuelve a la preparación.

**The Motion Exception Rule.** El movimiento continuo existe solo en la portada y el cierre, secuencias autorizadas porque son la toma, y nunca en la lectura. Las excepciones permitidas en la lectura son puntuales y de una sola pasada: entrada y barrido del numeral al cambiar de capítulo, floración de marcas y desplazamiento automático elegido. Con `prefers-reduced-motion` no hay partículas ni desplazamientos: la portada es una composición fija que dura lo configurado, las marcas aparecen sin animación y se conservan únicamente los fundidos de opacidad que son el cierre buscado (velo negro y salida de la portada).

## Do's and Don'ts

### Do:

- **Do** mantener los roles separados de papel, escritorio, tinta de lectura y tinta secundaria.
- **Do** conservar Gelasio y su interlineado amplio al añadir superficies de lectura.
- **Do** combinar color y una señal adicional para comunicar selección, como el check de modo o el contorno de tema; en las marcas, forma además de color (filete, marcapáginas, estrella).
- **Do** preservar la reserva del presentador cuando su guía se oculta.
- **Do** mantener foco visible, nombres accesibles y alternativa de teclado para cada gesto.
- **Do** reutilizar SVG de línea y el grabado geométrico original cuando la ornamentación ayude a enmarcar la página.
- **Do** dar a cada efecto de luz un camino con movimiento reducido.
- **Do** componer el hebreo en su propio elemento RTL a 44 px con Noto Serif Hebrew.

### Don't:

- **Don't** convertir cada grupo de ajustes en una tarjeta elevada: la preparación se organiza con reglas y tono.
- **Don't** usar el tamaño de las ayudas compactas para el texto bíblico o para el contenido de las notas.
- **Don't** aplicar brillo al cuerpo completo: la luz corresponde a palabras o versículos marcados, y los rayos a la portada y el cierre.
- **Don't** colocar la imagen del presentador por encima de los versículos ni eliminar su espacio al ocultar la guía.
- **Don't** subrayar como consultable una palabra sin nota asociada.
- **Don't** añadir movimiento continuo a la lectura, ni mostrar avisos visibles (toasts) durante la escena: saldrían en el video.
- **Don't** usar el oro para orientar ni el carmín para iluminar.
- **Don't** reintroducir animaciones bajo movimiento reducido; solo los fundidos de opacidad del cierre permanecen.
- **Don't** ocultar controles que contienen el foco.
