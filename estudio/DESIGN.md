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
  page-muted: "#756b5f"
  night-paper: "#211c18"
  night-ink: "#eee4d2"
  night-muted: "#b6aa98"
  night-rule: "#564a3c"
  night-red: "#e17581"
  word-light: "#dba73433"
  verse-light: "#dba73426"
  drawing-ink: "#bc3442"
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
  greek:
    fontFamily: "Noto Serif, Georgia, serif"
    fontSize: "38px"
    fontWeight: 400
    lineHeight: 1.4
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
  tool-selected:
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
  dialog:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
---

# Design System: Verbo · Estudio de lectura

## Overview

**Creative North Star: "El atril de grabación"**

Verbo reúne los materiales de un escritorio editorial: marfil, tinta cálida, reglas finas, una cinta carmín y un grabado geométrico. La preparación es compacta y práctica; la página conserva una lectura amplia y pausada. Comparte esos materiales con la referencia Santiago, pero este sistema pertenece únicamente a la app independiente de `estudio/`.

En escena, la página ocupa la ventana y las herramientas se retiran. La cinta conserva una entrada pequeña y reconocible a los controles. El énfasis ámbar ilumina palabras sin sustituir su tinta; el trazo rojo aporta una marca manual. La ornamentación procede del canvas geométrico original y de SVG de línea, sin imágenes rasterizadas en la interfaz.

**Key Characteristics:**

- Papel marfil sobre un escritorio ligeramente más oscuro.
- Serif de lectura generosa junto a controles Archivo compactos.
- Carmín para orientar, marcar límites y recuperar herramientas.
- Profundidad suave reservada a la página y a superficies superpuestas.
- Texto, encuadre del presentador y herramientas con espacios propios.

## Colors

La paleta combina neutrales cálidos con carmín de orientación y luz ámbar de anotación. Los valores normativos están en el frontmatter.

### Primary

- **Carmín de cinta** (`red`): cinta, numerales, selección, foco y acentos de recorrido. **Carmín profundo** (`red-dark`) responde al hover del botón principal y a errores de selección.
- **Carmín de noche** (`night-red`): reemplaza el acento de los controles dentro de la escena nocturna.

### Secondary

- **Oro de luz** (`gold`): pequeño acento de la indicación de iluminación.
- **Luz de palabra** (`word-light`) y **luz de versículo** (`verse-light`): fondos translúcidos que mantienen visible el texto. Su resplandor completo se registra en el sidecar.
- **Tinta de trazo** (`drawing-ink`): línea libre sobre la página; no es el color del texto bíblico.

### Neutral

- **Papel marfil** (`paper`): página, diálogos y herramientas superpuestas. **Escritorio cálido** (`ground`): preparación y sus márgenes.
- **Tinta cálida** (`ink`) y **tinta de página** (`page-ink`): interfaz y lectura respectivamente. La diferencia existente se conserva.
- **Tinta secundaria** (`muted`) y **folio tenue** (`page-muted`): ayudas de preparación y metadatos de la página respectivamente. No intercambiar sus contextos.
- **Regla de papel** (`rule`): separadores, contornos de campos y organización de ajustes.
- **Papel de noche**, **tinta de noche**, **folio de noche** y **regla de noche** (`night-paper`, `night-ink`, `night-muted`, `night-rule`): sustituciones de la lectura y de los controles durante la escena nocturna. La preparación conserva el escritorio claro.

**The Carmine Wayfinding Rule.** El carmín identifica selección, foco, numerales y la cinta; el botón principal descansa en tinta cálida y usa carmín profundo al pasar el puntero.

## Typography

**Display Font:** Noto Serif, con Georgia y serif de respaldo.
**Body Font:** Gelasio para la lectura; Archivo para la interfaz, con Georgia/serif y Arial/sans-serif de respaldo respectivamente.

Las tres familias se sirven localmente con `font-display: swap`. Noto Serif incluye griego y griego extendido. Gelasio dispone de romana, cursiva y negrita; Archivo es variable. Las licencias están en `public/licencias/`.

### Hierarchy

- **Display** (`display`): título de preparación en Noto Serif. El énfasis del título usa Gelasio cursiva y carmín. El tamaño observado cambia a 57 px en escritorio amplio, 40 px en móvil y 36 px bajo 360 px. El cierre usa la misma familia con una escala propia de 45 px, o 40 px en móvil.
- **Headline** (`headline`): encabezado de ajustes en Gelasio. El título del capítulo usa la misma familia y tamaño con interlineado 1.2; en escena de al menos 700 px aumenta a 34 px.
- **Title** (`title`): títulos de diálogos; en móvil se reducen a 26 px.
- **Reading** (`reading`): texto bíblico. El tamaño inicial es el token registrado y el lector permite ajustarlo entre 17 y 32 px; conserva el interlineado amplio. Los numerales de capítulo usan Gelasio de 70 px, o 90 px en escena amplia.
- **Body / Label / Caption** (`body`, `label`, `label-small`, `caption`): Archivo distingue instrucciones, acciones y metadatos. Las etiquetas pequeñas pertenecen a preparación y folio, nunca al texto bíblico.
- **Greek** (`greek`): término griego en Noto Serif carmín; transliteración en Gelasio cursiva y significado en Gelasio romana.

**The Reading Voice Rule.** Gelasio sostiene el texto bíblico y Noto Serif sostiene títulos y griego; Archivo organiza la operación sin competir con la lectura.

## Layout

La preparación de escritorio usa tres columnas: selección, prueba de página y ajustes. El contenedor ocupa el 91% del ancho con un máximo inicial de 1310 px; sus columnas son `minmax(250px, 1fr)`, `minmax(300px, 380px)` y `minmax(235px, .85fr)`. La separación fluye entre 32 y 80 px. A partir de 1550 px, el máximo pasa a 1400 px y la página central a 400 px.

Entre 701 y 1100 px hay dos columnas con los ajustes debajo en tres grupos. Hasta 700 px el orden se vuelve vertical, con márgenes laterales de 24 px, modos en tres columnas y acción de entrada fija al borde inferior mediante un pie sticky. Bajo 360 px los márgenes se reducen a 18 px. Los valores del grupo `spacing` son distancias observadas y repetidas; el código no declara una escala CSS global ni una cuadrícula estricta para todas las medidas.

La prueba de página mantiene proporción vertical mediante una altura controlada; no simula un teléfono con bisel. En escena ocupa `100dvh`, sin esquinas ni sombra de tarjeta. A partir de 700 px, lectura, encabezado y folio tienen una medida máxima de 780 px; el contenido añade 50 px de margen interior horizontal. En móvil el contenido conserva los márgenes propios de la página y el scroll vive entre encabezado y folio.

**Reserva protegida.** El espacio del presentador pertenece a una fila superior o inferior de la página. Su reserva de 72 a 150 px reduce el área de lectura; los versículos nunca pasan detrás de ella. Ocultar la guía conserva la reserva.

## Elevation & Depth

El escritorio es plano: reglas finas y diferencias de tono agrupan la preparación. La página recibe una sombra ambiental cálida; el dock, los diálogos y los avisos tienen sombras de superposición. Al entrar en escena desaparece la sombra exterior de la página. La luz de las marcas es un tratamiento del texto y del versículo, no una elevación de tarjeta. Los valores exactos están en `extensions.shadows` del sidecar.

## Shapes

La página es casi recta (`sheet`); botones y opciones usan esquinas suaves (`control`), campos y carga de archivos usan `field`, herramientas usan `tool` y diálogos usan `surface`. Las cápsulas de mensajes usan `preset`. Los botones de icono y las reservas circulares emplean un círculo real; la reserva cuadrada comparte las esquinas suaves de los diálogos.

La cinta tiene cola recortada en V. Su forma visible es más pequeña que su botón: conserva un área interactiva de 44 px de ancho. Los iconos son SVG de 24 unidades, trazo de 1.5, remates y uniones redondeados. El signo alfa representa literalmente el griego; no sustituye un icono genérico de navegación. El grabado combina rayos, elipses y líneas finas en tinta gris cálida con una pequeña semilla carmín.

## Components

### Buttons

La acción principal es sólida y sobria: tinta sobre papel invertidos, altura mínima de 52 px y padding horizontal del token del componente. En móvil la entrada a escena se compacta a una altura mínima de 48 px. El hover cambia al carmín profundo. Los botones de texto cambian a carmín; los botones de icono son circulares con una película tenue de tinta al pasar el puntero. Disabled reduce opacidad a .4.

El foco visible usa contorno carmín de 2 px con separación de 4 px. El estado pulsado desplaza el botón 1 px. La respuesta habitual dura .18 s; el easing de transformación es `--ease`.

### Chips

Las opciones Papel/Noche son botones contorneados con muestra circular. El seleccionado conserva un contorno de tinta y fondo de papel translúcido. Las cápsulas de mensaje son atajos de texto, con borde de regla y hover carmín; no representan filtros persistentes.

### Cards / Containers

La página es el contenedor protagonista, con una cinta vertical de 5 px en el borde izquierdo. Los grupos de preparación se separan con reglas en lugar de cajas. Los diálogos nativos usan papel, esquina `surface`, ancho máximo de 480 px y scroll interno acotado a la ventana; la nota griega reduce el máximo a 430 px. El fondo del diálogo se oscurece con tinta cálida translúcida. Cada diálogo toma su nombre accesible del título visible; la nota también vincula su significado.

### Inputs / Fields

Los selects permanecen nativos, transparentes y apoyados en una regla inferior compartida. El campo de mensaje tiene contorno de regla y esquina `field`. Sliders, checks y cursor de escritura usan carmín. La carga de archivos usa borde discontinuo y foco visible del contenedor; las ayudas continúan en tinta secundaria. El error de selección usa carmín profundo, fondo rojo muy tenue y borde translúcido.

### Navigation

El encabezado reúne marca, Mi contenido y ayuda. La selección de modo es una lista dividida por reglas en escritorio y un grupo de tres opciones contorneadas en móvil; selección combina carmín y check. Durante la escena, la cinta abre una barra superior y un dock inferior de hasta 420 px. El dock agrupa herramientas, contexto y avance de capítulo. Sus controles ocultos son `inert`.

Las herramientas se retiran tras cinco segundos; permanecen al dibujar y mientras el foco está dentro de ellas. Escape abre o retira el conjunto. Una sola parada Tab entra a las palabras y las flechas, Inicio y Fin recorren el texto. Esa interacción conserva la página legible y el teclado utilizable sin crear cientos de paradas Tab.

### Scripture emphasis and presenter frame

Una palabra iluminada conserva su tinta y recibe fondo ámbar y dos halos suaves; la primera activación florece una sola vez durante .6 s. El versículo usa una luz más tenue de fondo. Las marcas son independientes y reversibles. El dibujo libre usa línea carmín de 2.2 px con remates redondos sobre SVG; al cambiar la letra o el encuadre se limpia para conservar correspondencia visual.

Solo las palabras con datos asociados reciben subrayado punteado en la herramienta Griego. La nota presenta palabra, término griego, transliteración y significado. El espacio del presentador admite círculo o cuadrado en cualquiera de las cuatro esquinas; la guía discontinua se muestra en preparación y es opcional en escena.

El movimiento reducido anula animaciones y transiciones. No añadir movimiento continuo a la lectura: su desplazamiento automático es una acción elegida, ajustable y pausable mediante gesto manual.

## Do's and Don'ts

### Do:

- **Do** mantener los roles separados de papel, escritorio, tinta de lectura y tinta secundaria.
- **Do** conservar Gelasio y su interlineado amplio al añadir superficies de lectura.
- **Do** combinar color y una señal adicional para comunicar selección, como el check de modo o el contorno de tema.
- **Do** preservar la reserva del presentador cuando su guía se oculta.
- **Do** mantener foco visible, nombres de diálogo y acceso a herramientas mientras se usan con teclado.
- **Do** reutilizar SVG de línea y el grabado geométrico original cuando la ornamentación ayude a enmarcar la página.

### Don't:

- **Don't** convertir cada grupo de ajustes en una tarjeta elevada: la preparación se organiza con reglas y tono.
- **Don't** usar el tamaño de las ayudas compactas para el texto bíblico o para el contenido de las notas.
- **Don't** aplicar brillo al cuerpo completo: la luz corresponde a palabras o versículos marcados.
- **Don't** colocar la imagen del presentador por encima de los versículos ni eliminar su espacio al ocultar la guía.
- **Don't** subrayar como consultable una palabra sin nota griega asociada.
- **Don't** ocultar herramientas que contienen el foco ni reintroducir animaciones bajo movimiento reducido.
