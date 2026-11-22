# Verbo · Estudio de lectura

App Angular independiente del lector Santiago. Prepara lecturas bíblicas para grabar **la pantalla del teléfono**. El sistema del teléfono o tu herramienta externa captura el video y añade tu imagen; Verbo presenta el texto y reserva su espacio.

## Ejecutar

Requiere Node compatible con Angular 21 (por ejemplo 22.12 o superior dentro de la rama 22) y pnpm.

```sh
cd estudio
pnpm install
pnpm dev
```

Abre `http://localhost:4200`. Para probar desde el teléfono conectado a la misma red, usa la dirección de red que imprime Angular. `pnpm build` produce `dist/verbo/browser/` para hosting estático. No hay backend ni cuenta.

```sh
pnpm test
pnpm exec playwright test
```

`pnpm test` ejecuta las pruebas de lógica pura (sin navegador). `pnpm exec playwright test` arranca su propio servidor de desarrollo: no hace falta tener `pnpm dev` abierto. Las pruebas de navegador usan Chrome instalado en `/usr/bin/google-chrome`; ajusta `playwright.config.ts` si tu equipo tiene otra ruta.

## Agregar tu Biblia al repo

Reemplaza **`public/data/biblia.json`**. Su orden define el orden de los libros. Los capítulos y versículos deben tener números positivos crecientes, sin duplicados. `id` es estable y único; se usa para asociar las notas.

```json
{
  "version": "Nombre de tu versión",
  "name": "Nombre de la colección",
  "demo": false,
  "copyright": "Atribución del texto que vas a usar",
  "books": [
    {
      "id": "juan",
      "name": "Juan",
      "chapters": [
        {
          "number": 1,
          "title": "Título opcional",
          "verses": [
            { "number": 1, "text": "Aquí va el texto de tu versión." }
          ]
        }
      ]
    }
  ]
}
```

El texto se muestra literalmente mediante interpolación de Angular; no se interpreta HTML. Si tus JSON existentes tienen otra estructura, adapta el importador en `src/app/content.ts` o transforma tus archivos a este contrato.

## Agregar palabras del idioma original (griego y hebreo)

Las notas de palabras son del **idioma original** del libro: griego para el Nuevo Testamento y hebreo para el Antiguo. Cada idioma vive en su propio archivo, opcional e independiente. Si falta alguno, la lectura funciona sin sus notas.

- **`public/data/griego.json`**: notas del griego.
- **`public/data/hebreo.json`**: notas del hebreo. El arameo se carga aquí mismo: usa la misma escritura.

Los dos tienen la misma forma. El campo del término es `original`; también se aceptan los alias `greek` (en el archivo del griego) y `hebrew` (en el del hebreo), para no romper archivos anteriores.

```json
{
  "notes": [
    {
      "book": "juan",
      "chapter": 1,
      "verse": 1,
      "word": "palabra exacta en tu versículo",
      "original": "λόγος",
      "transliteration": "Transliteración proporcionada por ti",
      "meaning": "Significado proporcionado por ti",
      "context": "Explicación opcional proporcionada por ti"
    }
  ]
}
```

Ejemplo de `hebreo.json`, con vocales (niqqud) y acentos, que se conservan tal cual:

```json
{
  "notes": [
    {
      "book": "genesis",
      "chapter": 1,
      "verse": 1,
      "word": "principio",
      "original": "בְּרֵאשִׁית",
      "transliteration": "bereshit",
      "meaning": "Significado proporcionado por ti"
    }
  ]
}
```

Reglas comunes:

- `word` puede ser una palabra o una frase del versículo en español. Se busca sin distinguir mayúsculas, respetando tildes y límites de palabra. La misma nota se asocia a todas sus apariciones dentro del versículo indicado.
- **El idioma lo fija el archivo, no se adivina.** Para evitar cargar un archivo en la casilla equivocada, el término se valida por escritura: en el griego debe haber al menos un carácter griego (U+0370–U+03FF o U+1F00–U+1FFF); en el hebreo, uno hebreo (U+0590–U+05FF o U+FB1D–U+FB4F). Si no, el error nombra la nota.
- Ambas listas se combinan. Si dos notas se solapan en un versículo, prevalece la primera según el orden griego, luego hebreo, y dentro de cada archivo la primera.
- Solo se subrayan las palabras con nota cuando «Idioma original» está activo. Una palabra sin datos lo indica, sin inventarlos. No hay generación de traducciones ni llamadas a una API externa.
- Al abrir una nota, el término va en su idioma (`lang="grc"` o `lang="he"`). El hebreo se muestra de derecha a izquierda, centrado y más grande (44 px), con Noto Serif Hebrew, que conserva niqqud y cantilación. La transliteración y el significado siguen de izquierda a derecha.

También puedes cargar los archivos desde **Mi contenido** (casillas «Cargar notas del griego» y «Cargar notas del hebreo»), sin modificar el repo. Esa carga es temporal y dura hasta recargar la página; los archivos no se suben a un servidor. Al cargar otra Biblia, se limpian las notas de **ambos** idiomas para evitar asociaciones incorrectas. Límite de cada archivo: 35 MB.

## Preparar y grabar

**En la preparación**

- **Un recorrido:** selecciona inicio y fin; admite atravesar libros.
- **Un libro:** lee todos sus capítulos. Solo cruza al libro vecino desde su primer o último capítulo.
- **Capítulo a capítulo:** continúa por los libros cargados desde el capítulo elegido.
- **La portada:** título del episodio (hasta 60 caracteres; vacío muestra solo el rótulo), duración de 3 a 10 s y «Ver portada» para probarla. El rótulo sale solo del recorrido («Santiago 1 – 3», «Santiago 4 – 1 Pedro 2»).
- **Entrar en escena:** cuenta atrás opcional de 3 s; después, la portada y la lectura. No se inicia ninguna captura automáticamente: activa tú la grabación de pantalla del teléfono.

**La escena**

1. **Portada.** Tras la cuenta atrás, un haz de luz cae desde arriba con polvo dorado; aparecen el título y el rótulo, y la luz inunda la página. No se puede saltar: dura lo que hayas configurado.
2. **Lectura.** Solo quedan dos cintas colgando del borde superior. La roja abre o retira el panel de ajustes; la oscura, con hilo dorado, inicia o pausa el desplazamiento automático. Con el encuadre del presentador arriba a la derecha, pasan a la izquierda.
3. **Cierre.** Muestra los versículos elegidos y el mensaje final; después, un fundido lento a negro.

**Gestos sobre el texto** (ratón o dedo, sin herramientas que elegir)

- **Mantener 1,35 s** un versículo: lo resalta con luz de versículo y una ráfaga de partículas. Repetirlo lo quita (y borra sus palabras marcadas). Desde 0,35 s se ve cómo «carga» la luz durante 1 s.
- **Arrastrar** tras 1,35 s: resalta (o quita) todos los versículos que toca el dedo. Cerca del borde, el texto se desplaza solo. Si te mueves antes de 1,35 s, es un desplazamiento normal y no pasa nada.
- **Tocar una palabra** de un versículo resaltado o elegido: alterna su marcador. Fuera de esos versículos no hace nada.
- **Mantener 4 s** sin soltar: elige el versículo para el cierre («hoja de oro», con marcapáginas). Es independiente del resaltado, que vuelve a su estado anterior.
- **Idioma original:** con el interruptor del panel (α, א o «α א» según el libro) activado, tocar una palabra subrayada abre su nota; tiene prioridad sobre el marcador.
- **Teclado:** con foco en una palabra, `Enter` equivale al toque, `H` alterna el resaltado del versículo y `E` alterna el elegido. Los avisos («Versículo 3 resaltado») van a una región accesible oculta, nunca a un aviso visible que saldría en el video.

**Panel de ajustes.** Idioma original, «Limpiar marcas» (resaltados y palabras del capítulo actual; no toca los elegidos), el contador «N para el cierre», la pista de gestos y la navegación de capítulo («Cerrar lectura» incluido). Se retira a los cinco segundos. Escape lo abre o cierra.

**Cierre y fundido.** Se activa al completar un capítulo según la regla elegida, o manualmente con «Cerrar lectura». Muestra, en orden canónico, los versículos elegidos del tramo (una cita grande, o varios que ajustan su tamaño hasta caber) y tu mensaje final. Un toque lo funde a negro en 6 s; los toques durante el fundido se ignoran. En negro, tras una breve guarda, otro toque vuelve a la preparación. «Continuar lectura» empieza un tramo nuevo, sin los elegidos anteriores.

Las marcas y los elegidos duran lo que la escena: no se guardan entre sesiones. Los resaltados se limpian al cambiar de capítulo; los elegidos sobreviven hasta el cierre de su tramo. La tipografía, el tema, la velocidad, el encuadre, la portada y el cierre se guardan en localStorage. No se guardan archivos importados ni marcas.

## Espacio del presentador

Círculo o cuadrado de 72 a 150 píxeles CSS, en cualquiera de las cuatro esquinas. La zona se reserva en una fila superior o inferior junto al encabezado o folio; el área de lectura se ajusta para que **ningún versículo pase detrás de la imagen**, incluso durante autoscroll. Es layout nativo: no requiere medir cada palabra con JavaScript ni añadir una dependencia. La guía se muestra durante la preparación; puedes hacerla visible en la toma.

La app no accede a la cámara. Coloca la imagen con tu herramienta de captura en el espacio reservado.

## Límites y compatibilidad

Interfaz adaptable a teléfono y escritorio; usa Pointer Events, Canvas 2D para las partículas (sin dependencias) y requestAnimationFrame para el scroll. Con movimiento reducido no hay partículas ni desplazamientos: la portada es una composición fija y el fundido a negro se conserva, porque es el cierre buscado. Pantalla completa y mantener pantalla despierta dependen del navegador y del contexto seguro; si no están disponibles, la lectura sigue funcionando. No se incluye un service worker: para abrir sin internet se necesita una estrategia de instalación posterior. No hay exportación de video.

Teclado: una sola parada Tab entra al texto; flechas izquierda/derecha recorren palabras, Inicio/Fin van a sus extremos, y Enter, H y E equivalen a los gestos (ver arriba). Escape abre o retira el panel incluso con foco en una palabra. Fuera de botones, espacio controla autoscroll y las flechas cambian de capítulo. Los diálogos tienen nombres accesibles y cierre nativo con Escape.

El ejemplo instalado contiene Santiago y notas del griego procedentes del lector original de este repo; no incluye notas del hebreo. Está identificado como ejemplo en la preparación. Reemplázalo con tus archivos y su atribución. Las fuentes locales (Gelasio, Noto Serif, Noto Serif Hebrew y Archivo) conservan sus licencias en `public/licencias/`.

## Estructura

- `src/app/app.*`: preparación, sesión, navegación y diálogos.
- `src/app/reader.*`: texto, marcas, gestos de pulsación, scroll y encuadre.
- `src/app/intro.ts`, `title-card.ts`, `lumen.ts`, `particles*.ts`, `ending*.ts`: portada, luz, partículas y cierre.
- `src/app/press.ts`, `chosen.ts`: máquina de pulsación y versículos elegidos.
- `src/app/content.ts`: contrato, validación y límites de sesión.
- `src/app/engraving.ts`: grabado geométrico original en canvas.
- `src/styles.css`: identidad y respuesta a tamaños.
- `PRODUCT.md`, `DESIGN.md`, `.impeccable/`: contexto de producto y diseño.

Nombre provisional: Verbo.
