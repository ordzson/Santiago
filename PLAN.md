# Plan de hitos — Verbo · Estudio de lectura (`estudio/`)

<!-- Formato de /hito. Solo el hito actual va detallado; los demás, una línea. -->

## Hitos cerrados

- [x] H1 — Escena de video: luz, gestos y cierre (2026-11-22, ba5b01a)

## Hito actual: H2 — Notas del original para RVR1960 (piloto Santiago + Rut 1)

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
- [ ] O4 — Transferencia RV1909 → RVR1960 y borradores
  - Verificación: quick
  - Commit: `feat(herramientas): transferencia a RVR1960 y borradores de Santiago y Rut 1`
  - [ ] T17 — Algoritmo de transferencia · Modelo: sonnet, esfuerzo medium
    - Leer: §Contratos; `HO/fuentes.py`, `HO/rvr1960.py`, `HO/config.json`; `estudio/src/app/content.ts` (`tokenize`); muestra: RV09 y RVR1960 de JAS 1:4 y 1:5 (vía `grep`/`texto_versiculo`).
    - Archivos: `HO/transferir.py`, `HO/equivalencias.json`, `HO/tests/test_transferir.py`.
    - Hacer: `encontrar_app(texto, word)` = port exacto de la búsqueda de `tokenize` (minúsculas `es`, `indexOf`, sin letra `\p{L}` a ambos lados) → lista de posiciones. `transferir(tokens_rv09_versiculo, texto_rvr, destinos_por_fuente, pistas_es)` → por id fuente `{word, confidence, regla}` o `{regla}` si falla. Tokens RVR1960 = `[^\W\d_]+` con posiciones; RV09 = tokens no excluidos. Clave = NFD sin diacríticos, minúsculas, mapeada por `equivalencias.json` (grupos de formas equivalentes; inicial: `[["mas","pero","empero"],["crio","creo"],["aqueste","este"],["aquesta","esta"],["do","donde"],["cuasi","casi"],["agora","ahora"],["mesmo","mismo"],["ansi","asi"],["obscuridad","oscuridad"],["entonce","entonces"]]`). `SequenceMatcher(autojunk=False)`: bloque `equal` → regla `igual`; `replace` n:n con clave equivalente → `equivalencia`; `replace` 1:1 cuyo token RVR1960 comparte los 4 primeros caracteres de la clave con la glosa española (`pistas_es`) → `pista`; resto → `sin_par`. Word: índices RVR1960 mapeados, sin `vacias_es` en los bordes; contiguos → `texto[ini:fin]`; no contiguos → el token más largo, regla `no_contiguo`. Si el `word` aparece en otra posición del versículo mapeada a otro strong → `ambiguo`. Si la similitud del versículo completo (`ratio()`) < 0,5 → todo el versículo `versiculo_distinto`. Confianza: regla en `config.reglas_alta` → `alta`; `equivalencia`/`pista` → `media`; resto → `revisar`. Verificar siempre `encontrar_app(texto, word)` no vacío; si vacío, falla `no_literal`. Además `comparar_versificacion(usfm)`: conteo de versículos por capítulo RV09 vs RVR1960; capítulos distintos → sus notas a `revisar` y listados.
    - Hecho cuando: pruebas OK (un caso `igual`, uno `equivalencia` mas→pero, uno `no_contiguo`, uno `ambiguo`, uno `no_literal`); `python3 -I HO/transferir.py medir --libro JAS` imprime conteos por confianza y regla, con ≥ 80 % de tokens seleccionados con `word` (si menos: `parcial` con los 10 fallos más frecuentes).
  - [ ] T18 — CLI `generar` y reporte de revisión · Modelo: haiku, esfuerzo xhigh
    - Leer: §Contratos (contrato del borrador); firmas de `HO/seleccion.py`, `HO/enlace.py`, `HO/lexico.py`, `HO/transferir.py`, `HO/rvr1960.py`.
    - Archivos: `HO/generar.py`, `HO/tests/test_generar.py`.
    - Hacer: `python3 -I HO/generar.py --libro JAS [--capitulo N]`: enlace → selección → transferencia → nota con el contrato. `original`/`transliteration`: si `config.original == "lema"`, lema y translit del léxico STEPBible; si `"forma"`, forma y translit de TAGNT/TAHOT. `meaning` = `gloss` de `lexico-es.json`; si faltan strongs, termina con error listándolos («corre lexico.py preparar»). `context: ""`. `source`: `"RV09 manual → RVR1960 (<regla>)"`. Solo entran notas con `word` válido; dos notas con el mismo `word` en un versículo → queda la de mayor prioridad, la otra al reporte como `duplicado`. NT → `griego.rvr1960.borrador.json`, AT → `hebreo.rvr1960.borrador.json`, reemplazando solo el libro/capítulo generado. Reportes: `HO/reportes/<JAS|RUT-1>.revisar.md` (tabla por versículo: ref · versículo RVR1960 · lema · glosa · word propuesto o «—» · regla; incluye fallos y duplicados) y `HO/reportes/<…>.resumen.txt` (conteos por confianza y regla, % tokens alineados).
    - Hecho cuando: pruebas OK; `generar.py --libro JAS` y `generar.py --libro RUT --capitulo 1` crean ambos borradores y reportes.
  - [ ] T19 — Validación con el código de la app · Modelo: haiku, esfuerzo xhigh
    - Leer: `estudio/src/app/content.ts`, `estudio/tests/content.test.ts` (estilo de prueba).
    - Archivos: `HO/validar-app.ts`, `estudio/tests/borradores.test.ts`.
    - Hacer: `validar-app.ts <biblia.json> <borrador.json>…` importa `parseBible`, `parseOriginal`, `tokenize` de `../../src/app/content.ts`; idioma por prefijo del nombre (`griego`/`hebreo`); por cada nota busca libro/capítulo/versículo y comprueba que `tokenize(texto, [nota])` marque algún token. Imprime `N notas · N encontradas · K faltan` (y las que faltan); sale 1 si `K > 0`. `borradores.test.ts`: `parseOriginal` acepta los dos borradores commiteados sin lanzar.
    - Hecho cuando: `python3 -I HO/rvr1960.py exportar --libros JAS,RUT --salida HO/.cache/salida/rvr1960.biblia.json && node --experimental-strip-types estudio/herramientas/original/validar-app.ts estudio/herramientas/original/.cache/salida/rvr1960.biblia.json estudio/public/data/griego.rvr1960.borrador.json estudio/public/data/hebreo.rvr1960.borrador.json` → `0 faltan`; `pnpm --dir estudio test` pasa.
- [ ] O5 — Medición, créditos y cierre
  - Verificación: full
  - Commit: `feat(herramientas): medición contra oro y créditos de fuentes`
  - [ ] T20 — Medición contra la muestra de oro · Modelo: haiku, esfuerzo xhigh
    - Leer: §Contratos; `HO/oro/santiago.json` (formato), firmas de `HO/generar.py`.
    - Archivos: `HO/medir.py`, `HO/tests/test_medir.py`.
    - Hacer: une oro y borrador por `(ref, strong_base)`. Correcta si, comparando tokens en minúsculas, el `word` del borrador ⊆ el de oro o el de oro ⊆ el del borrador; oro `null` con nota → incorrecta. Tabla por confianza y por regla: `n · correctas · precisión`; cobertura (oro con nota / oro no nulo); % de tokens seleccionados con alineación RV09 y % con `word`. Escribe `HO/reportes/JAS.medicion.md`; última línea `alta: n · precisión p %`.
    - Hecho cuando: pruebas OK; `python3 -I HO/medir.py --libro JAS` escribe el reporte.
  - [ ] T21 — Ajuste de reglas si `alta` < 95 % · Modelo: haiku, esfuerzo xhigh
    - Leer: `HO/reportes/JAS.medicion.md`, `HO/config.json`.
    - Archivos: `HO/config.json`, borrador y reportes regenerados.
    - Hacer: si `alta` ≥ 95 %, nada (tarea hecha). Si no: quitar de `reglas_alta` toda regla con precisión < 95 % en la tabla por regla; si `igual` es la culpable, añadir `"alta_requiere_unico": true` y en `transferir.py` exigir que el `word` aparezca una sola vez en el versículo para `alta`. Regenerar JAS, revalidar (T19) y re-medir. Si sigue < 95 % → `bloqueada` (decide el usuario).
    - Hecho cuando: `tail -1 HO/reportes/JAS.medicion.md` → precisión ≥ 95 %; T19 sigue en `0 faltan`.
  - [ ] T22 — Créditos, licencias y guía · Modelo: haiku, esfuerzo xhigh
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
- 2026-11-24 plan: el TSV de RV09 trae `source_verse`: Clear ya resuelve original↔versificación española (p. ej. Sal 3:1 RV09 = 3:2 hebreo). Solo falta RV09↔RVR1960 (misma tradición): se comparan conteos (T17). TVTMS se descarga, pero se aplica en el hito que trate un libro con diferencias.
- 2026-11-24 plan: `SBLGNT.tsv` de Clear ya trae strong, lema, morfología y glosa. El enlace con TAGNT aporta el dStrong (clave del léxico), la transliteración y la columna «Spanish translation», que sirve de pista. Un token no enlazado sigue con los datos SBLGNT.
- 2026-11-24 plan: `RVR1960_vid_149.json` trae `items` con líneas ya limpias (sin encabezados ni notas `#`). Se usa eso en lugar del HTML.
- 2026-11-24 plan: `original` = lema por defecto (coincide con `meaning`, que es la glosa del léxico). Se cambia con `config.original = "forma"`.

## Próximos hitos

- H3 (sin detallar) — Retomar grabación: guardar marcas y elegidos de la sesión y poder volver a ellos tras recargar.
- H4 — Variantes de portada/cierre (paletas de luz, posición del título) elegibles en la preparación.
- H5 — Instalación offline (PWA) para grabar sin red.
- H6 — Notas del original RVR1960 para el resto del NT y AT (aplicando TVTMS donde los conteos difieran), con el mismo pipeline.
