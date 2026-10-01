# Epístola de Santiago — lector de estudio

Herramienta para estudiar **Santiago 1 al 5** en el teléfono, página por página. Usa el texto de la Nueva Biblia de las Américas (NBLA) e incluye notas del griego, preguntas para observar y aplicar, referencias, repaso de cada capítulo y grabados hechos a mano con código.

## Abrirla

Abre **`index.html`** en cualquier navegador, en el teléfono o en la computadora. Es un solo archivo que lleva dentro el texto, los dibujos y las fuentes, y funciona sin internet.

Para compartirla puedes enviar ese archivo o subirlo a un sitio de páginas estáticas, como GitHub Pages, Netlify o el hosting de tu iglesia. Con `index.html#cap3` se abre directamente el capítulo 3; funciona igual del 1 al 5.

El avance de lectura se guarda en el navegador de cada dispositivo. Si se borran los datos del sitio, se pierde el avance, pero el contenido no cambia.

## Qué hay en la carpeta

```
index.html                 la herramienta completa, lista para abrir
texto/santiago-1…5.txt     el texto NBLA de cada capítulo, tal como se pegó
src/
  pagina.html              estructura: pantalla de inicio, índice y lector
  estilo.css               colores (claro y oscuro), tipografías y diseño
  base.js                  utilidades compartidas e iconos
  lector.js                inicio, índice, páginas, notas, avance y navegación
  datos/santiago-1…5.js    páginas, notas del griego, preguntas, repaso y oración
  grabados/motor.js        herramientas de dibujo: trazos, tramas, bandas y aves
  grabados/santiago-1…5.js viñetas de cada página y portada de cada capítulo
  grabados/inicio.js       el diente de león de la pantalla de inicio
fuentes/                   Noto Serif, Gelasio y Archivo (se incluyen en index.html)
licencias/                 licencias de las fuentes (SIL Open Font License)
herramientas/
  construir.py             vuelve a generar index.html
  verificar.py             revisa el texto y las notas antes de compartir
  texto_nbla.py            lee el formato del texto pegado
```

## Cambiar algo y volver a construir

Necesitas Python 3. No hace falta instalar nada más.

1. Edita los archivos de `src/` o de `texto/`.
2. En la carpeta del proyecto, ejecuta `python3 herramientas/construir.py`.
3. Después ejecuta `python3 herramientas/verificar.py`.

`construir.py` genera un `index.html` nuevo. `verificar.py` confirma que el archivo tiene exactamente el texto de `texto/`, que las páginas cubren todos los versículos sin huecos y que cada nota del griego apunta a palabras que de verdad están en su versículo.

### Editar notas, preguntas o la oración

Cada capítulo está en `src/datos/santiago-N.js`. Cada página tiene su rango de versículos, su título, su viñeta, sus notas y sus preguntas:

```js
{ sec: 's1', vv: [3, 4], title: 'El freno y el timón', vig: 'ship',
  notes: [
    N(3, 'freno', 'χαλινός', 'chalinos', 'freno, bocado', 'Un pedazo de metal en la boca…'),
  ],
  observe: { q: 'Pregunta…', a: 'Respuesta…' },
  apply: 'Pregunta para aplicar…',
  links: [['Proverbios 18:21', 'Descripción breve.']] }
```

En `N(versículo, 'palabra', …)`, la palabra debe aparecer tal cual en ese versículo, con las mismas tildes. Si cambias el texto bíblico y una nota deja de coincidir, `verificar.py` te avisa.

Para cambiar el texto de una pregunta o de una explicación, escribe entre las comillas simples. Si necesitas un apóstrofo dentro, escríbelo como `\'`.

### Cambiar el texto bíblico

El texto sale de `texto/santiago-N.txt`, en el mismo formato en que se copia de la web:

- Los títulos de sección van solos en su línea.
- Cada versículo empieza con su número, con o sin espacio después.
- El primer versículo puede llevar el número del capítulo.

Los enlaces de notas al pie copiados de BibleGateway se ignoran.

### Los dibujos

Todo se dibuja con código en `<canvas>`, con los colores del tema, así que cambia solo entre modo claro y oscuro.

- `grabados/motor.js` tiene las herramientas de dibujo: `band()` para las franjas de líneas, `hatch()` para las tramas, `rough()` para los trazos temblorosos y `bird()` para las aves.
- Cada `grabados/santiago-N.js` añade sus viñetas a `VIG` (por ejemplo `VIG.ship`) y su portada en `COVERS[N]`.
- Algunas piezas se comparten entre capítulos. `walker()` y `road()` están en el capítulo 4 y se usan también en el 2 y el 5. `polyPath()` y `sketch()` están en el capítulo 1.
- El rojo se reserva para un solo detalle por dibujo: el timón, el cordón de Rahab, el sol sobre el mar.

### Otro libro o más capítulos

`lector.js` está hecho para Santiago 1 al 5. Para otro libro hay que:

1. Cambiar en `lector.js` la lista `ORDER` y los datos de `META`: tema, resumen, cantidad de versículos y la semilla y el recorte de cada portada para su miniatura.
2. Cambiar los textos que dicen «Santiago».
3. Añadir sus archivos en `texto/`, `src/datos/` y `src/grabados/`.
4. Ajustar las listas `CAPITULOS` y `GRABADOS` en `construir.py`.

## Derechos

**Texto bíblico.** Nueva Biblia de las Américas (NBLA), Copyright © 2005 por The Lockman Foundation. El permiso general de la NBLA para citar sin autorización escrita tiene límites; entre ellos, que lo citado no forme un libro completo de la Biblia. Esta herramienta contiene la carta de Santiago completa. Si la vas a publicar o distribuir abiertamente, consulta los términos de uso en nuevabiblia.com o pide permiso a The Lockman Foundation. Esto es información general, no asesoría legal.

**Fuentes.** Noto Serif, Gelasio y Archivo se distribuyen con la licencia SIL Open Font License. Los textos de licencia están en `licencias/`.

**Material de estudio.** Las notas del griego, las preguntas, las oraciones y los grabados son material de estudio y no forman parte del texto bíblico.
