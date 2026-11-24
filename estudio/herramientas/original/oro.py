#!/usr/bin/env python3
"""Muestra de oro: candidatos de Santiago para validar el enlace griego ↔ RVR1960.

Uso: python3 -I estudio/herramientas/original/oro.py candidatos
     python3 -I estudio/herramientas/original/oro.py comprobar

Lee las notas NBLA de `estudio/public/data/griego.json` del libro (solo las de una
palabra), busca en SBLGNT del mismo versículo el token cuyo `text` o `lemma` coincide
(normalizado) con el término griego, y escribe hasta 12 candidatos por capítulo
(espaciados uniformemente, ordenados por referencia) en:
- HO/.cache/salida/oro-candidatos.json (forma del contrato: ref, strong, lemma, gloss, nbla)
- HO/.cache/salida/oro-candidatos.txt (una línea por candidato, con el texto RVR1960)

`comprobar` verifica que cada `word` no nulo de HO/oro/santiago.json aparece en su
versículo RVR1960 con la regla de la app (`tokenize`: sin distinguir mayúsculas y sin
letra pegada a ninguno de los dos lados).

Lo que lee del original es solo el código; no se muestran capítulos ni borradores.
Solo biblioteca estándar.
"""
import argparse
import json
import os
import sys
import unicodedata
from collections import defaultdict

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

import fuentes  # noqa: E402
import rvr1960  # noqa: E402
from libros import id_app, strong_base  # noqa: E402

REPO = os.path.normpath(os.path.join(BASE, "..", "..", ".."))
GRIEGO = os.path.join(REPO, "estudio", "public", "data", "griego.json")
SALIDA = os.path.join(BASE, ".cache", "salida")
LIBRO = "JAS"
ID_LIBRO = id_app("Santiago")  # id de las notas en griego.json: «santiago»
POR_CAPITULO = 12
ORO = os.path.join(BASE, "oro", "santiago.json")


def normalizar(texto):
    """NFD, sin diacríticos, minúsculas y sigma final → σ (para comparar términos griegos)."""
    descompuesto = unicodedata.normalize("NFD", texto)
    sin_diacriticos = "".join(c for c in descompuesto if unicodedata.category(c) != "Mn")
    return unicodedata.normalize("NFC", sin_diacriticos).lower().replace("ς", "σ")


def leer_notas(ruta=GRIEGO):
    """Notas NBLA del libro (`book` = id de la app), en el orden del archivo."""
    with open(ruta, encoding="utf-8") as f:
        notas = json.load(f)["notes"]
    return [n for n in notas if n.get("book") == ID_LIBRO]


def versiculos_fuente(raiz=None):
    """Tokens SBLGNT del libro agrupados por (capítulo, versículo), en orden de aparición.

    El id SBLGNT es `n` + `BBCCCVVVWWW`: capítulo en [3:6], versículo en [6:9].
    """
    grupos = defaultdict(list)
    for token in fuentes.leer_fuente(LIBRO, raiz=raiz):
        cap, vers = int(token["id"][3:6]), int(token["id"][6:9])
        grupos[(cap, vers)].append(token)
    return grupos


def buscar_token(tokens, termino):
    """Primer token cuyo `text` o `lemma`, normalizado, es igual al término. None si no hay."""
    clave = normalizar(termino)
    for token in tokens:
        if clave in (normalizar(token.get("text", "")), normalizar(token.get("lemma", ""))):
            return token
    return None


def candidatos(notas, fuente):
    """Candidatos con match: una nota de una palabra cuyo término aparece en su versículo.

    Devuelve dicts `{ref, strong, lemma, gloss, nbla}` ordenados por referencia.
    Se descartan los tokens sin Strong y los duplicados (mismo ref y mismo strong).
    """
    encontrados, vistos = [], set()
    for nota in notas:
        griego = (nota.get("greek") or "").strip()
        if not griego or len(griego.split()) != 1:
            continue
        cap, vers = int(nota["chapter"]), int(nota["verse"])
        token = buscar_token(fuente.get((cap, vers), []), griego)
        if token is None:
            continue
        strong = strong_base(token.get("strongs", ""), "G")
        if strong is None or (cap, vers, strong) in vistos:
            continue
        vistos.add((cap, vers, strong))
        encontrados.append(((cap, vers), {
            "ref": f"{LIBRO}.{cap}.{vers}",
            "strong": strong,
            "lemma": token.get("lemma", ""),
            "gloss": token.get("gloss", ""),
            "nbla": nota.get("word", ""),
        }))
    encontrados.sort(key=lambda par: par[0])  # estable: conserva el orden de las notas
    return [c for _, c in encontrados]


def espaciar(lista, k=POR_CAPITULO):
    """Como máximo k elementos de `lista`, repartidos uniformemente (determinista)."""
    n = len(lista)
    if n <= k:
        return list(lista)
    return [lista[round(i * (n - 1) / (k - 1))] for i in range(k)]


def seleccionar(total):
    """Por capítulo (en orden), hasta POR_CAPITULO candidatos espaciados uniformemente."""
    por_cap = defaultdict(list)
    for c in total:
        por_cap[int(c["ref"].split(".")[1])].append(c)
    elegidos = []
    for cap in sorted(por_cap):
        elegidos.extend(espaciar(por_cap[cap]))
    return elegidos


def linea(candidato, datos_rvr):
    """`JAS.1.2 · G5479 · χαρά · joy · NBLA «gozo» · RVR1960: <texto>`."""
    _, cap, vers = candidato["ref"].split(".")
    texto = rvr1960.texto_versiculo(datos_rvr, LIBRO, int(cap), int(vers))
    return (f"{candidato['ref']} · {candidato['strong']} · {candidato['lemma']} · "
            f"{candidato['gloss']} · NBLA «{candidato['nbla']}» · RVR1960: {texto}")


def escribir(elegidos, datos_rvr, carpeta=SALIDA):
    """Escribe oro-candidatos.json y oro-candidatos.txt en `carpeta`."""
    os.makedirs(carpeta, exist_ok=True)
    with open(os.path.join(carpeta, "oro-candidatos.json"), "w", encoding="utf-8") as f:
        json.dump(elegidos, f, ensure_ascii=False, indent=2)
        f.write("\n")
    with open(os.path.join(carpeta, "oro-candidatos.txt"), "w", encoding="utf-8") as f:
        for c in elegidos:
            f.write(linea(c, datos_rvr) + "\n")


def aparece(texto, palabra):
    """True si `palabra` aparece en `texto` como en `tokenize` de la app.

    Coincidencia sin distinguir mayúsculas, y el carácter anterior y el posterior no son letras.
    """
    bajo, buscada = texto.lower(), palabra.lower()
    at = bajo.find(buscada)
    while at != -1:
        fin = at + len(buscada)
        antes = texto[at - 1] if at > 0 else ""
        despues = texto[fin] if fin < len(texto) else ""
        if not antes.isalpha() and not despues.isalpha():
            return True
        at = bajo.find(buscada, fin)
    return False


def comprobar(oro_lista, datos_rvr):
    """Devuelve `(n_asociaciones, fuera)`: fuera = entradas no nulas que no aparecen en su versículo."""
    n, fuera = 0, []
    for entrada in oro_lista:
        palabra = entrada.get("word")
        if palabra is None:
            continue
        n += 1
        usfm, cap, vers = entrada["ref"].split(".")
        try:
            texto = rvr1960.texto_versiculo(datos_rvr, usfm, int(cap), int(vers))
        except KeyError:
            texto = ""
        if not aparece(texto, palabra):
            fuera.append(entrada)
    return n, fuera


def _comprobar(args):
    with open(args.oro, encoding="utf-8") as f:
        oro_lista = json.load(f)
    datos_rvr = rvr1960.leer(rvr1960.ENTRADA_POR_DEFECTO)
    n, fuera = comprobar(oro_lista, datos_rvr)
    nulos = sum(1 for e in oro_lista if e.get("word") is None)
    for e in fuera:
        print(f"fuera: {e['ref']} · {e['strong']} · «{e['word']}»")
    print(f"{n} asociaciones · {len(fuera)} fuera del versículo · {nulos} nulas")
    return 1 if fuera else 0


def _candidatos(args):
    notas = leer_notas(GRIEGO)
    fuente = versiculos_fuente()
    datos_rvr = rvr1960.leer(rvr1960.ENTRADA_POR_DEFECTO)
    total = candidatos(notas, fuente)
    elegidos = seleccionar(total)
    escribir(elegidos, datos_rvr, SALIDA)
    conteo = defaultdict(int)
    for c in elegidos:
        conteo[int(c["ref"].split(".")[1])] += 1
    detalle = " ".join(f"{cap}:{conteo[cap]}" for cap in sorted(conteo))
    print(f"oro: {len(notas)} notas · {len(total)} con match · {len(elegidos)} candidatos · capítulos {detalle}")
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(description="Muestra de oro de Santiago.")
    orden = parser.add_subparsers(dest="orden", required=True)
    orden.add_parser("candidatos", help="escribe oro-candidatos.json y .txt")
    comp = orden.add_parser("comprobar", help="cada word de la muestra aparece en su versículo")
    comp.add_argument("--oro", default=ORO, help="JSON de la muestra de oro")
    args = parser.parse_args(argv)
    if args.orden == "candidatos":
        return _candidatos(args)
    if args.orden == "comprobar":
        return _comprobar(args)
    return 2


if __name__ == "__main__":
    sys.exit(main())
