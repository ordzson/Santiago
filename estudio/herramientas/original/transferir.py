#!/usr/bin/env python3
"""Transferencia de las notas de RV1909 (alineación manual de Clear) a la RVR1960.

Uso: python3 -I estudio/herramientas/original/transferir.py medir --libro JAS

Por versículo se alinean los tokens de RV09 con los de la RVR1960 (difflib sobre claves sin
diacríticos y con formas equivalentes unificadas). Cada palabra seleccionada del original hereda
los tokens RVR1960 de sus destinos RV09. La regla dice cómo se obtuvo; la confianza sale de
`config.reglas_alta`. Todo `word` se comprueba con `encontrar_app` (port de `tokenize` de la app).
Solo biblioteca estándar.
"""
import argparse
import difflib
import json
import os
import re
import sys
import unicodedata
from collections import Counter

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

EQUIVALENCIAS = os.path.join(BASE, "equivalencias.json")
_TOKEN = re.compile(r"[^\W\d_]+")
_PRIMERA_EN_ORDEN = ["igual", "equivalencia", "pista"]  # de mejor a peor, para combinar reglas
UMBRAL_VERSICULO = 0.5


def clave(texto):
    """Minúsculas sin diacríticos (NFD, quitando marcas)."""
    nfd = unicodedata.normalize("NFD", texto.lower())
    return "".join(c for c in nfd if not unicodedata.combining(c))


def cargar_equivalencias(ruta=EQUIVALENCIAS):
    """`{clave: representante}` a partir de los grupos de formas equivalentes."""
    with open(ruta, encoding="utf-8") as f:
        grupos = json.load(f)["grupos"]
    mapa = {}
    for grupo in grupos:
        for forma in grupo:
            mapa[clave(forma)] = clave(grupo[0])
    return mapa


def encontrar_app(texto, word):
    """Port exacto de la búsqueda de `tokenize` (content.ts): posiciones `(inicio, fin)`."""
    bajo, objetivo = texto.lower(), word.lower()
    if not objetivo:
        return []
    def letra(c):
        return bool(c) and c.isalpha()
    encontradas, en = [], 0
    while True:
        en = bajo.find(objetivo, en)
        if en == -1:
            return encontradas
        fin = en + len(word)
        previo = texto[en - 1] if en > 0 else ""
        siguiente = texto[fin] if fin < len(texto) else ""
        if not letra(previo) and not letra(siguiente):
            encontradas.append((en, fin))
        en = fin


def tokens_rvr(texto):
    """Tokens de la RVR1960: `[(forma, inicio, fin)]`."""
    return [(m.group(), m.start(), m.end()) for m in _TOKEN.finditer(texto)]


def _confianza(regla, config):
    if regla in config.get("reglas_alta", []):
        return "alta"
    if regla in ("equivalencia", "pista"):
        return "media"
    return "revisar"


def _alinear(rv09, rvr, equiv):
    """`{indice_rv09: (indice_rvr, regla_base, n_bloque)}` y `ratio`. Regla: igual/equivalencia o
    `candidato` (1:1 en bloque replace, a validar con la pista)."""
    crudo_a = [clave(t["text"]) for t in rv09]
    crudo_b = [clave(t[0]) for t in rvr]
    a = [equiv.get(k, k) for k in crudo_a]
    b = [equiv.get(k, k) for k in crudo_b]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    mapa = {}
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for d in range(i2 - i1):
                igual = crudo_a[i1 + d] == crudo_b[j1 + d]
                mapa[i1 + d] = (j1 + d, "igual" if igual else "equivalencia")
        elif op == "replace" and i2 - i1 == 1 and j2 - j1 == 1:
            mapa[i1] = (j1, "candidato")
    return mapa, (sm.ratio() if (a or b) else 1.0)


def _pista_ok(rvr_forma, glosa):
    k = clave(rvr_forma)
    if len(k) < 4:
        return False
    return any(len(p) >= 4 and p[:4] == k[:4] for p in (clave(x) for x in _TOKEN.findall(glosa or "")))


def transferir(tokens_rv09_versiculo, texto_rvr, destinos_por_fuente, pistas_es=None,
               config=None, equivalencias=None, strongs=None):
    """`{id_fuente: {word, confidence, regla} | {regla}}` para un versículo.

    `tokens_rv09_versiculo`: dicts de RV09 (`id`, `text`, `exclude`) del versículo, en orden.
    `destinos_por_fuente`: `{id_fuente: [ids RV09]}`. `pistas_es`: `{id_fuente: glosa española}`.
    `strongs`: `{id_fuente: strong}` opcional; dos fuentes con igual strong no son ambiguas entre sí.
    """
    config = config if config is not None else _config()
    equiv = equivalencias if equivalencias is not None else cargar_equivalencias()
    pistas_es = pistas_es or {}
    vacias = {clave(v) for v in config.get("vacias_es", [])}
    rv09 = [t for t in tokens_rv09_versiculo if not t["exclude"] and _TOKEN.search(t["text"])]
    rvr = tokens_rvr(texto_rvr)
    mapa, ratio = _alinear(rv09, rvr, equiv)
    if ratio < UMBRAL_VERSICULO:
        return {f: {"regla": "versiculo_distinto"} for f in destinos_por_fuente}
    pos_id = {t["id"]: i for i, t in enumerate(rv09)}
    resultado, ocupado = {}, {}
    for fid, ids in destinos_por_fuente.items():
        pares, reglas = [], []
        for ident in ids:
            i = pos_id.get(ident)
            if i is None or i not in mapa:
                continue
            j, regla = mapa[i]
            if regla == "candidato":
                if not _pista_ok(rvr[j][0], pistas_es.get(fid)):
                    continue
                regla = "pista"
            pares.append((j, regla))
        ocupado[fid] = {j for j, _ in pares}
        while pares and clave(rvr[pares[0][0]][0]) in vacias:
            pares.pop(0)
        while pares and clave(rvr[pares[-1][0]][0]) in vacias:
            pares.pop()
        if not pares:
            resultado[fid] = {"regla": "sin_par"}
            continue
        pares.sort()
        indices = [j for j, _ in pares]
        reglas = {r for _, r in pares}
        regla = next(r for r in _PRIMERA_EN_ORDEN[::-1] if r in reglas)
        contiguo = all(
            indices[k + 1] == indices[k] + 1
            and not texto_rvr[rvr[indices[k]][2]:rvr[indices[k + 1]][1]].strip()
            for k in range(len(indices) - 1))
        if contiguo:
            word = texto_rvr[rvr[indices[0]][1]:rvr[indices[-1]][2]]
        else:
            word = max((rvr[j][0] for j in indices), key=len)
            regla = "no_contiguo"
        resultado[fid] = {"word": word, "regla": regla}
        resultado[fid]["_idx"] = indices
    for fid, r in resultado.items():
        if "word" not in r:
            continue
        r.pop("_idx")
        posiciones = encontrar_app(texto_rvr, r["word"])
        if not posiciones:
            resultado[fid] = {"regla": "no_literal"}
            continue
        for ini, fin in posiciones:
            tocados = {k for k, (_, a, b) in enumerate(rvr) if a < fin and b > ini}
            if any(otro != fid and ocupado[otro] & tocados
                   and not (strongs and strongs.get(otro) == strongs.get(fid) and strongs.get(fid))
                   for otro in ocupado):
                r["regla"] = "ambiguo"
                break
        r["confidence"] = _confianza(r["regla"], config)
    return {f: ({"word": r["word"], "confidence": r["confidence"], "regla": r["regla"]}
                if "word" in r else r) for f, r in resultado.items()}


def _config():
    import seleccion
    return seleccion.cargar_config()


def comparar_versificacion(usfm, rv09=None, datos_rvr=None):
    """Capítulos cuyo número de versículos difiere entre RV09 y RVR1960: `[(cap, n_rv09, n_rvr)]`."""
    import fuentes
    import rvr1960
    rv09 = rv09 if rv09 is not None else fuentes.leer_rv09(usfm)
    if datos_rvr is None:
        datos_rvr = rvr1960.leer(rvr1960.ENTRADA_POR_DEFECTO)
    por_cap = {}
    for t in rv09:
        por_cap.setdefault(int(t["id"][2:5]), set()).add(int(t["id"][5:8]))
    capitulos = datos_rvr[usfm.upper()]["capitulos"]
    distintos = []
    for cap in sorted(set(por_cap) | set(capitulos)):
        a, b = len(por_cap.get(cap, ())), len(capitulos.get(cap, ()))
        if a != b:
            distintos.append((cap, a, b))
    return distintos


def transferir_libro(usfm, items, enlaces, datos_rvr, rv09=None, alineacion=None, config=None,
                     capitulo=None):
    """Transfiere los `items` de la selección. Devuelve `{id_fuente: resultado + ref/ref_rvr}`.

    `enlaces`: salida de `enlace` (para la glosa `es_step` como pista). Un `{regla: sin_par}` sale
    para lo que no tiene destinos RV09; `{regla: sin_versiculo}` si la RVR1960 no tiene el versículo.
    """
    import fuentes
    import rvr1960
    config = config if config is not None else _config()
    rv09 = rv09 if rv09 is not None else fuentes.leer_rv09(usfm)
    alineacion = alineacion if alineacion is not None else fuentes.leer_alineacion(usfm)
    equiv = cargar_equivalencias()
    por_fuente = {}
    for fuente_ids, destinos in alineacion:
        for f in fuente_ids:
            por_fuente.setdefault(f, []).extend(destinos)
    por_verso = {}
    for t in rv09:
        por_verso.setdefault(t["id"][:8], []).append(t)
    grupos, salida = {}, {}
    for item in items:
        destinos = por_fuente.get(item["id"], [])
        if not destinos:
            salida[item["id"]] = {"regla": "sin_par"}
            continue
        verso = Counter(d[:8] for d in destinos).most_common(1)[0][0]
        grupos.setdefault(verso, {})[item["id"]] = [d for d in destinos if d[:8] == verso]
    pistas = {i["id"]: (enlaces.get(i["id"]) or {}).get("es_step", "") for i in items}
    strongs = {i["id"]: i.get("strong_base") for i in items}
    for verso, destinos in grupos.items():
        cap, vers = int(verso[2:5]), int(verso[5:8])
        try:
            texto = rvr1960.texto_versiculo(datos_rvr, usfm, cap, vers)
        except KeyError:
            for f in destinos:
                salida[f] = {"regla": "sin_versiculo"}
            continue
        res = transferir(por_verso[verso], texto, destinos, pistas, config, equiv, strongs)
        for f, r in res.items():
            r["ref"] = f"{usfm.upper()}.{cap}.{vers}"
            salida[f] = r
    return salida


def medir(usfm, config=None):
    import enlace
    import fuentes
    import rvr1960
    import seleccion
    config = config if config is not None else seleccion.cargar_config()
    items = seleccion.seleccionar(usfm, config=config)
    enlaces, _ = enlace.enlazar_nt(usfm)
    datos = rvr1960.leer(rvr1960.ENTRADA_POR_DEFECTO)
    res = transferir_libro(usfm, items, enlaces, datos, config=config)
    por_item = {i["id"]: i for i in items}
    return items, res, por_item


def _cmd_medir(args):
    usfm = args.libro.upper()
    items, res, por_item = medir(usfm)
    total = len(items)
    con_word = sum(1 for r in res.values() if "word" in r)
    print(f"{usfm}: {total} tokens seleccionados · {con_word} con word "
          f"({100 * con_word / max(total, 1):.1f} %)".replace(".", ","))
    print("Por confianza:", dict(Counter(r.get("confidence", "sin_word") for r in res.values())))
    print("Por regla:", dict(Counter(r["regla"] for r in res.values())))
    fallos = Counter()
    for f, r in res.items():
        if "word" not in r:
            fallos[r["regla"]] += 1
    print("Fallos:", dict(fallos))
    diferencias = comparar_versificacion(usfm)
    print("Versificación RV09 vs RVR1960:", diferencias or "sin diferencias")
    if args.fallos:
        for f, r in res.items():
            if "word" not in r:
                print(f, r["regla"], por_item[f]["ref_orig"], por_item[f]["lemma"])
    return 0 if con_word * 100 >= 80 * total else 2


def main(argv=None):
    parser = argparse.ArgumentParser(description="Transferencia RV1909 → RVR1960.")
    orden = parser.add_subparsers(dest="orden", required=True)
    m = orden.add_parser("medir", help="mide la transferencia de un libro del NT")
    m.add_argument("--libro", required=True)
    m.add_argument("--fallos", action="store_true")
    args = parser.parse_args(argv)
    return _cmd_medir(args)


if __name__ == "__main__":
    sys.exit(main())
