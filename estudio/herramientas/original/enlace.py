#!/usr/bin/env python3
"""Enlace entre la fuente de Clear Bible y STEPBible (SBLGNT ↔ TAGNT).

Uso: python3 -I estudio/herramientas/original/enlace.py nt --libro JAS
     python3 -I estudio/herramientas/original/enlace.py at --libro RUT --capitulo 1
Escribe HO/.cache/salida/JAS.enlace.json y JAS.enlace.txt (no enlazados legibles); en el AT,
RUT-1.enlace.json y RUT-1.enlace.txt.

NT: por versículo se comparan los tokens de SBLGNT con las filas de TAGNT que traen la edición
SBL, con difflib sobre la clave (strong_base, forma normalizada). AT: por segmento WLCM, el único
segmento TAHOT con igual Strong base en su palabra (o en WWW±1, WWW±2). Nunca se inventa un enlace.
Solo biblioteca estándar.
"""
import argparse
import difflib
import json
import os
import re
import sys
import unicodedata
from collections import OrderedDict

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

import fuentes  # noqa: E402
import stepbible  # noqa: E402
from libros import numero, strong_base  # noqa: E402

SALIDA = os.path.join(BASE, ".cache", "salida")
ULTIMO_AT = 39
# Partículas del hebreo que no se enlazan por Strong (WLCM `pos`); STEPBible las marca H9xxx.
PREFIJOS_AT = {"conjunction", "particle", "preposition", "pronoun", "suffix"}
_PREFIJO_TAHOT = re.compile(r"^H9\d{3}$")


def normalizar(forma):
    """NFD, sin diacríticos ni puntuación, minúsculas (sigma final = sigma)."""
    texto = unicodedata.normalize("NFD", forma or "")
    letras = [c for c in texto if unicodedata.category(c).startswith("L")]
    return "".join(letras).lower().replace("ς", "σ")


def tiene_sbl(ediciones):
    """True si la edición SBL está entre las del texto («SBL»1» cuenta por su nombre base)."""
    return any(parte.split("»")[0] == "SBL" for parte in (ediciones or "").split("+"))


def _ids_por_versiculo(tokens):
    """Agrupa tokens SBLGNT por (cap, vers) conservando el orden del texto."""
    grupos = OrderedDict()
    for t in tokens:
        i = t["id"]
        grupos.setdefault((int(i[3:6]), int(i[6:9])), []).append(t)
    return grupos


def _enlace(fila):
    return {
        "dstrong": fila["dstrong"],
        "morf_step": fila["morf"],
        "translit_forma": fila["translit"],
        "es_step": fila["es"],
        "ref_tagnt": f"{fila['ref_es']}#{fila['n']:02d}",
    }


def _bloque_replace(sbl, filas, clave_s, clave_t, rango, enlaces, falla):
    """Bloque donde difieren las claves: primero por forma sola (el Strong de STEPBible a veces
    es otro, p. ej. «μου» G3450 ↔ G3165), luego 1:1 por Strong en sub-bloques del mismo largo."""
    a0, a1, b0, b1 = rango
    formas_s = [c[1] for c in clave_s[a0:a1]]
    formas_t = [c[1] for c in clave_t[b0:b1]]
    for op, i0, i1, j0, j1 in difflib.SequenceMatcher(None, formas_s, formas_t, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i1 - i0):
                enlaces[sbl[a0 + i0 + k]["id"]] = _enlace(filas[b0 + j0 + k])
        elif op == "replace" and i1 - i0 == j1 - j0:
            for k in range(i1 - i0):
                ia, jb = a0 + i0 + k, b0 + j0 + k
                if clave_s[ia][0] and clave_s[ia][0] == clave_t[jb][0]:
                    enlaces[sbl[ia]["id"]] = _enlace(filas[jb])
                else:
                    falla(sbl[ia], "variante")
        elif op in ("replace", "delete"):
            for t in sbl[a0 + i0:a0 + i1]:
                falla(t, "variante" if op == "replace" else "sin_par")


def enlazar_versiculo(sbl, filas, ref=""):
    """Enlaza los tokens SBLGNT de un versículo con filas TAGNT (ya filtradas por SBL).

    Devuelve `(enlaces, no_enlazados)`.
    """
    clave_s = [(strong_base(t["strongs"], "G"), normalizar(t["text"])) for t in sbl]
    clave_t = [(strong_base(f["dstrong"], "G"), normalizar(f["forma"])) for f in filas]
    enlaces, no = {}, []

    def falla(t, motivo):
        no.append({"id": t["id"], "ref": ref, "forma": t["text"],
                   "strong": strong_base(t["strongs"], "G") or t["strongs"], "motivo": motivo})

    for op, a0, a1, b0, b1 in difflib.SequenceMatcher(None, clave_s, clave_t, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(a1 - a0):
                enlaces[sbl[a0 + k]["id"]] = _enlace(filas[b0 + k])
        elif op == "replace":
            _bloque_replace(sbl, filas, clave_s, clave_t, (a0, a1, b0, b1), enlaces, falla)
        elif op == "delete":
            for t in sbl[a0:a1]:
                falla(t, "sin_par")
        # «insert»: filas TAGNT sin token SBLGNT; no hay nada que enlazar.
    return enlaces, no


def enlazar_nt(usfm, raiz_fuentes=None, raiz_step=None):
    """`({sblgnt_id: {dstrong, morf_step, translit_forma, es_step, ref_tagnt}}, no_enlazados)`.

    `raiz_fuentes` / `raiz_step`: árboles alternativos (fixtures) de Clear Bible y STEPBible.
    """
    codigo = usfm.strip().upper()
    if numero(codigo) <= ULTIMO_AT:
        raise ValueError(f"{codigo} es del AT; enlazar_nt solo trata el NT")
    tokens = fuentes.leer_fuente(codigo, raiz=raiz_fuentes)
    por_ref = {}
    for fila in stepbible.leer_tagnt(codigo, raiz=raiz_step):
        if tiene_sbl(fila["ediciones"]):
            por_ref.setdefault(fila["ref_es"], []).append(fila)
    enlaces, no = {}, []
    for (cap, ver), sbl in _ids_por_versiculo(tokens).items():
        ref = f"{codigo}.{cap}.{ver}"
        e, n = enlazar_versiculo(sbl, por_ref.get(ref, []), ref)
        enlaces.update(e)
        no.extend(n)
    return enlaces, no


def _fallo(t, ref, motivo, strong):
    return {"id": t["id"], "ref": ref, "forma": t["text"], "strong": strong, "motivo": motivo}


def _es_prefijo(strong):
    """Strong de prefijo de STEPBible (`H9001`…`H9999`): no se enlaza por Strong."""
    return bool(strong) and _PREFIJO_TAHOT.match(strong) is not None


def _strong_principal(dstrong):
    """Strong principal de un segmento TAHOT, sin la puntuación pegada con `\\` o `+`
    (`H8147\\H9014` → `H8147`, `H1035G+` → `H1035G`)."""
    return re.split(r"[\\+]", dstrong or "", maxsplit=1)[0]


def _candidatos_at(por_palabra, palabras, sb):
    """Segmentos TAHOT de esas palabras cuyo Strong base es `sb` (sin prefijos)."""
    hallados = []
    for n in palabras:
        for fila in por_palabra.get(n, []):
            for i, seg in enumerate(fila["segmentos"]):
                sb_seg = strong_base(_strong_principal(seg["dstrong"]), "H")
                if sb_seg == sb and not _es_prefijo(sb_seg):
                    hallados.append((fila, i, seg))
    return hallados


def _enlace_at(fila, i, seg):
    return {
        "dstrong": _strong_principal(seg["dstrong"]),
        "morf_step": seg["morf"],
        "translit_forma": seg["translit"],
        "hebreo_step": seg["hebreo"],
        "ref_tahot": f"{fila['ref_orig']}#{fila['n']:02d}",
        "segmento": i + 1,
    }


def enlazar_versiculo_at(segs, filas, ref=""):
    """Enlaza los segmentos WLCM de contenido de un versículo con sus filas TAHOT (misma ref hebrea).

    Un segmento se enlaza si hay exactamente un segmento TAHOT con igual Strong base: primero en su
    palabra (`WWW`); si no hay ninguno, en las palabras `WWW±1` y `WWW±2`. Motivos: `sin_strong`
    (WLCM sin Strong), `sin_par` (ninguno), `ambiguo` (varios). Los prefijos (`pos` en PREFIJOS_AT)
    no entran en el total. Devuelve `(enlaces, no_enlazados)`.
    """
    por_palabra = {}
    for fila in filas:
        por_palabra.setdefault(fila["n"], []).append(fila)
    enlaces, no = {}, []
    for t in sorted(segs, key=lambda s: s["id"]):
        sb = strong_base(t["strongs"], "H")
        if t.get("pos", "") in PREFIJOS_AT or _es_prefijo(sb):
            continue
        palabra = int(t["id"][9:12])
        ref_palabra = f"{ref}#{palabra:02d}"
        if sb is None:
            no.append(_fallo(t, ref_palabra, "sin_strong", t["strongs"]))
            continue
        hallados = _candidatos_at(por_palabra, [palabra], sb)
        if not hallados:
            hallados = _candidatos_at(por_palabra, [palabra - 1, palabra + 1, palabra - 2, palabra + 2], sb)
        if len(hallados) == 1:
            enlaces[t["id"]] = _enlace_at(*hallados[0])
        else:
            no.append(_fallo(t, ref_palabra, "ambiguo" if hallados else "sin_par", sb))
    return enlaces, no


def enlazar_at(usfm, capitulo, raiz_fuentes=None, raiz_step=None):
    """`({wlcm_id: {dstrong, morf_step, translit_forma, hebreo_step, ref_tahot, segmento}}, no_enlazados)`
    para un capítulo del AT (WLCM ↔ TAHOT). Ver `enlazar_versiculo_at`.

    `raiz_fuentes` / `raiz_step`: árboles alternativos (fixtures) de Clear Bible y STEPBible.
    """
    codigo = usfm.strip().upper()
    if numero(codigo) > ULTIMO_AT:
        raise ValueError(f"{codigo} es del NT; enlazar_at solo trata el AT")
    cap = int(capitulo)
    tokens = [t for t in fuentes.leer_fuente(codigo, raiz=raiz_fuentes) if int(t["id"][3:6]) == cap]
    if not tokens:
        raise ValueError(f"{codigo} {cap} no tiene segmentos WLCM en la caché")
    por_ref = {}
    for fila in stepbible.leer_tahot(codigo, raiz=raiz_step):
        por_ref.setdefault(fila["ref_orig"], []).append(fila)
    enlaces, no = {}, []
    for (c, ver), segs in _ids_por_versiculo(tokens).items():
        ref = f"{codigo}.{c}.{ver}"
        e, n = enlazar_versiculo_at(segs, por_ref.get(ref, []), ref)
        enlaces.update(e)
        no.extend(n)
    return enlaces, no


def _resumen(nombre, enlaces, no):
    """Línea de resumen: enlazados sobre los segmentos con Strong. Los `sin_strong` no entran en la
    base del porcentaje; se cuentan aparte (siguen listados en el .txt con su motivo)."""
    sin_strong = sum(1 for n in no if n["motivo"] == "sin_strong")
    otros = len(no) - sin_strong
    base = len(enlaces) + otros
    pct = f"{100 * len(enlaces) / max(base, 1):.1f}".replace(".", ",")
    linea = f"{nombre}: {len(enlaces)} de {base} enlazados ({pct} %) · {otros} no enlazados"
    if sin_strong:
        linea += f" · {sin_strong} sin Strong (fuera de la base)"
    return linea


def _escribir(nombre, enlaces, no, resumen):
    os.makedirs(SALIDA, exist_ok=True)
    ruta_json = os.path.join(SALIDA, f"{nombre}.enlace.json")
    with open(ruta_json, "w", encoding="utf-8") as f:
        json.dump({"enlaces": enlaces, "no_enlazados": no}, f, ensure_ascii=False, indent=1)
    with open(os.path.join(SALIDA, f"{nombre}.enlace.txt"), "w", encoding="utf-8") as f:
        f.write(resumen + "\n")
        for n in no:
            f.write(f"{n['ref']}\t{n['forma']}\t{n['strong']}\t{n['motivo']}\n")
    return ruta_json


def main(argv=None):
    parser = argparse.ArgumentParser(description="Enlace Clear Bible ↔ STEPBible.")
    orden = parser.add_subparsers(dest="orden", required=True)
    nt = orden.add_parser("nt", help="SBLGNT ↔ TAGNT de un libro del NT")
    nt.add_argument("--libro", required=True, help="código USFM, p. ej. JAS")
    at = orden.add_parser("at", help="WLCM ↔ TAHOT de un capítulo del AT")
    at.add_argument("--libro", required=True, help="código USFM, p. ej. RUT")
    at.add_argument("--capitulo", required=True, type=int, help="capítulo, p. ej. 1")
    args = parser.parse_args(argv)
    codigo = args.libro.strip().upper()
    try:
        if args.orden == "nt":
            nombre = codigo
            enlaces, no = enlazar_nt(codigo)
        else:
            nombre = f"{codigo}-{args.capitulo}"
            enlaces, no = enlazar_at(codigo, args.capitulo)
    except (ValueError, FileNotFoundError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    resumen = _resumen(nombre, enlaces, no)
    _escribir(nombre, enlaces, no, resumen)
    print(resumen)
    return 0


if __name__ == "__main__":
    sys.exit(main())
