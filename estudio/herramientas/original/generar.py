#!/usr/bin/env python3
"""Borradores de notas del original para la RVR1960 (griego del NT, hebreo del AT).

Uso:
  python3 -I estudio/herramientas/original/generar.py --libro JAS
  python3 -I estudio/herramientas/original/generar.py --libro RUT --capitulo 1

Cadena: enlace (Clear ↔ STEPBible) → selección → transferencia RV09 → RVR1960 → nota con el
contrato de PLAN.md (§Contratos). En el borrador reemplaza solo el libro (o el capítulo) generado
y escribe `reportes/<JAS|RUT-1>.revisar.md` y `.resumen.txt`. Solo biblioteca estándar.
"""
import argparse
import datetime
import json
import os
import re
import sys
from collections import Counter, OrderedDict

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

import enlace  # noqa: E402
import lexico  # noqa: E402
import rvr1960  # noqa: E402
import seleccion  # noqa: E402
import transferir  # noqa: E402
from libros import id_app, numero  # noqa: E402

ULTIMO_AT = 39  # 1–39 = AT, 40–66 = NT
PUBLICO = os.path.normpath(os.path.join(BASE, "..", "..", "public", "data"))
REPORTES = os.path.join(BASE, "reportes")
CREDITOS = ("Notas generadas con datos de Clear Bible (BiblioNexus), STEPBible (Tyndale House), "
            "SBLGNT y UXLC · CC BY 4.0.")
IDIOMA = {"NT": "griego", "AT": "hebreo"}
# Escrituras que la app acepta para cada idioma (mismos rangos que `SCRIPTS` de content.ts).
ESCRITURA = {
    "griego": re.compile(r"[\u0370-\u03FF\u1F00-\u1FFF]"),
    "hebreo": re.compile(r"[\u0590-\u05FF\uFB1D-\uFB4F]"),
}
CONFIANZAS = ["alta", "media", "revisar"]  # de mejor a peor, para elegir entre duplicados
REGLAS = ["igual", "equivalencia", "pista", "no_contiguo", "ambiguo"]


class FaltanStrong(ValueError):
    """Hay Strong seleccionados sin glosa en `lexico-es.json`."""

    def __init__(self, strongs):
        self.strongs = strongs
        super().__init__(
            f"faltan {len(strongs)} Strong en lexico-es.json: {', '.join(strongs)} "
            "(corre lexico.py preparar)")


def testamento(codigo):
    return "AT" if numero(codigo) <= ULTIMO_AT else "NT"


def prefijo(codigo, capitulo):
    """Nombre de los reportes: `JAS` o `RUT-1`."""
    return codigo if capitulo is None else f"{codigo}-{capitulo}"


def referencia(ref):
    """`JAS.1.2` → (1, 2)."""
    _, cap, vers = ref.split(".")
    return int(cap), int(vers)


def entrada_lexico(lex, item):
    """Entrada de `lexico-es.json` del ítem (misma clave que `lexico.preparar`)."""
    return lex.get(lexico.clave(item["strong"])) or {}


def faltan_strong(items, lex):
    """Strong de los ítems sin glosa en el léxico, ordenados."""
    return sorted({item["strong"] for item in items if not entrada_lexico(lex, item).get("gloss")})


def original_y_translit(item, enl, ent, modo):
    """Término original y transliteración. `lema`: lema y translit del léxico STEPBible (con
    respaldo en el lema de la fuente y en la forma); `forma`: forma y translit del enlace."""
    if modo == "forma":
        return item["forma"], enl.get("translit_forma", "")
    original = ent.get("lema") or item["lemma"] or item["forma"]
    return original, ent.get("translit") or enl.get("translit_forma", "")


def motivo_invalida(nota, texto, idioma):
    """Motivo por el que la nota no entra en el borrador (la app la rechazaría), o None."""
    if not nota["original"]:
        return "sin_original"
    if not nota["transliteration"]:
        return "sin_translit"
    if not nota["meaning"]:
        return "sin_glosa"
    if not ESCRITURA[idioma].search(nota["original"]):
        return "escritura"
    if not transferir.encontrar_app(texto, nota["word"]):
        return "no_literal"
    return None


def _texto(datos, codigo, cap, vers):
    try:
        return rvr1960.texto_versiculo(datos, codigo, cap, vers)
    except KeyError:
        return ""


def candidatos(codigo, items, enlaces, res, lex, datos, modo, diferencias):
    """Filas del reporte (una por ítem, en orden de texto) y notas candidatas `(orden, nota, fila)`.

    `diferencias`: capítulos cuyo número de versículos difiere entre RV09 y RVR1960; sus notas
    salen con confianza `revisar`.
    """
    idioma = IDIOMA[testamento(codigo)]
    slug = id_app(datos[codigo]["nombre"])
    filas, cands = [], []
    for orden, item in enumerate(items):
        r = res.get(item["id"]) or {"regla": "sin_par"}
        ref = r.get("ref") or item["ref_orig"]
        cap, vers = referencia(ref)
        texto = _texto(datos, codigo, cap, vers)
        ent = entrada_lexico(lex, item)
        original, translit = original_y_translit(item, enlaces.get(item["id"]) or {}, ent, modo)
        fila = {"ref": ref, "texto": texto, "lema": original, "glosa": ent.get("gloss", ""),
                "word": "—", "regla": r["regla"], "motivo": ""}
        filas.append(fila)
        if "word" not in r:
            continue
        fila["word"] = r["word"]
        nota = OrderedDict([
            ("book", slug), ("chapter", cap), ("verse", vers), ("word", r["word"]),
            ("original", original), ("transliteration", translit), ("meaning", ent.get("gloss", "")),
            ("context", ""), ("strong", lexico.clave(item["strong"])),
            ("lemma", item["lemma"] or ent.get("lema", "")), ("morph", item["morph"]),
            ("confidence", "revisar" if cap in diferencias else r["confidence"]),
            ("source", f"RV09 manual → RVR1960 ({r['regla']})"),
        ])
        motivo = motivo_invalida(nota, texto, idioma)
        if motivo:
            fila["motivo"] = motivo
            continue
        cands.append((orden, nota, fila))
    return filas, cands


def _rango(valor, orden):
    return orden.index(valor) if valor in orden else len(orden)


def deduplicar(cands):
    """Quita notas con el mismo `word` (sin mayúsculas) en un versículo: gana la de mayor confianza,
    luego la regla más fiable y luego la primera en el texto. Devuelve `(notas, duplicadas)`."""
    grupos = OrderedDict()
    for cand in cands:
        _, nota, _ = cand
        clave = (nota["chapter"], nota["verse"], nota["word"].lower())
        grupos.setdefault(clave, []).append(cand)
    notas, duplicadas = [], []
    for grupo in grupos.values():
        grupo.sort(key=lambda c: (_rango(c[1]["confidence"], CONFIANZAS),
                                  _rango(c[2]["regla"], REGLAS), c[0]))
        notas.append(grupo[0])
        for cand in grupo[1:]:
            cand[2]["motivo"] = "duplicado"
            duplicadas.append(cand)
    notas.sort(key=lambda c: c[0])
    return [n for _, n, _ in notas], [f for _, _, f in duplicadas]


def escribir_borrador(codigo, capitulo, notas, slug, salida, ahora):
    """Reemplaza en el borrador solo las notas del libro (o capítulo) y conserva el resto."""
    ruta = os.path.join(salida, f"{IDIOMA[testamento(codigo)]}.rvr1960.borrador.json")
    previas = []
    if os.path.exists(ruta):
        with open(ruta, encoding="utf-8") as f:
            previas = json.load(f).get("notes", [])
    conservadas = [n for n in previas
                   if not (n.get("book") == slug and (capitulo is None or n.get("chapter") == capitulo))]
    total = conservadas + notas
    total.sort(key=lambda n: (n["book"], n["chapter"], n["verse"]))  # estable: el orden de texto se mantiene
    doc = {"generado": ahora.isoformat(timespec="seconds"), "creditos": CREDITOS, "notes": total}
    os.makedirs(salida, exist_ok=True)
    tmp = ruta + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
        f.write("\n")
    os.replace(tmp, ruta)
    return ruta


def _celda(valor):
    return str(valor).replace("|", "\\|").replace("\n", " ")


def tabla(filas):
    """Tabla Markdown por versículo: el texto RVR1960 solo aparece en la primera fila de cada uno."""
    lineas = ["| ref | versículo RVR1960 | lema | glosa | word | regla |", "|---|---|---|---|---|---|"]
    anterior = None
    for fila in filas:
        texto = fila["texto"] if fila["ref"] != anterior else ""
        anterior = fila["ref"]
        regla = fila["regla"] + (f" · {fila['motivo']}" if fila["motivo"] else "")
        celdas = [fila["ref"], texto, fila["lema"], fila["glosa"], fila["word"], regla]
        lineas.append("| " + " | ".join(_celda(c) for c in celdas) + " |")
    return "\n".join(lineas)


def _pct(parte, total):
    return f"{100 * parte / max(total, 1):.1f}".replace(".", ",")


def resumen(codigo, capitulo, items, res, notas, duplicadas, invalidas, diferencias):
    """Líneas de `resumen.txt`: conteos por confianza y regla y porcentajes de alineación."""
    total = len(items)
    con_word = sum(1 for i in items if "word" in res.get(i["id"], {}))
    con_destino = sum(1 for i in items if res.get(i["id"], {}).get("regla") != "sin_par")
    reglas = Counter(res.get(i["id"], {}).get("regla", "sin_par") for i in items)
    confianzas = Counter(n["confidence"] for n in notas)
    lineas = [
        f"{prefijo(codigo, capitulo)}: {total} tokens seleccionados · {con_word} con word "
        f"({_pct(con_word, total)} %) · {con_destino} con destino RV09 ({_pct(con_destino, total)} %)",
        f"Notas en el borrador: {len(notas)} · duplicados quitados: {len(duplicadas)} · "
        f"no válidas: {invalidas}",
        "Por confianza (notas): " + " · ".join(f"{c} {confianzas.get(c, 0)}" for c in CONFIANZAS),
        "Por regla (tokens): " + " · ".join(f"{r} {n}" for r, n in reglas.most_common()),
    ]
    if diferencias:
        lineas.append("Versificación RV09 vs RVR1960 (notas de estos capítulos a revisar): "
                      + ", ".join(f"{c} ({a} vs {b})" for c, a, b in diferencias))
    else:
        lineas.append("Versificación RV09 vs RVR1960: sin diferencias")
    return lineas


def escribir_reportes(codigo, capitulo, filas, lineas_resumen, ahora, reportes):
    os.makedirs(reportes, exist_ok=True)
    nombre = prefijo(codigo, capitulo)
    ruta_md = os.path.join(reportes, f"{nombre}.revisar.md")
    with open(ruta_md, "w", encoding="utf-8") as f:
        f.write(f"# {nombre} · revisión de las notas generadas\n\n")
        f.write(f"Generado: {ahora.isoformat(timespec='seconds')}. "
                "Una fila por palabra seleccionada, en orden de texto.\n\n")
        f.write(tabla(filas) + "\n")
    ruta_txt = os.path.join(reportes, f"{nombre}.resumen.txt")
    with open(ruta_txt, "w", encoding="utf-8") as f:
        f.write("\n".join(lineas_resumen) + "\n")
    return ruta_md, ruta_txt


def generar(usfm, capitulo=None, *, salida=PUBLICO, reportes=REPORTES, config=None, lex=None,
            datos=None, raiz_fuentes=None, raiz_step=None, ahora=None):
    """Genera el borrador y los reportes del libro (o capítulo). Devuelve un dict con los conteos y
    las rutas escritas. Lanza `FaltanStrong` si el léxico no cubre la selección.

    `config`, `lex`, `datos` (RVR1960 leída) y las raíces de fuentes permiten inyectar datos.
    """
    codigo = usfm.strip().upper()
    nt = testamento(codigo) == "NT"
    if not nt and capitulo is None:
        raise ValueError(f"{codigo} es del AT: indica el capítulo")
    cap = None if capitulo is None else int(capitulo)
    config = config if config is not None else seleccion.cargar_config()
    modo = config.get("original", "lema")
    if modo not in ("lema", "forma"):
        raise ValueError(f"config.original debe ser «lema» o «forma», no {modo!r}")
    ahora = ahora if ahora is not None else datetime.datetime.now().astimezone()

    if nt:
        enlaces, _ = enlace.enlazar_nt(codigo, raiz_fuentes=raiz_fuentes, raiz_step=raiz_step)
    else:
        enlaces, _ = enlace.enlazar_at(codigo, cap, raiz_fuentes=raiz_fuentes, raiz_step=raiz_step)
    items = seleccion.seleccionar(codigo, capitulo=cap, config=config,
                                  raiz_fuentes=raiz_fuentes, raiz_step=raiz_step)
    lex = lexico.cargar_lexico() if lex is None else lex
    faltan = faltan_strong(items, lex)
    if faltan:
        raise FaltanStrong(faltan)

    datos = rvr1960.leer(rvr1960.ENTRADA_POR_DEFECTO) if datos is None else datos
    diferencias = transferir.comparar_versificacion(codigo, datos_rvr=datos)
    capitulos_distintos = {c for c, _, _ in diferencias}
    # Pista de glosa: la del enlace (TAGNT) o, si falta (AT), la glosa revisada del léxico.
    para_pistas = {}
    for item in items:
        e = dict(enlaces.get(item["id"]) or {})
        e["es_step"] = e.get("es_step") or entrada_lexico(lex, item).get("gloss", "")
        para_pistas[item["id"]] = e
    res = transferir.transferir_libro(codigo, items, para_pistas, datos, config=config, capitulo=cap)

    filas, cands = candidatos(codigo, items, enlaces, res, lex, datos, modo, capitulos_distintos)
    invalidas = sum(1 for f in filas if f["motivo"])  # antes de deduplicar: solo validación
    notas, duplicadas = deduplicar(cands)
    slug = id_app(datos[codigo]["nombre"])
    ruta_borrador = escribir_borrador(codigo, cap, notas, slug, salida, ahora)
    lineas = resumen(codigo, cap, items, res, notas, duplicadas, invalidas, diferencias)
    ruta_md, ruta_txt = escribir_reportes(codigo, cap, filas, lineas, ahora, reportes)
    return {"prefijo": prefijo(codigo, cap), "tokens": len(items), "notas": len(notas),
            "duplicadas": len(duplicadas), "invalidas": invalidas, "borrador": ruta_borrador,
            "reporte": ruta_md, "resumen": ruta_txt, "lineas": lineas}


def main(argv=None):
    parser = argparse.ArgumentParser(description="Genera borradores de notas RVR1960 del original.")
    parser.add_argument("--libro", required=True, help="código USFM, p. ej. JAS o RUT")
    parser.add_argument("--capitulo", type=int, help="capítulo, p. ej. 1 (obligatorio en el AT)")
    args = parser.parse_args(argv)
    try:
        r = generar(args.libro, args.capitulo)  # FaltanStrong también es ValueError
    except (ValueError, OSError, KeyError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    print(f"{r['prefijo']}: {r['notas']} notas · {r['duplicadas']} duplicadas · "
          f"{r['invalidas']} no válidas")
    print(f"borrador: {r['borrador']}")
    print(f"reportes: {r['reporte']} · {r['resumen']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
