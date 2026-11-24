#!/usr/bin/env python3
"""Lectores de las fuentes de Clear Bible (SBLGNT, WLCM, RV09 y alineaciones) desde la caché.

Uso: python3 -I estudio/herramientas/original/fuentes.py resumen --libro JAS
Imprime «fuente N · rv09 N · registros N» para el libro indicado.

Las funciones leen de HO/.cache/fuentes/ (descargada por descargar.py). Todas aceptan
`raiz=` para leer otro árbol con la misma estructura (lo usan las pruebas con fixtures).
Nunca se abre un archivo entero para mostrarlo: el trabajo sobre datos lo hace el código.
Solo biblioteca estándar.
"""
import argparse
import json
import os
import sys
from collections import Counter

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

from libros import numero, strong_base  # noqa: E402

CACHE = os.path.join(BASE, ".cache", "fuentes")
CLEAR = os.path.join("Clear-Bible", "Alignments", "data")
ARCHIVOS = {
    "fuente_nt": os.path.join(CLEAR, "sources", "SBLGNT.tsv"),
    "fuente_at": os.path.join(CLEAR, "sources", "WLCM.tsv"),
    "rv09_nt": os.path.join(CLEAR, "spa", "targets", "RV09", "nt_RV09.tsv"),
    "rv09_at": os.path.join(CLEAR, "spa", "targets", "RV09", "ot_RV09.tsv"),
    "alin_nt": os.path.join(CLEAR, "spa", "alignments", "RV09", "SBLGNT-RV09-manual.json"),
    "alin_at": os.path.join(CLEAR, "spa", "alignments", "RV09", "WLCM-RV09-manual.json"),
}
ULTIMO_AT = 39  # 1–39 = AT, 40–66 = NT


def _ruta(clave, raiz):
    return os.path.join(raiz or CACHE, ARCHIVOS[clave])


def _filas_tsv(ruta, prefijo):
    """Filas del TSV cuyo `id` (columna 0) empieza por `prefijo`, como dicts de la cabecera."""
    filas = []
    with open(ruta, encoding="utf-8") as f:
        cabecera = f.readline().rstrip("\r\n").split("\t")
        for linea in f:
            if not linea.startswith(prefijo):
                continue
            valores = linea.rstrip("\r\n").split("\t")
            valores += [""] * (len(cabecera) - len(valores))
            filas.append(dict(zip(cabecera, valores)))
    return filas


def leer_fuente(usfm, raiz=None):
    """Tokens de la fuente original del libro (SBLGNT para NT, WLCM para AT) como dicts."""
    n = numero(usfm)
    if n <= ULTIMO_AT:
        return _filas_tsv(_ruta("fuente_at", raiz), f"o{n:02d}")
    return _filas_tsv(_ruta("fuente_nt", raiz), f"n{n:02d}")


def leer_rv09(usfm, raiz=None):
    """Tokens de RV09 del libro, con `exclude` convertido a booleano (True si la columna es «y»)."""
    n = numero(usfm)
    clave = "rv09_at" if n <= ULTIMO_AT else "rv09_nt"
    filas = _filas_tsv(_ruta(clave, raiz), f"{n:02d}")
    for fila in filas:
        fila["exclude"] = fila["exclude"].strip() == "y"
    return filas


def leer_alineacion(usfm, raiz=None):
    """Registros manuales (fuente, destino) cuyos destinos son todos del libro.

    Devuelve lista de tuplas `(fuente_ids, destino_ids)`; los ids se devuelven tal cual.
    """
    n = numero(usfm)
    clave = "alin_at" if n <= ULTIMO_AT else "alin_nt"
    prefijo = f"{n:02d}"
    with open(_ruta(clave, raiz), encoding="utf-8") as f:
        datos = json.load(f)
    resultado = []
    for registro in datos["records"]:
        destinos = registro.get("target", [])
        if destinos and all(d.startswith(prefijo) for d in destinos):
            resultado.append((list(registro["source"]), list(destinos)))
    return resultado


def frecuencias(testamento, raiz=None):
    """Counter de Strong (sin ceros ni sufijo, con letra) sobre todo el TSV fuente.

    `testamento`: «NT» (SBLGNT, griego «G») o «AT» (WLCM, hebreo «H»).
    """
    if testamento == "NT":
        clave, lengua = "fuente_nt", "G"
    elif testamento == "AT":
        clave, lengua = "fuente_at", "H"
    else:
        raise ValueError(f"testamento desconocido: {testamento!r}")
    cuenta = Counter()
    with open(_ruta(clave, raiz), encoding="utf-8") as f:
        f.readline()  # cabecera
        for linea in f:
            partes = linea.split("\t", 4)
            if len(partes) < 4:
                continue
            base = strong_base(partes[3], lengua)
            if base:
                cuenta[base] += 1
    return cuenta


def resumen(usfm):
    """Línea de resumen del libro: «fuente N · rv09 N · registros N»."""
    fuente = len(leer_fuente(usfm))
    rv09 = len(leer_rv09(usfm))
    registros = len(leer_alineacion(usfm))
    return f"fuente {fuente} · rv09 {rv09} · registros {registros}"


def main(argv=None):
    parser = argparse.ArgumentParser(description="Lectores de las fuentes de Clear Bible.")
    orden = parser.add_subparsers(dest="orden", required=True)
    res = orden.add_parser("resumen", help="conteos de fuente, RV09 y alineaciones de un libro")
    res.add_argument("--libro", required=True, help="código USFM, p. ej. JAS o RUT")
    args = parser.parse_args(argv)
    try:
        print(resumen(args.libro))
    except ValueError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
