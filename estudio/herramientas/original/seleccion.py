#!/usr/bin/env python3
"""Selección de palabras del original que llevarán nota (tokens fuente con Strong, sin función).

Uso: python3 -I estudio/herramientas/original/seleccion.py --libro JAS
     python3 -I estudio/herramientas/original/seleccion.py --libro RUT --capitulo 1
Escribe HO/.cache/salida/JAS.seleccion.json (o RUT-1.seleccion.json) y su última línea es
«tokens N · lemas M» (lemas = Strong base distintos).

Reglas de config.json: se descartan las `pos` excluidas, los Strong de `excluir` y los que coinciden con
prefijo+3 dígitos excluido (p. ej. H9001–H9049; solo AT). Un token con frecuencia (fuentes.frecuencias) > umbral se
descarta salvo que su Strong esté en «siempre» (config + claves de HO/glosario.json si existe).
Por versículo se conservan `max_por_versiculo`, priorizando «siempre», luego la menor frecuencia y
luego el orden del texto; la salida vuelve a ir en orden de texto.
Solo biblioteca estándar.
"""
import re
import argparse
import json
import os
import sys
from collections import OrderedDict

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

import enlace  # noqa: E402
import fuentes  # noqa: E402
import stepbible  # noqa: E402
from libros import numero, strong_base, strong_canon  # noqa: E402

CONFIG = os.path.join(BASE, "config.json")
GLOSARIO = os.path.join(BASE, "glosario.json")
SALIDA = os.path.join(BASE, ".cache", "salida")
ULTIMO_AT = 39  # 1–39 = AT, 40–66 = NT


def cargar_config(ruta=CONFIG):
    """Config del pipeline (`HO/config.json`)."""
    with open(ruta, encoding="utf-8") as f:
        return json.load(f)


def siempre_efectivo(config, ruta_glosario=GLOSARIO):
    """Conjunto «siempre»: `config["siempre"]` ∪ claves de `glosario.json` si el archivo existe."""
    claves = set(config.get("siempre", []))
    if os.path.exists(ruta_glosario):
        with open(ruta_glosario, encoding="utf-8") as f:
            glosario = json.load(f)
        if not isinstance(glosario, dict):
            raise ValueError("glosario.json debe ser un objeto cuyas claves son Strong")
        claves |= set(glosario)
    return claves


def _ref(identificador, codigo):
    """Referencia «JAS.1.2» de un id SBLGNT (`nBBCCCVVVWWW`) o WLCM (`oBBCCCVVVWWWS`)."""
    return f"{codigo}.{int(identificador[3:6])}.{int(identificador[6:9])}"


def _claves(item):
    """Strong con los que se juzga un ítem: el de la fuente (base), el del enlace y su base."""
    lengua = item["strong_base"][0]
    candidatos = {item["strong_base"], item["strong"], strong_base(item["strong"], lengua)}
    return {c for c in candidatos if c}


def _excluido(item, excluir, prefijos):
    claves = _claves(item)
    return bool(claves & excluir) or any(
        re.fullmatch(re.escape(p) + r"\d{3}", c) for c in claves for p in prefijos)


def elegir(items, cfg, testamento, siempre):
    """Filtra y limita los ítems (en orden de texto) según `cfg[testamento]` y `cfg` raíz.

    `testamento`: «NT» o «AT» (la clave de config es su minúscula: `nt` / `at`).
    `items`: dicts `{id, ref_orig, strong, strong_base, lemma, forma, morph, pos, frecuencia}`.
    `siempre`: conjunto de Strong que entran aunque superen el umbral de frecuencia.
    """
    bloque = cfg[testamento.lower()]
    excl_pos = set(bloque["excluir_pos"])
    prefijos = tuple(bloque.get("excluir_prefijo_strong", []))
    excluir = set(cfg["excluir"])
    umbral = bloque["umbral_frecuencia"]
    maximo = cfg["max_por_versiculo"]
    por_versiculo = OrderedDict()
    for orden, item in enumerate(items):
        if item["pos"] in excl_pos or _excluido(item, excluir, prefijos):
            continue
        es_siempre = bool(_claves(item) & siempre)
        if not es_siempre and item["frecuencia"] > umbral:
            continue
        clave = (0 if es_siempre else 1, item["frecuencia"], orden)
        por_versiculo.setdefault(item["ref_orig"], []).append((clave, orden, item))
    elegidos = []
    for candidatos in por_versiculo.values():
        candidatos.sort(key=lambda c: c[0])
        elegidos.extend(candidatos[:maximo])
    elegidos.sort(key=lambda c: c[1])
    return [item for _, _, item in elegidos]


def seleccionar(usfm, capitulo=None, config=None, siempre=None, raiz_fuentes=None, raiz_step=None,
                lexico=None):
    """Ítems seleccionados del libro (o del capítulo), en orden de texto.

    Para el AT `capitulo` es obligatorio (el enlace WLCM ↔ TAHOT es por capítulo).
    `config`, `siempre`, `lexico`, `raiz_fuentes` y `raiz_step` permiten inyectar datos (pruebas).
    `lexico`: léxico TBESH ya leído; si es None y el libro es del AT, se lee de la caché.
    """
    codigo = usfm.strip().upper()
    nt = numero(codigo) > ULTIMO_AT
    testamento = "NT" if nt else "AT"
    cap = None if capitulo is None else int(capitulo)
    if not nt and cap is None:
        raise ValueError(f"{codigo} es del AT: indica el capítulo")
    cfg = config if config is not None else cargar_config()
    siempre = siempre_efectivo(cfg) if siempre is None else set(siempre)
    tokens = fuentes.leer_fuente(codigo, raiz=raiz_fuentes)
    if cap is not None:
        tokens = [t for t in tokens if int(t["id"][3:6]) == cap]
    if not tokens:
        ubicacion = codigo if cap is None else f"{codigo} {cap}"
        raise ValueError(f"{ubicacion} no tiene tokens en la caché")
    if nt:
        enlaces, _ = enlace.enlazar_nt(codigo, raiz_fuentes=raiz_fuentes, raiz_step=raiz_step)
        lexico = {}
    else:
        enlaces, _ = enlace.enlazar_at(codigo, cap, raiz_fuentes=raiz_fuentes, raiz_step=raiz_step)
        if lexico is None:
            lexico = stepbible.leer_lexico("H", raiz=raiz_step)
    frec = fuentes.frecuencias(testamento, raiz=raiz_fuentes)
    items = []
    for t in tokens:
        sb = strong_base(t["strongs"], "G" if nt else "H")
        if sb is None:
            continue
        enl = enlaces.get(t["id"])
        if nt:
            lemma = t["lemma"]
        else:
            clave_lex = strong_canon(enl["dstrong"]) if enl else strong_canon(t["strongs"], "H")
            lemma = lexico.get(clave_lex, {}).get("lema", "")
        items.append({
            "id": t["id"],
            "ref_orig": _ref(t["id"], codigo),
            "strong": enl["dstrong"] if enl else sb,
            "strong_base": sb,
            "lemma": lemma,
            "forma": t["text"],
            "morph": t["morph"] or (enl["morf_step"] if enl else ""),
            "pos": t["pos"],
            "frecuencia": frec.get(sb, 0),
        })
    return elegir(items, cfg, testamento, siempre)


def _escribir(nombre, codigo, capitulo, items):
    os.makedirs(SALIDA, exist_ok=True)
    ruta = os.path.join(SALIDA, f"{nombre}.seleccion.json")
    with open(ruta, "w", encoding="utf-8") as f:
        json.dump({"libro": codigo, "capitulo": capitulo, "items": items}, f, ensure_ascii=False, indent=1)
    return ruta


def main(argv=None):
    parser = argparse.ArgumentParser(description="Selección de palabras del original con nota.")
    parser.add_argument("--libro", required=True, help="código USFM, p. ej. JAS o RUT")
    parser.add_argument("--capitulo", type=int, help="capítulo, p. ej. 1 (obligatorio en el AT)")
    args = parser.parse_args(argv)
    codigo = args.libro.strip().upper()
    try:
        items = seleccionar(codigo, capitulo=args.capitulo)
    except (ValueError, OSError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    nombre = codigo if args.capitulo is None else f"{codigo}-{args.capitulo}"
    _escribir(nombre, codigo, args.capitulo, items)
    lemas = len({item["strong_base"] for item in items})
    print(f"tokens {len(items)} · lemas {lemas}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
