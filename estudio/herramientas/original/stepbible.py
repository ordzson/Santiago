#!/usr/bin/env python3
"""Lectores de STEPBible (TAGNT, TAHOT, TBESG y TBESH) desde la caché.

Uso: python3 -I estudio/herramientas/original/stepbible.py resumen --libro JAS
Imprime «tagnt N · SBL N» (NT) o «tahot N · segmentos N» (AT) para el libro indicado.

Las funciones leen de HO/.cache/fuentes/STEPBible/ (descargada por descargar.py). Todas
aceptan `raiz=` para leer otro árbol con la misma estructura (lo usan las pruebas con fixtures).
Nunca se abre un archivo entero para mostrarlo: el trabajo sobre datos lo hace el código.
Solo biblioteca estándar. Contratos: PLAN.md §Contratos (Strong, referencias).
"""
import argparse
import glob
import html
import os
import re
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

from libros import LIBROS, numero, step, strong_canon  # noqa: E402

CACHE = os.path.join(BASE, ".cache", "fuentes")
STEP = os.path.join("STEPBible", "STEPBible-Data")
OT_NT = os.path.join(STEP, "Translators Amalgamated OT+NT")
LEXICONES = os.path.join(STEP, "Lexicons")
LIMITE_DEFINICION = 200
ULTIMO_AT = 39  # 1–39 = AT, 40–66 = NT

# Abreviatura de STEPBible («Act», «Jhn») → número canónico, para leer el rango del nombre de archivo.
_NUMERO_STEP = {step(codigo): numero(codigo) for codigo in LIBROS}
_RANGO = re.compile(r"^TA(?:GNT|HOT) ([A-Za-z0-9]+)-([A-Za-z0-9]+) ")
_FILA_REF = re.compile(r"^([1-3]?[A-Z][a-z]{2})\.(\d+)\.(\d+)(?:\((\d+)\.(\d+)\))?#(\d+)=")
_FILA_LEX = re.compile(r"^[GH]\d")
_FORMA_TRANSLIT = re.compile(r"^(.*?)\s*\((.*)\)$")
_REF_HTML = re.compile(r"<ref[^>]*>.*?</ref>", re.IGNORECASE | re.DOTALL)
_BR = re.compile(r"<br\s*/?>", re.IGNORECASE)
_ETIQUETA = re.compile(r"<[^>]+>")


def _ruta_ot_nt(prefijo, n, raiz):
    """Archivo TAGNT o TAHOT que cubre el libro `n`, según el rango de su nombre («TAGNT Act-Rev - …»)."""
    for ruta in sorted(glob.glob(os.path.join(raiz or CACHE, OT_NT, f"{prefijo} *.txt"))):
        m = _RANGO.match(os.path.basename(ruta))
        if not m:
            continue
        inicio = _NUMERO_STEP.get(m.group(1))
        fin = _NUMERO_STEP.get(m.group(2))
        if inicio and fin and inicio <= n <= fin:
            return ruta
    raise FileNotFoundError(f"no hay archivo {prefijo} para el libro {n} en la caché (¿descargar.py?)")


def _ruta_lexico(lengua, raiz):
    coincidencias = sorted(glob.glob(os.path.join(raiz or CACHE, LEXICONES, f"TBES{lengua} *.txt")))
    if not coincidencias:
        raise FileNotFoundError(f"no hay léxico TBES{lengua} en la caché (¿descargar.py?)")
    return coincidencias[0]


def _recorrer(prefijo, codigo, raiz):
    """Filas de TAGNT/TAHOT del libro como (match, campos), leídas en streaming."""
    prefijo_libro = step(codigo) + "."
    with open(_ruta_ot_nt(prefijo, numero(codigo), raiz), encoding="utf-8") as f:
        for linea in f:
            if not linea.startswith(prefijo_libro):
                continue
            m = _FILA_REF.match(linea)
            if m is None:
                continue
            campos = linea.rstrip("\r\n").split("\t")
            campos += [""] * (9 - len(campos))
            yield m, campos


def _ref(codigo, capitulo, versiculo):
    return f"{codigo}.{int(capitulo)}.{int(versiculo)}"


def _refs(codigo, m):
    """(ref_es, ref_orig): la de STEPBible (NRSV) y la hebrea entre paréntesis si la hay."""
    ref_es = _ref(codigo, m.group(2), m.group(3))
    ref_orig = _ref(codigo, m.group(4), m.group(5)) if m.group(4) else ref_es
    return ref_es, ref_orig


def _forma_y_translit(valor):
    """«κυρίου (kuriou)» → («κυρίου», «kuriou»). Sin paréntesis, translit vacía."""
    m = _FORMA_TRANSLIT.match(valor)
    return (m.group(1), m.group(2)) if m else (valor, "")


def _dividir(valor):
    """Segmentos de un campo de TAHOT separados por «/»."""
    return valor.split("/") if valor else []


def _seg(lista, i):
    return lista[i] if i < len(lista) else ""


def leer_tagnt(usfm, raiz=None):
    """Filas de TAGNT del libro: `{ref_es, ref_orig, n, forma, translit, dstrong, morf, lema, glosa, ediciones, es}`.

    Refs en formato del contrato («JAS.1.1»). `n` = número de palabra (`#04` → 4). `es` = traducción
    española de STEPBible (columna 8). `ediciones` = texto tal cual («NA28+…+SBL+…»).
    """
    codigo = usfm.strip().upper()
    filas = []
    for m, campos in _recorrer("TAGNT", codigo, raiz):
        forma, translit = _forma_y_translit(campos[1])
        dstrong, _, morf = campos[3].partition("=")
        lema, _, glosa = campos[4].partition("=")
        ref_es, ref_orig = _refs(codigo, m)
        filas.append({
            "ref_es": ref_es,
            "ref_orig": ref_orig,
            "n": int(m.group(6)),
            "forma": forma,
            "translit": translit,
            "dstrong": dstrong,
            "morf": morf,
            "lema": lema,
            "glosa": glosa,
            "ediciones": campos[5],
            "es": campos[8],
        })
    return filas


def leer_tahot(usfm, raiz=None):
    """Filas de TAHOT del libro: mismas claves que `leer_tagnt` más `segmentos`.

    Cada palabra hebrea trae segmentos separados por «/» (prefijos y raíz). `segmentos` es
    `[{dstrong, morf, hebreo, translit}]`, con `{}` quitadas de dstrong. En la fila, `dstrong` y `morf`
    son los del segmento con la raíz (entre llaves) o, si no hay, los del último segmento.
    `forma` y `translit` van sin separadores; `glosa` sin «/». `lema`, `ediciones` y `es` van vacíos
    (TAHOT no los trae).
    """
    codigo = usfm.strip().upper()
    filas = []
    for m, campos in _recorrer("TAHOT", codigo, raiz):
        hebreo = _dividir(campos[1])
        translit = _dividir(campos[2])
        glosa = _dividir(campos[3])
        dstrongs = _dividir(campos[4])
        morfs = _dividir(campos[5])
        n_seg = max(len(hebreo), len(translit), len(dstrongs), len(morfs), 1)
        segmentos = []
        indice_raiz = None
        for i in range(n_seg):
            crudo = _seg(dstrongs, i).strip()
            if "{" in crudo:
                indice_raiz = i
            segmentos.append({
                "dstrong": crudo.replace("{", "").replace("}", ""),
                "morf": _seg(morfs, i),
                "hebreo": _seg(hebreo, i),
                "translit": _seg(translit, i),
            })
        principal = segmentos[indice_raiz if indice_raiz is not None else n_seg - 1]
        ref_es, ref_orig = _refs(codigo, m)
        filas.append({
            "ref_es": ref_es,
            "ref_orig": ref_orig,
            "n": int(m.group(6)),
            "forma": "".join(hebreo),
            "translit": "".join(translit),
            "dstrong": principal["dstrong"],
            "morf": principal["morf"],
            "lema": "",
            "glosa": " ".join(p.strip() for p in glosa if p.strip()),
            "ediciones": "",
            "es": "",
            "segmentos": segmentos,
        })
    return filas


def _resumen(definicion):
    """Definición como texto corto: sin `<ref>` ni etiquetas, espacios colapsados, ≤ 200 caracteres."""
    texto = _REF_HTML.sub("", definicion)
    texto = _ETIQUETA.sub("", _BR.sub(" ", texto))
    texto = re.sub(r"\s+", " ", html.unescape(texto)).strip()
    if len(texto) <= LIMITE_DEFINICION:
        return texto
    corte = texto[: LIMITE_DEFINICION + 1]
    espacio = corte.rfind(" ")
    return (corte[:espacio] if espacio > 0 else texto[:LIMITE_DEFINICION]).rstrip()


def leer_lexico(lengua, raiz=None):
    """Léxico breve de STEPBible: `{strong_canon(dStrong): {lema, translit, gloss_en, short_en}}`.

    `lengua` es «G» (TBESG) o «H» (TBESH). La clave sale de la columna dStrong (`G2385I =` → `G2385I`),
    no del eStrong. Si un dStrong aparece dos veces, gana la primera fila.
    """
    if lengua not in ("G", "H"):
        raise ValueError(f"lengua de léxico desconocida: {lengua!r}")
    lexico = {}
    with open(_ruta_lexico(lengua, raiz), encoding="utf-8") as f:
        for linea in f:
            if not _FILA_LEX.match(linea):
                continue
            campos = linea.rstrip("\r\n").split("\t")
            campos += [""] * (8 - len(campos))
            partes = campos[1].split()
            clave = strong_canon(partes[0]) if partes else None
            if clave is None or clave in lexico:
                continue
            lexico[clave] = {
                "lema": campos[3],
                "translit": campos[4],
                "gloss_en": campos[6],
                "short_en": _resumen(campos[7]),
            }
    return lexico


def resumen(usfm, raiz=None):
    """Línea de resumen: «tagnt N · SBL N» (NT) o «tahot N · segmentos N» (AT)."""
    if numero(usfm) <= ULTIMO_AT:
        filas = leer_tahot(usfm, raiz)
        segmentos = sum(len(f["segmentos"]) for f in filas)
        return f"tahot {len(filas)} · segmentos {segmentos}"
    filas = leer_tagnt(usfm, raiz)
    # Una edición puede traer marca de variante («SBL»1»): cuenta por el nombre base.
    sbl = sum(1 for f in filas if any(t.split("»")[0] == "SBL" for t in f["ediciones"].split("+")))
    return f"tagnt {len(filas)} · SBL {sbl}"


def main(argv=None):
    parser = argparse.ArgumentParser(description="Lectores de STEPBible (TAGNT, TAHOT, TBESG, TBESH).")
    orden = parser.add_subparsers(dest="orden", required=True)
    res = orden.add_parser("resumen", help="conteos de filas de TAGNT o TAHOT de un libro")
    res.add_argument("--libro", required=True, help="código USFM, p. ej. JAS o RUT")
    args = parser.parse_args(argv)
    try:
        print(resumen(args.libro))
    except (ValueError, OSError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
