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

Las pruebas de navegador usan Chrome instalado en `/usr/bin/google-chrome` y el servidor de desarrollo en el puerto 4200. Ajusta `playwright.config.ts` si tu equipo tiene otra ruta.

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

## Agregar palabras del griego

Reemplaza **`public/data/griego.json`**. Es opcional; si falta, la lectura funciona sin notas.

```json
{
  "notes": [
    {
      "book": "juan",
      "chapter": 1,
      "verse": 1,
      "word": "palabra exacta en tu versículo",
      "greek": "Texto griego proporcionado por ti",
      "transliteration": "Transliteración proporcionada por ti",
      "meaning": "Significado proporcionado por ti",
      "context": "Explicación opcional proporcionada por ti"
    }
  ]
}
```

`word` puede ser una palabra o una frase. Se busca sin distinguir mayúsculas, respetando tildes y límites de palabra. La misma nota se asocia a todas sus apariciones dentro del versículo especificado. Si hay notas que se solapan, prevalece la primera del archivo. Solo se subrayan palabras con nota en el modo Griego. No hay generación de traducciones ni llamadas a una API externa.

También puedes cargar ambos archivos desde **Mi contenido**, sin modificar el repo. Esa carga es temporal y dura hasta recargar la página; los archivos no se suben a un servidor. Al cargar otra Biblia, se limpian las notas anteriores para evitar asociaciones incorrectas. Límite de cada archivo: 35 MB.

## Preparar y grabar

- **Un recorrido:** selecciona inicio y fin; admite atravesar libros.
- **Un libro:** lee todos sus capítulos. Solo cruza al libro vecino desde su primer o último capítulo.
- **Capítulo a capítulo:** continúa por los libros cargados desde el capítulo elegido.
- **Entrar en escena:** cuenta atrás opcional; después activa la grabación de pantalla del teléfono. No se inicia ninguna captura automáticamente.
- **Cinta roja:** abre o retira herramientas. Se ocultan a los cinco segundos; en Trazo permanecen disponibles.
- **Luz:** toca una palabra para iluminarla; otro toque quita el brillo.
- **Versículo:** toca uno o varios versículos. También puedes tocar sus números en cualquier herramienta salvo Trazo.
- **Trazo:** dibuja con el dedo o lápiz; deshaz el último trazo. Para desplazar manualmente, cambia de herramienta. El dibujo pausa el autoscroll.
- **Griego:** toca una palabra subrayada para mostrar la nota. Una palabra sin datos lo indica, sin inventarlos.
- **Scroll:** activa o pausa el desplazamiento. La velocidad es configurable; un gesto manual lo pausa. Al terminar el capítulo se detiene, sin cambiar de página mientras hablas.
- **Cierre:** se activa al completar un capítulo según la regla elegida, o manualmente con «Cerrar lectura». Puedes personalizar el texto final.

Las marcas se conservan durante el capítulo actual; se limpian al navegar. Cambiar la fuente o el encuadre limpia los dibujos, ya que sus posiciones dejarían de corresponder al texto. La tipografía, el tema, la velocidad, el encuadre y el cierre se guardan en localStorage. No se guardan archivos importados ni marcas.

## Espacio del presentador

Círculo o cuadrado de 72 a 150 píxeles CSS, en cualquiera de las cuatro esquinas. La zona se reserva en una fila superior o inferior junto al encabezado o folio; el área de lectura se ajusta para que **ningún versículo pase detrás de la imagen**, incluso durante autoscroll. Es layout nativo: no requiere medir cada palabra con JavaScript ni añadir una dependencia. La guía se muestra durante la preparación; puedes hacerla visible en la toma.

La app no accede a la cámara. Coloca la imagen con tu herramienta de captura en el espacio reservado.

## Límites y compatibilidad

Interfaz adaptable a teléfono y escritorio; usa Pointer Events, SVG para trazos y requestAnimationFrame para el scroll. Respeta movimiento reducido. Pantalla completa y mantener pantalla despierta dependen del navegador y del contexto seguro; si no están disponibles, la lectura sigue funcionando. No se incluye un service worker: para abrir sin internet se necesita una estrategia de instalación posterior. No hay exportación de video.

Teclado: una sola parada Tab entra al texto; flechas izquierda/derecha recorren palabras, Inicio/Fin van a sus extremos y Enter aplica la herramienta. Escape abre o retira herramientas incluso con foco en una palabra. Fuera de botones, espacio controla autoscroll y las flechas cambian de capítulo. Los diálogos tienen nombres accesibles y cierre nativo con Escape.

El ejemplo instalado contiene Santiago y notas procedentes del lector original de este repo. Está identificado como ejemplo en la preparación. Reemplázalo con tus archivos y su atribución. Las fuentes locales conservan sus licencias en `public/licencias/`.

## Estructura

- `src/app/app.*`: preparación, sesión, navegación y diálogos.
- `src/app/reader.*`: texto, énfasis, dibujo, scroll y encuadre.
- `src/app/content.ts`: contrato, validación y límites de sesión.
- `src/app/engraving.ts`: grabado geométrico original en canvas.
- `src/styles.css`: identidad y respuesta a tamaños.
- `PRODUCT.md`, `DESIGN.md`, `.impeccable/`: contexto de producto y diseño.

Nombre provisional: Verbo.
