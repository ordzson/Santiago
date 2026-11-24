# Pipeline del original (griego y hebreo)

Genera borradores de notas de la RVR1960 a partir de datos offline. Solo biblioteca estándar de Python 3; siempre `python3 -I <script>`. Las rutas son relativas a la raíz del repo; `HO` = `estudio/herramientas/original/`.

Créditos y licencias de las fuentes: `licencias/FUENTES-ORIGINAL.md`.

## Regla de costo

- Ningún modelo abre enteros los archivos de `HO/.cache/fuentes/` ni `estudio/public/data/RVR1960_vid_149.json`. Usa `head`, `grep` de un versículo o `sed -n` de pocas líneas. El trabajo sobre datos lo hace el código.
- `HO/.cache/` y `estudio/public/data/*_vid_*.json` no se commitean.

## Pasos

Orden para un libro nuevo. Ejemplos con Santiago (`JAS`, NT) y Rut 1 (`RUT --capitulo 1`, AT).

1. **Descargar fuentes.** `python3 -I estudio/herramientas/original/descargar.py`. Baja las fuentes de `fuentes.json` a `HO/.cache/fuentes/` y escribe `manifiesto.json`. Si un archivo ya existe, no se vuelve a bajar.
2. **Enlazar original ↔ STEPBible.** `python3 -I HO/enlace.py nt --libro JAS` (NT) o `python3 -I HO/enlace.py at --libro RUT --capitulo 1` (AT). Escribe `HO/.cache/salida/<libro>.enlace.json` y `.enlace.txt`.
3. **Seleccionar palabras.** `python3 -I HO/seleccion.py --libro JAS` (en el AT, `--capitulo` es obligatorio). Escribe `HO/.cache/salida/<libro>.seleccion.json`. `generar` recalcula la selección, así que este paso es para revisarla.
4. **Léxico en español.**
   - `python3 -I HO/lexico.py preparar --libro JAS`: crea los lotes de los Strong pendientes en `HO/.cache/lotes/` (`JAS-001.json`, …). No rehace lotes que ya existen.
   - `python3 -I HO/lexico.py estado --libro JAS`: cuenta los Strong pendientes.
   - Un modelo responde cada lote en `HO/.cache/lotes/<lote>.respuesta.json`, siguiendo `HO/instrucciones-traduccion.md`.
   - `python3 -I HO/lexico.py incorporar HO/.cache/lotes/JAS-001.respuesta.json`: valida la respuesta contra su lote y la fusiona en `HO/lexico-es.json`.
   - `python3 -I HO/lexico.py revision --libro JAS`: escribe `HO/.cache/salida/JAS.revision.txt` y `HO/reportes/JAS.revision-pendiente.md`, la lista de glosas a revisar.
   - `python3 -I HO/lexico.py aplicar-revision <respuesta de revisión>`: valida las glosas revisadas y las aplica. No se puede reejecutar sobre lo ya aplicado.
5. **Exportar la RVR1960 de trabajo.** `python3 -I HO/rvr1960.py exportar --libros JAS,RUT` escribe `HO/.cache/salida/rvr1960.biblia.json`. Es exactamente la Biblia que carga la app, así que lo que se valida es lo que se muestra.
6. **Generar borradores.** `python3 -I HO/generar.py --libro JAS` y `python3 -I HO/generar.py --libro RUT --capitulo 1`.
   - Reemplaza solo las notas de ese libro (o capítulo) en `estudio/public/data/griego.rvr1960.borrador.json` (NT) o `hebreo.rvr1960.borrador.json` (AT). Conserva el resto.
   - Escribe el campo `creditos` (constante `CREDITOS` de `generar.py`, la misma línea que muestra la app).
   - Escribe `HO/reportes/<LIBRO>.revisar.md` y `.resumen.txt` (`RUT-1` para Rut 1).
7. **Validar contra la app.** Con la Biblia del paso 5:
   `node --experimental-strip-types estudio/herramientas/original/validar-app.ts estudio/herramientas/original/.cache/salida/rvr1960.biblia.json estudio/public/data/griego.rvr1960.borrador.json estudio/public/data/hebreo.rvr1960.borrador.json`
   Debe imprimir `N notas · N encontradas · 0 faltan`. Sale con 1 si falta alguna.
8. **Medir.** `python3 -I HO/medir.py --libro JAS` compara con la muestra de oro (`HO/oro/santiago.json`) y escribe `HO/reportes/JAS.medicion.md`; la última línea es `alta: n · precisión p %`. Para la transferencia de palabras, `python3 -I HO/transferir.py medir --libro JAS`.

## Pruebas

- `python3 -I estudio/herramientas/original/pruebas.py`: unittest de `HO/tests/` con fixtures pequeñas.
- `pnpm --dir estudio test` incluye `borradores.test.ts`: los borradores deben pasar `parseOriginal`.
- `node scripts/verify.mjs quick` tras cambios y `full` antes de cerrar.

## Dónde mirar

- `HO/.cache/salida/`: intermedios. `HO/.cache/lotes/`: lotes de traducción.
- `HO/reportes/`: lo que hay que revisar a mano.
