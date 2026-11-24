# Fuentes del original: créditos y licencias

Verbo genera las notas del griego y del hebreo (`estudio/herramientas/original/`) con datos de cinco fuentes. Los avisos de cada bloque se copian de los archivos `.toml` de alineación y de las cabeceras de STEPBible; no se parafrasean.

Si redistribuyes los borradores (`estudio/public/data/griego.rvr1960.borrador.json` y `hebreo.rvr1960.borrador.json`) o el léxico (`estudio/herramientas/original/lexico-es.json`), conserva esta lista y el campo `creditos` de los borradores.

Actualizado: 2026-11-24.

## Resumen

| # | Fuente | Qué aporta | Licencia | Titular |
|---|---|---|---|---|
| 1 | Alineaciones RV1909 ↔ original (Clear Bible / BiblioNexus) | Qué palabra griega o hebrea corresponde a cada palabra de la RV1909 (`SBLGNT-RV09-manual`, `WLCM-RV09-manual`) | CC BY 4.0 | BiblioNexus; Clear Bible |
| 2 | SBLGNT | Texto griego del Nuevo Testamento | CC BY 4.0 | Society of Biblical Literature y Logos Bible Software |
| 3 | WLC / UXLC | Texto hebreo del Antiguo Testamento | Uso sin restricciones, con cita (licencia «Custom» en el `.toml`) | Tanach.us |
| 4 | TAGNT, TAHOT, TBESG, TBESH (STEPBible) | Strong, lemas, morfología, transliteración, glosas en inglés y léxico base | CC BY 4.0 | Tyndale House Cambridge; STEPBible.org |
| 5 | RV1909 | Texto español al que se alinea el original | Dominio público | Reina Valera 1909 |

## 1. Alineaciones RV1909 ↔ original (Clear Bible / BiblioNexus)

Avisos de `Clear-Bible/Alignments/data/spa/alignments/RV09/SBLGNT-RV09-manual.toml` y `WLCM-RV09-manual.toml` (los campos son iguales en ambos, salvo el identificador y el ámbito):

```toml
[source.metadata]
copyright = "Copyright (c) 2023 by Clear Bible, Inc."
license = "CC-BY 4.0"

[target]
identifier = "RV09"
license = "Public domain"
name.eng = "Reina Valera 1909"
url = "https://ebible.org/find/details.php?id=spaRV1909"

[target.metadata]
copyright = "Copyright (c) 2023 by BiblioNexus"
license = "CC-BY 4.0"

[alignment]
copyright = "Copyright © 2024 by BiblioNexus"
license = "CC-BY-4.0"
team = "BiblioNexus"
```

Las alineaciones son de BiblioNexus (CC BY 4.0). Los metadatos del original son de Clear Bible (CC BY 4.0).

## 2. SBLGNT

Aviso de `SBLGNT-RV09-manual.toml`:

```toml
[source]
identifier = "SBLGNT"
copyright = "Copyright 2010 by the Society of Biblical Literature and Logos Bible Software."
license = "CC-BY-4.0"
url = "https://sblgnt.com/"
```

## 3. WLC / UXLC (Tanach.us)

Aviso de `WLCM-RV09-manual.toml`:

```toml
[source]
identifier = "WLCM"
copyright = "© 2023 The J. Alan Groves Center for Advanced Biblical Research"
license = "Custom"
licensenotes = "From http://tanach.us/License.html: 'All biblical Hebrew text, in any format, may be viewed or copied without restriction.' Citation of the Tanach.us site as the source of the text is appreciated: Unicode/XML Leningrad Codex: UXLC 1.8 (26.9), Tanach.us Inc., West Redding, CT, USA, April 2023. "
```

El aviso no dice «dominio público». Dice que el texto puede verse y copiarse sin restricción y pide cita. Por eso no se declara como CC BY. Cita pedida: «Unicode/XML Leningrad Codex: UXLC 1.8 (26.9), Tanach.us Inc., West Redding, CT, USA, April 2023».

## 4. STEPBible (Tyndale House Cambridge)

TAGNT (Nuevo Testamento), TAHOT (Antiguo Testamento), TBESG (léxico griego) y TBESH (léxico hebreo). Aviso de sus cabeceras:

> Data created by www.STEPBible.org based on work at Tyndale House Cambridge (CC BY 4.0)
>
> * Attribute the data to Tyndale House and STEPBible.org, and include a link to STEPBible.github.io/STEPBible-Data as the source of this data.
> * Download the data and reformat it for your application
> (You MAY make changes yourself, but you should include a note of changes that can be viewed by those who use your new data)

## 5. Léxico español (obra derivada)

`estudio/herramientas/original/lexico-es.json` es una obra derivada de TBESG y TBESH. Sus campos `gloss` y `short` son glosas y resúmenes en español, traducidos de las glosas inglesas de STEPBible. Cambios respecto a la fuente: traducción al español, selección de glosas y revisión de entradas dentro del proyecto. La traducción la hizo un modelo de IA y la revisó el proyecto, con revisión manual de los casos marcados. Quien reutilice el léxico debe citar a Tyndale House y STEPBible.org, indicar estos cambios y enlazar a STEPBible.github.io/STEPBible-Data.

## 6. RV1909 (texto)

El texto Reina Valera 1909 es de dominio público (campo `license = "Public domain"` del `[target]`). Su empaquetado de alineación es de BiblioNexus (véase la sección 1). Fuente: https://ebible.org/find/details.php?id=spaRV1909

## 7. Dónde aparecen los créditos

- **Borradores:** campo `creditos`, escrito por `estudio/herramientas/original/generar.py` (constante `CREDITOS`): «Notas generadas con datos de Clear Bible (BiblioNexus), STEPBible (Tyndale House), SBLGNT y UXLC · CC BY 4.0 (UXLC: uso libre con cita).»
- **Diálogo Contenido de la app:** la misma línea, bajo las casillas de notas.
- **README de la app:** enlace a este documento.

## Fuera de esta lista

- El texto de la RVR1960 que muestra la app no está cubierto aquí; su aviso lo aporta la Biblia cargada.
- La caché `estudio/herramientas/original/.cache/` no se redistribuye; este documento describe lo que sale en el repo.
