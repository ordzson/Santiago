#!/usr/bin/env python3
"""Medición del borrador de notas contra la muestra de oro (`oro/<libro>.json`).

Uso: python3 -I estudio/herramientas/original/medir.py --libro JAS

Une cada entrada del oro con las notas del borrador por (ref, strong_base). Una entrada con
palabra es correcta si los tokens del `word` de la nota (minúsculas, solo letras) están todos en
el `word` del oro, o al revés. Oro nulo con nota → incorrecta. Si varias notas comparten clave con
una entrada del oro, se evalúa la que coincide (o la primera) y el resto se lista como no evaluado.
Escribe `reportes/<LIBRO>.medicion.md`; su última línea es `alta: n · precisión p %`.

Además mide la selección como `generar.py`: tokens con destino RV09 y tokens con `word`.
Solo biblioteca estándar.
"""
import argparse
import datetime
import json
import os
import re
import sys
import unicodedata
from collections import OrderedDict, defaultdict

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

import enlace  # noqa: E402
import generar  # noqa: E402
import lexico  # noqa: E402
import rvr1960  # noqa: E402
import seleccion  # noqa: E402
import transferir  # noqa: E402
from libros import id_app, numero, strong_base  # noqa: E402

ORO_DIR = os.path.join(BASE, "oro")
_LETRAS = re.compile(r"[^\W\d_]+")
_REGLA = re.compile(r"\(([a-z_]+)\)\s*$")


def tokens(texto):
    """Palabras del texto en minúsculas y solo letras, como conjunto (NFC para los acentos)."""
    return frozenset(_LETRAS.findall(unicodedata.normalize("NFC", texto or "").lower()))


def coincide(word, oro):
    """True si los tokens del `word` del borrador están todos en el del oro, o al revés.

    Ambos deben tener al menos un token.
    """
    a, b = tokens(word), tokens(oro)
    return bool(a) and bool(b) and (a <= b or b <= a)


def clave(ref, strong):
    """Clave de unión: referencia USFM y Strong base (`G3985G` → `G3985`)."""
    return (ref, strong_base(strong, "G"))


def regla_de(nota):
    """Regla de la nota, leída de `source` («RV09 manual → RVR1960 (igual)»). «—» si no la trae."""
    m = _REGLA.search(nota.get("source", ""))
    return m.group(1) if m else "—"


def evaluar(libro, oro_lista, notas):
    """Une oro y notas. Devuelve `(filas, sin_nota, sin_evaluar)`.

    `filas`: `{oro, nota, correcta}` por entrada del oro que tiene nota (una por entrada).
    `sin_nota`: entradas del oro con palabra sin ninguna nota.
    `sin_evaluar`: notas que comparten clave con una entrada del oro pero no se evaluaron.
    """
    grupos = defaultdict(list)
    for nota in notas:
        grupos[clave(f"{libro}.{nota['chapter']}.{nota['verse']}", nota["strong"])].append(nota)
    vistos, filas, sin_nota, sin_evaluar = set(), [], [], []
    for entrada in oro_lista:
        k = clave(entrada["ref"], entrada["strong"])
        if k in vistos:
            raise ValueError(f"entrada repetida en el oro: {entrada['ref']} {entrada['strong']}")
        vistos.add(k)
        cands = grupos.get(k, [])
        palabra = entrada.get("word")
        if not cands:
            if palabra is not None:
                sin_nota.append(entrada)
            continue
        if palabra is None:
            evaluada, correcta = cands[0], False  # oro nulo con nota: incorrecta
        else:
            acierto = next((c for c in cands if coincide(c["word"], palabra)), None)
            evaluada = acierto if acierto is not None else cands[0]
            correcta = acierto is not None
        filas.append({"oro": entrada, "nota": evaluada, "correcta": correcta})
        sin_evaluar.extend(c for c in cands if c is not evaluada)
    return filas, sin_nota, sin_evaluar


def porcentaje(parte, total):
    """`82,4 %` con coma decimal; «—» si el total es cero."""
    if not total:
        return "—"
    return f"{100 * parte / total:.1f}".replace(".", ",") + " %"


def tabla_por(filas, valor, nombre, orden):
    """Tabla Markdown `n · correctas · precisión` agrupada por `valor(nota)`, en el orden dado."""
    grupos = OrderedDict((v, []) for v in orden)
    for f in filas:
        grupos.setdefault(valor(f["nota"]), []).append(f)
    lineas = [f"| {nombre} | n | correctas | precisión |", "|---|---|---|---|"]
    for v, lst in grupos.items():
        correctas = sum(1 for f in lst if f["correcta"])
        lineas.append(f"| {v} | {len(lst)} | {correctas} | {porcentaje(correctas, len(lst))} |")
    return lineas


def cuenta_alineacion(items, res):
    """Tokens seleccionados, con destino RV09 y con `word` (misma regla que `generar.resumen`)."""
    total = len(items)
    con_destino = sum(1 for i in items if res.get(i["id"], {}).get("regla", "sin_par") != "sin_par")
    con_word = sum(1 for i in items if "word" in res.get(i["id"], {}))
    return {"tokens": total, "con_destino": con_destino, "con_word": con_word}


def alineacion(codigo, config=None, datos=None):
    """Recalcula la selección y la transferencia del libro, igual que `generar.generar`, sin escribir."""
    config = config if config is not None else seleccion.cargar_config()
    datos = datos if datos is not None else rvr1960.leer(rvr1960.ENTRADA_POR_DEFECTO)
    enlaces, _ = enlace.enlazar_nt(codigo)
    items = seleccion.seleccionar(codigo, config=config)
    lex = lexico.cargar_lexico()
    pistas = {}
    for item in items:
        e = dict(enlaces.get(item["id"]) or {})
        e["es_step"] = e.get("es_step") or generar.entrada_lexico(lex, item).get("gloss", "")
        pistas[item["id"]] = e
    res = transferir.transferir_libro(codigo, items, pistas, datos, config=config)
    return cuenta_alineacion(items, res)


def _celda(valor):
    return str(valor).replace("|", "\\|").replace("\n", " ")


def construir_reporte(codigo, slug, n_notas, oro_lista, filas, sin_nota, sin_evaluar, alin, ahora):
    """Líneas del reporte. La última es `alta: n · precisión p %`."""
    con_palabra = sum(1 for e in oro_lista if e.get("word") is not None)
    nulas = len(oro_lista) - con_palabra
    con_nota = sum(1 for f in filas if f["oro"].get("word") is not None)
    fuera_oro = n_notas - len(filas) - len(sin_evaluar)
    alta = [f for f in filas if f["nota"].get("confidence") == "alta"]
    alta_ok = sum(1 for f in alta if f["correcta"])

    reglas_orden = list(generar.REGLAS)
    reglas_orden += sorted({regla_de(f["nota"]) for f in filas} - set(reglas_orden))

    lineas = [
        f"# {codigo} · medición del borrador contra la muestra de oro",
        "",
        f"Generado: {ahora.isoformat(timespec='seconds')}. Borrador: {n_notas} notas de «{slug}» "
        f"(`griego.rvr1960.borrador.json`). Muestra: `oro/{slug}.json`, {len(oro_lista)} entradas "
        f"({con_palabra} con palabra, {nulas} nulas).",
        "",
        "Regla de acierto: se unen oro y nota por referencia y Strong base. Correcta si los tokens "
        "del `word` de la nota (minúsculas, solo letras) están todos en el del oro, o al revés. "
        "Oro nulo con nota: incorrecta.",
        "",
        "## Cobertura",
        f"- Oro con palabra y con nota: {con_nota} de {con_palabra} ({porcentaje(con_nota, con_palabra)}).",
        f"- Oro con palabra sin nota: {len(sin_nota)}. Oro nulo sin nota: {nulas - sum(1 for f in filas if f['oro'].get('word') is None)}.",
        f"- Notas evaluadas: {len(filas)}. Notas no evaluadas por compartir clave con otra del oro: "
        f"{len(sin_evaluar)}. Notas fuera del oro: {fuera_oro}.",
        "",
        "## Por confianza",
        *tabla_por(filas, lambda n: n.get("confidence", "—"), "confianza", generar.CONFIANZAS),
        "",
        "## Por regla",
        *tabla_por(filas, regla_de, "regla", reglas_orden),
        "",
        "## Selección y alineación",
        f"- Tokens seleccionados: {alin['tokens']} · con destino RV09: {alin['con_destino']} "
        f"({porcentaje(alin['con_destino'], alin['tokens'])}) · con word: {alin['con_word']} "
        f"({porcentaje(alin['con_word'], alin['tokens'])}).",
        "",
        "## Fallos",
    ]
    fallos = [f for f in filas if not f["correcta"]]
    if fallos:
        lineas += ["| ref | strong | oro | word del borrador | confianza | regla |", "|---|---|---|---|---|---|"]
        for f in fallos:
            o, n = f["oro"], f["nota"]
            palabra = "nulo" if o.get("word") is None else o["word"]
            celdas = [o["ref"], o["strong"], palabra, n["word"], n.get("confidence", "—"), regla_de(n)]
            lineas.append("| " + " | ".join(_celda(c) for c in celdas) + " |")
    else:
        lineas.append("Ninguno.")
    lineas += ["", "## Oro con palabra sin nota"]
    lineas += [f"- {e['ref']} · {e['strong']} · {e['word']}" for e in sin_nota] or ["Ninguna."]
    lineas += ["", "## Notas no evaluadas"]
    lineas += [f"- {codigo}.{n['chapter']}.{n['verse']} · {n['strong']} · {n['word']} "
               f"({n.get('confidence', '—')})" for n in sin_evaluar] or ["Ninguna."]
    lineas += ["", f"alta: {len(alta)} · precisión {porcentaje(alta_ok, len(alta))}"]
    return lineas


def escribir_reporte(lineas, carpeta, codigo):
    os.makedirs(carpeta, exist_ok=True)
    ruta = os.path.join(carpeta, f"{codigo}.medicion.md")
    with open(ruta, "w", encoding="utf-8") as f:
        f.write("\n".join(lineas) + "\n")
    return ruta


def medir(libro, *, oro=None, borrador=None, reportes=None, config=None, datos=None, alin=None,
          ahora=None):
    """Mide el borrador del libro (NT) contra su muestra de oro y escribe el reporte.

    `oro`, `borrador`, `reportes`, `config`, `datos` y `alin` (cuenta de alineación) permiten
    inyectar datos (pruebas). Devuelve un dict con conteos, la ruta del reporte y su última línea.
    """
    codigo = libro.strip().upper()
    if numero(codigo) <= generar.ULTIMO_AT:
        raise ValueError(f"{codigo} es del AT: la muestra de oro solo cubre el NT")
    datos = datos if datos is not None else rvr1960.leer(rvr1960.ENTRADA_POR_DEFECTO)
    slug = id_app(datos[codigo]["nombre"])
    ruta_oro = oro or os.path.join(ORO_DIR, f"{slug}.json")
    ruta_borrador = borrador or os.path.join(generar.PUBLICO, f"{generar.IDIOMA['NT']}.rvr1960.borrador.json")
    with open(ruta_oro, encoding="utf-8") as f:
        oro_lista = json.load(f)
    with open(ruta_borrador, encoding="utf-8") as f:
        notas = [n for n in json.load(f)["notes"] if n.get("book") == slug]
    filas, sin_nota, sin_evaluar = evaluar(codigo, oro_lista, notas)
    alin = alin if alin is not None else alineacion(codigo, config=config, datos=datos)
    ahora = ahora if ahora is not None else datetime.datetime.now().astimezone()
    lineas = construir_reporte(codigo, slug, len(notas), oro_lista, filas, sin_nota, sin_evaluar,
                               alin, ahora)
    ruta = escribir_reporte(lineas, reportes or generar.REPORTES, codigo)
    return {"reporte": ruta, "ultima": lineas[-1], "entradas": len(oro_lista),
            "evaluadas": len(filas), "no_evaluadas": len(sin_evaluar), "notas": len(notas)}


def main(argv=None):
    parser = argparse.ArgumentParser(description="Mide el borrador contra la muestra de oro.")
    parser.add_argument("--libro", required=True, help="código USFM del NT, p. ej. JAS")
    args = parser.parse_args(argv)
    try:
        r = medir(args.libro)
    except (ValueError, OSError, KeyError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    print(f"{args.libro.upper()}: {r['evaluadas']} notas evaluadas de {r['entradas']} entradas · "
          f"{r['no_evaluadas']} no evaluadas · {r['notas']} notas en el borrador")
    print(f"reporte: {r['reporte']}")
    print(r["ultima"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
