#!/usr/bin/env python3
"""Léxico en español del original: lotes de traducción, validación e incorporación.

Uso:
  python3 -I estudio/herramientas/original/lexico.py preparar --libro JAS [--capitulo N]
  python3 -I estudio/herramientas/original/lexico.py incorporar estudio/herramientas/original/.cache/lotes/JAS-001.respuesta.json
  python3 -I estudio/herramientas/original/lexico.py estado --libro JAS [--capitulo N]
  python3 -I estudio/herramientas/original/lexico.py revision --libro JAS [--capitulo N] [--max 40]
  python3 -I estudio/herramientas/original/lexico.py aplicar-revision estudio/herramientas/original/.cache/salida/JAS.revision.respuesta.json

`preparar` toma los Strong (dStrong) de la selección de seleccion.py que aún no están en
HO/lexico-es.json y los parte en lotes de 50 (HO/.cache/lotes/<JAS|RUT-1>-NNN.json). Cada entrada
lleva la glosa y la frase inglesas de STEPBible, la palabra RV09 más frecuente alineada al Strong
en el libro (pista) y el término fijo de HO/glosario.json o null.
`incorporar` valida la respuesta del modelo (HO/instrucciones-traduccion.md) contra su lote y la
fusiona en HO/lexico-es.json sin sobrescribir entradas existentes. `estado` cuenta los pendientes.
`revision` escribe la lista de revisión teológica del libro (entradas `review: true`): las primeras
`--max` líneas van a HO/.cache/salida/<libro>.revision.txt y el resto a
HO/reportes/<libro>.revision-pendiente.md. `aplicar-revision` valida `{strong: {gloss, short}}` y
marca esas entradas `review: false`, `revisado: "opus"`.
Solo biblioteca estándar.
"""
import argparse
import json
import os
import re
import sys
import unicodedata
from collections import Counter, OrderedDict, defaultdict

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

import fuentes  # noqa: E402
import rvr1960  # noqa: E402
import seleccion  # noqa: E402
import stepbible  # noqa: E402
from libros import numero, strong_base, strong_canon  # noqa: E402

LEXICO = os.path.join(BASE, "lexico-es.json")
GLOSARIO = os.path.join(BASE, "glosario.json")
LOTES = os.path.join(BASE, ".cache", "lotes")
TAMANO_LOTE = 50
MAX_GLOSS = 3
MAX_SHORT = 20
ULTIMO_AT = 39  # 1–39 = AT, 40–66 = NT
CLAVES_RESPUESTA = {"strong", "gloss", "short"}
SUFIJO_RESPUESTA = ".respuesta.json"
MAX_REVISION = 40  # líneas de <libro>.revision.txt (T16 las revisa de una vez)
LARGO_VERSICULO = 160
CLAVES_REVISION = {"gloss", "short"}
REVISADO = "opus"
SALIDA = os.path.join(BASE, ".cache", "salida")
REPORTES = os.path.join(BASE, "reportes")

# Palabras de gloss_en/short_en que señalan un término teológico para revisión humana.
PALABRAS_REVISION = (
    "god", "lord", "holy", "sin", "faith", "believe", "righteous", "grace", "mercy", "law",
    "spirit", "soul", "flesh", "save", "salvation", "redeem", "covenant", "glory", "kingdom",
    "church", "repent", "forgive", "sacrifice", "temple", "priest", "worship", "bless", "curse",
    "judge",
)
_FLEXION = "s|es|d|ed|n|en|ing|ings|ness|ment|ful|ly|ship"
_REVISION = re.compile(r"\b(?:" + "|".join(PALABRAS_REVISION) + r")(?:" + _FLEXION + r")?\b")


def _lengua(strong):
    """«G» o «H» según la primera letra del Strong."""
    lengua = (strong or " ")[0]
    if lengua not in ("G", "H"):
        raise ValueError(f"Strong sin lengua («G» o «H»): {strong!r}")
    return lengua


def clave(strong):
    """Clave del léxico: Strong canónico, sin ceros pero con sufijo (`G0976` → `G976`, `G2962G`)."""
    return strong_canon(strong, _lengua(strong))


def base(strong):
    """Strong base del dStrong (`G2962G` → `G2962`)."""
    return strong_base(strong, _lengua(strong))


def termino_glosario(strong, glosario):
    """Término fijo del glosario para el Strong (por su base), o None."""
    return glosario.get(base(strong))


def requiere_revision(strong, gloss_en, short_en, glosario):
    """`review: true` si el Strong está en el glosario o su glosa/definición inglesa trae un término
    teológico de PALABRAS_REVISION (en forma base o con flexión: «saved», «forgiveness»)."""
    if termino_glosario(strong, glosario) is not None:
        return True
    return bool(_REVISION.search(f"{gloss_en or ''} {short_en or ''}".lower()))


def _leer_json(ruta, por_defecto=None):
    if not os.path.exists(ruta):
        return por_defecto
    with open(ruta, encoding="utf-8") as f:
        return json.load(f)


def cargar_glosario(ruta=GLOSARIO):
    """`glosario.json`: objeto cuyas claves son Strong base y cuyos valores, el término fijo."""
    glosario = _leer_json(ruta, {})
    if not isinstance(glosario, dict):
        raise ValueError("glosario.json debe ser un objeto cuyas claves son Strong")
    return glosario


def cargar_lexico(ruta=LEXICO):
    """`lexico-es.json`: `{strong: {lemma, translit, gloss, short, review, fuente}}`."""
    lexico = _leer_json(ruta, {})
    if not isinstance(lexico, dict):
        raise ValueError("lexico-es.json debe ser un objeto cuyas claves son Strong")
    return lexico


def guardar_lexico(lexico, ruta=LEXICO):
    """Escribe el léxico con las claves Strong ordenadas (de forma atómica)."""
    ordenado = OrderedDict((k, lexico[k]) for k in sorted(lexico))
    tmp = ruta + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(ordenado, f, ensure_ascii=False, indent=2)
        f.write("\n")
    os.replace(tmp, ruta)


def palabras_rv09(usfm, raiz_fuentes=None, config=None):
    """Conteo de palabras RV09 por Strong base del libro: `{strong_base: Counter(palabra)}`.

    Cada destino de una alineación manual aporta sus palabras (minúsculas, sin `exclude` ni
    `vacias_es` de config.json) a los Strong de su origen; cuenta por ocurrencia.
    """
    cfg = config if config is not None else seleccion.cargar_config()
    vacias = set(cfg["vacias_es"])
    n = numero(usfm)
    lengua = "H" if n <= ULTIMO_AT else "G"
    sb_por_id = {}
    for token in fuentes.leer_fuente(usfm, raiz=raiz_fuentes):
        sb = strong_base(token["strongs"], lengua)
        if sb:
            sb_por_id[token["id"]] = sb
    texto_por_id = {fila["id"]: fila["text"] for fila in fuentes.leer_rv09(usfm, raiz=raiz_fuentes)
                    if not fila["exclude"]}
    conteo = defaultdict(Counter)
    for origen, destino in fuentes.leer_alineacion(usfm, raiz=raiz_fuentes):
        strongs = {sb_por_id[o] for o in origen if o in sb_por_id}
        if not strongs:
            continue
        palabras = []
        for d in destino:
            for p in re.findall(r"[^\W\d_]+", texto_por_id.get(d, "").lower()):
                if p not in vacias:
                    palabras.append(p)
        for sb in strongs:
            conteo[sb].update(palabras)
    return conteo


def es_rv09(strong, conteo):
    """Palabra RV09 más frecuente alineada al Strong base, o None si no hay."""
    c = conteo.get(base(strong))
    if not c:
        return None
    return c.most_common(1)[0][0]


def seleccion_por_strong(usfm, capitulo=None, raiz_fuentes=None, raiz_step=None):
    """Selección de seleccion.py reducida a un ítem por Strong: `OrderedDict{clave: item}` en orden de
    texto (el primero de cada Strong aporta el lema)."""
    items = seleccion.seleccionar(usfm, capitulo=capitulo, raiz_fuentes=raiz_fuentes, raiz_step=raiz_step)
    por_strong = OrderedDict()
    for item in items:
        por_strong.setdefault(clave(item["strong"]), item)
    return por_strong


def _nombre_libro(usfm, capitulo):
    codigo = usfm.strip().upper()
    numero(codigo)
    return codigo if capitulo is None else f"{codigo}-{int(capitulo)}"


def _patron_lote(prefijo):
    """Nombre de un lote (`JAS-001.json`) o de su respuesta (`JAS-001.respuesta.json`)."""
    return re.compile(rf"^{re.escape(prefijo)}-\d{{3}}(?:\.respuesta)?\.json$")


def existen_lotes(prefijo, lotes=LOTES):
    """True si ya hay lotes (o respuestas) con ese prefijo en la carpeta de lotes."""
    if not os.path.isdir(lotes):
        return False
    patron = _patron_lote(prefijo)
    return any(patron.match(nombre) for nombre in os.listdir(lotes))


def preparar(usfm, capitulo=None, *, lexico=LEXICO, glosario=GLOSARIO, lotes=LOTES,
             raiz_fuentes=None, raiz_step=None):
    """Crea los lotes de los Strong pendientes. Devuelve `([(nombre, n)], pendientes)`.

    Se niega a sobrescribir lotes ya existentes del mismo libro (o capítulo).
    """
    prefijo = _nombre_libro(usfm, capitulo)
    if existen_lotes(prefijo, lotes):
        raise ValueError(f"ya hay lotes de {prefijo} en {lotes}; bórralos antes de prepararlos de nuevo")
    por_strong = seleccion_por_strong(usfm, capitulo, raiz_fuentes=raiz_fuentes, raiz_step=raiz_step)
    lex = cargar_lexico(lexico)
    glos = cargar_glosario(glosario)
    pendientes = [k for k in por_strong if k not in lex]
    if not pendientes:
        return [], 0
    conteo = palabras_rv09(usfm, raiz_fuentes=raiz_fuentes)
    datos = {}
    entradas = []
    for k in pendientes:
        lengua = _lengua(k)
        if lengua not in datos:
            datos[lengua] = stepbible.leer_lexico(lengua, raiz=raiz_step)
        lex_st = datos[lengua].get(k) or datos[lengua].get(base(k)) or {}
        item = por_strong[k]
        entradas.append({
            "strong": k,
            "lemma": item["lemma"] or lex_st.get("lema", ""),
            "gloss_en": lex_st.get("gloss_en", ""),
            "short_en": lex_st.get("short_en", ""),
            "es_rv09": es_rv09(k, conteo),
            "glosario": termino_glosario(k, glos),
        })
    os.makedirs(lotes, exist_ok=True)
    creados = []
    for inicio in range(0, len(entradas), TAMANO_LOTE):
        trozo = entradas[inicio:inicio + TAMANO_LOTE]
        nombre = f"{prefijo}-{inicio // TAMANO_LOTE + 1:03d}"
        with open(os.path.join(lotes, nombre + ".json"), "w", encoding="utf-8") as f:
            json.dump(trozo, f, ensure_ascii=False, indent=1)
            f.write("\n")
        creados.append((nombre, len(trozo)))
    return creados, len(entradas)


def _empieza_por(texto, termino):
    """True si `texto` empieza por el término (sin distinguir mayúsculas, palabra completa)."""
    t = unicodedata.normalize("NFC", texto).casefold()
    r = unicodedata.normalize("NFC", termino).casefold()
    return re.match(re.escape(r) + r"(?!\w)", t) is not None


def validar_respuesta(lote, respuesta):
    """Errores de una respuesta frente a su lote (lista vacía si es válida).

    Comprueba: arreglo de la misma longitud y mismo orden (`strong`), exactamente las claves
    `strong`, `gloss`, `short`, sin vacíos, `gloss` ≤ 3 palabras, `short` ≤ 20 y, si el lote trae
    término de glosario, que `gloss` empiece por él.
    """
    if not isinstance(respuesta, list):
        return ["la respuesta debe ser un arreglo JSON"]
    if len(respuesta) != len(lote):
        return [f"la respuesta trae {len(respuesta)} entradas; el lote tiene {len(lote)}"]
    errores = []
    for i, (entrada, resp) in enumerate(zip(lote, respuesta), start=1):
        ref = f"entrada {i} ({entrada['strong']})"
        if not isinstance(resp, dict):
            errores.append(f"{ref}: no es un objeto")
            continue
        for c in sorted(CLAVES_RESPUESTA - set(resp)):
            errores.append(f"{ref}: falta la clave «{c}»")
        for c in sorted(set(resp) - CLAVES_RESPUESTA):
            errores.append(f"{ref}: clave de más «{c}»")
        if resp.get("strong") != entrada["strong"]:
            errores.append(f"{ref}: strong «{resp.get('strong')}» no coincide con el lote (orden)")
        errores.extend(_errores_glosa(ref, resp.get("gloss"), resp.get("short"), entrada.get("glosario")))
    return errores


def _errores_glosa(ref, gloss, short, termino=None):
    """Errores de `gloss` y `short` (`ref` identifica la entrada en el mensaje). Si hay `termino` de
    glosario, `gloss` debe empezar por él."""
    errores = []
    if not isinstance(gloss, str) or not gloss.strip():
        errores.append(f"{ref}: «gloss» debe ser texto no vacío")
    else:
        n = len(gloss.split())
        if n > MAX_GLOSS:
            errores.append(f"{ref}: «gloss» tiene {n} palabras (máximo {MAX_GLOSS})")
        if termino and not _empieza_por(gloss, termino):
            errores.append(f"{ref}: «gloss» debe empezar por «{termino}» (glosario)")
    if not isinstance(short, str) or not short.strip():
        errores.append(f"{ref}: «short» debe ser texto no vacío")
    else:
        n = len(short.split())
        if n > MAX_SHORT:
            errores.append(f"{ref}: «short» tiene {n} palabras (máximo {MAX_SHORT})")
    return errores


def incorporar(ruta_respuesta, *, lexico=LEXICO, glosario=GLOSARIO, raiz_step=None):
    """Valida `<lote>.respuesta.json` contra `<lote>.json` y añade sus entradas a `lexico-es.json`.

    Nada se escribe si la validación falla. Un Strong ya presente se deja como está.
    Devuelve `(incorporadas, revisar, ya_estaban)`.
    """
    nombre = os.path.basename(ruta_respuesta)
    if not nombre.endswith(SUFIJO_RESPUESTA):
        raise ValueError(f"la respuesta debe llamarse «<lote>{SUFIJO_RESPUESTA}»")
    origen = nombre[: -len(SUFIJO_RESPUESTA)]
    ruta_lote = os.path.join(os.path.dirname(os.path.abspath(ruta_respuesta)), origen + ".json")
    if not os.path.exists(ruta_lote):
        raise ValueError(f"no existe el lote {ruta_lote}")
    lote = _leer_json(ruta_lote)
    if not isinstance(lote, list):
        raise ValueError(f"el lote {ruta_lote} debe ser un arreglo JSON")
    respuesta = _leer_json(ruta_respuesta)
    errores = validar_respuesta(lote, respuesta)
    if errores:
        raise ValueError("\n".join(errores))
    lex = cargar_lexico(lexico)
    glos = cargar_glosario(glosario)
    datos = {}
    nuevas = {}
    ya_estaban = 0
    for entrada, resp in zip(lote, respuesta):
        k = clave(entrada["strong"])
        if k in lex or k in nuevas:
            ya_estaban += 1
            continue
        lengua = _lengua(k)
        if lengua not in datos:
            datos[lengua] = stepbible.leer_lexico(lengua, raiz=raiz_step)
        lex_st = datos[lengua].get(k) or datos[lengua].get(base(k)) or {}
        nuevas[k] = {
            "lemma": entrada.get("lemma", ""),
            "translit": lex_st.get("translit", ""),
            "gloss": resp["gloss"].strip(),
            "short": resp["short"].strip(),
            "review": requiere_revision(k, entrada.get("gloss_en"), entrada.get("short_en"), glos),
            "fuente": f"lote {origen}",
        }
    lex.update(nuevas)
    guardar_lexico(lex, lexico)
    revisar = sum(1 for e in nuevas.values() if e["review"])
    return len(nuevas), revisar, ya_estaban


def estado(usfm, capitulo=None, *, lexico=LEXICO, raiz_fuentes=None, raiz_step=None):
    """Strong de la selección que aún no están en el léxico."""
    por_strong = seleccion_por_strong(usfm, capitulo, raiz_fuentes=raiz_fuentes, raiz_step=raiz_step)
    lex = cargar_lexico(lexico)
    return [k for k in por_strong if k not in lex]


def frecuencias_libro(usfm, capitulo=None, raiz_fuentes=None):
    """Ocurrencias de cada Strong base en el libro (o capítulo), contando todos sus tokens."""
    codigo = usfm.strip().upper()
    lengua = "H" if numero(codigo) <= ULTIMO_AT else "G"
    cuenta = Counter()
    for token in fuentes.leer_fuente(codigo, raiz=raiz_fuentes):
        if capitulo is not None and int(token["id"][3:6]) != int(capitulo):
            continue
        sb = strong_base(token["strongs"], lengua)
        if sb:
            cuenta[sb] += 1
    return cuenta


def entradas_revision(usfm, capitulo=None, *, lexico=LEXICO, glosario=GLOSARIO, raiz_fuentes=None,
                      raiz_step=None):
    """Entradas `review: true` del libro (o capítulo) con su primera aparición, por prioridad: término
    de glosario primero, luego mayor frecuencia en el libro y, a igualdad, orden del texto.
    Devuelve `[{strong, lemma, gloss, short, ref}]` (`ref` = `JAS.1.3`)."""
    por_strong = seleccion_por_strong(usfm, capitulo, raiz_fuentes=raiz_fuentes, raiz_step=raiz_step)
    lex = cargar_lexico(lexico)
    glos = cargar_glosario(glosario)
    frec = frecuencias_libro(usfm, capitulo, raiz_fuentes=raiz_fuentes)
    candidatas = []
    for orden, (k, item) in enumerate(por_strong.items()):
        entrada = lex.get(k)
        if not entrada or entrada.get("review") is not True:
            continue
        prioridad = (termino_glosario(k, glos) is None, -frec[base(k)], orden)
        candidatas.append((prioridad, {
            "strong": k, "lemma": entrada.get("lemma", ""), "gloss": entrada.get("gloss", ""),
            "short": entrada.get("short", ""), "ref": item["ref_orig"],
        }))
    candidatas.sort(key=lambda c: c[0])
    return [entrada for _, entrada in candidatas]


def lineas_revision(entradas, datos):
    """Una línea por entrada: `strong · lema · glosa · definición · ref: versículo RVR1960`, con el
    versículo recortado a LARGO_VERSICULO caracteres. `datos` es la RVR1960 de rvr1960.leer."""
    lineas = []
    for entrada in entradas:
        libro, cap, vers = entrada["ref"].split(".")
        texto = " ".join(rvr1960.texto_versiculo(datos, libro, int(cap), int(vers)).split())
        if len(texto) > LARGO_VERSICULO:
            texto = texto[: LARGO_VERSICULO - 1].rstrip() + "…"
        linea = (f"{entrada['strong']} · {entrada['lemma'] or '—'} · {entrada['gloss']} · "
                 f"{entrada['short']} · {entrada['ref']}: {texto}")
        lineas.append(" ".join(linea.split()))
    return lineas


def _escribir(ruta, texto):
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    with open(ruta, "w", encoding="utf-8") as f:
        f.write(texto)


def revision(usfm, capitulo=None, *, maximo=MAX_REVISION, lexico=LEXICO, glosario=GLOSARIO, rvr=None,
             salida=SALIDA, reportes=REPORTES, raiz_fuentes=None, raiz_step=None):
    """Escribe la lista de revisión del libro (o capítulo): `<libro>.revision.txt` con las primeras
    `maximo` entradas `review: true` y `<libro>.revision-pendiente.md` con el resto, para el usuario.
    `rvr` es la RVR1960 de rvr1960.leer (por defecto, la de la app). Devuelve `(en_lista, pendientes)`.
    """
    if not isinstance(maximo, int) or isinstance(maximo, bool) or maximo < 1:
        raise ValueError("--max debe ser un entero mayor que 0")
    prefijo = _nombre_libro(usfm, capitulo)
    datos = rvr if rvr is not None else rvr1960.leer(rvr1960.ENTRADA_POR_DEFECTO)
    entradas = entradas_revision(usfm, capitulo, lexico=lexico, glosario=glosario,
                                 raiz_fuentes=raiz_fuentes, raiz_step=raiz_step)
    lineas = lineas_revision(entradas, datos)
    en_lista, sobrantes = lineas[:maximo], lineas[maximo:]
    _escribir(os.path.join(salida, prefijo + ".revision.txt"), "".join(f"{linea}\n" for linea in en_lista))
    md = [f"# Revisión teológica pendiente · {prefijo}", ""]
    if sobrantes:
        md += [f"Entradas `review: true` que no caben en `{prefijo}.revision.txt` (tope {maximo}). "
               "Revisarlas a mano.", ""]
        md += [f"- {linea}" for linea in sobrantes]
    else:
        md.append("Sin pendientes: todas las entradas `review: true` caben en la lista.")
    _escribir(os.path.join(reportes, prefijo + ".revision-pendiente.md"), "\n".join(md) + "\n")
    return len(en_lista), len(sobrantes)


def validar_revision(respuesta, lex, glos):
    """Errores de `{strong: {gloss, short}}` frente al léxico (lista vacía si es válida). Cada Strong debe
    existir y estar pendiente (`review: true`); `gloss` y `short` siguen las reglas de `incorporar`."""
    errores = []
    for k, valor in respuesta.items():
        ref = f"entrada {k}"
        if k not in lex:
            errores.append(f"{ref}: no está en lexico-es.json")
            continue
        if lex[k].get("review") is not True:
            errores.append(f"{ref}: no está pendiente de revisión (review: false)")
        if not isinstance(valor, dict):
            errores.append(f"{ref}: no es un objeto")
            continue
        for c in sorted(CLAVES_REVISION - set(valor)):
            errores.append(f"{ref}: falta la clave «{c}»")
        for c in sorted(set(valor) - CLAVES_REVISION):
            errores.append(f"{ref}: clave de más «{c}»")
        errores.extend(_errores_glosa(ref, valor.get("gloss"), valor.get("short"), termino_glosario(k, glos)))
    return errores


def aplicar_revision(ruta_respuesta, *, lexico=LEXICO, glosario=GLOSARIO):
    """Valida `{strong: {gloss, short}}` y actualiza esas entradas: `review: false`, `revisado: "opus"`.
    Nada se escribe si la validación falla. Devuelve `(revisadas, cambiadas)`, donde `cambiadas` cuenta
    las entradas cuya glosa o definición cambió."""
    with open(ruta_respuesta, encoding="utf-8") as f:
        respuesta = json.load(f)
    if not isinstance(respuesta, dict):
        raise ValueError("la revisión debe ser un objeto cuyas claves son Strong")
    lex = cargar_lexico(lexico)
    glos = cargar_glosario(glosario)
    errores = validar_revision(respuesta, lex, glos)
    if errores:
        raise ValueError("\n".join(errores))
    cambiadas = 0
    for k, valor in respuesta.items():
        gloss, short = valor["gloss"].strip(), valor["short"].strip()
        entrada = lex[k]
        if (entrada.get("gloss"), entrada.get("short")) != (gloss, short):
            cambiadas += 1
        entrada.update({"gloss": gloss, "short": short, "review": False, "revisado": REVISADO})
    guardar_lexico(lex, lexico)
    return len(respuesta), cambiadas


def main(argv=None):
    parser = argparse.ArgumentParser(description="Léxico en español del original: lotes, validación y glosario.")
    orden = parser.add_subparsers(dest="orden", required=True)
    prep = orden.add_parser("preparar", help="crea los lotes de los Strong pendientes")
    est = orden.add_parser("estado", help="cuenta los Strong pendientes")
    for sub in (prep, est):
        sub.add_argument("--libro", required=True, help="código USFM, p. ej. JAS o RUT")
        sub.add_argument("--capitulo", type=int, help="capítulo, p. ej. 1 (obligatorio en el AT)")
    inc = orden.add_parser("incorporar", help="valida una respuesta contra su lote y la fusiona")
    inc.add_argument("respuesta", help="p. ej. estudio/herramientas/original/.cache/lotes/JAS-001.respuesta.json")
    rev = orden.add_parser("revision", help="escribe la lista de revisión teológica del libro")
    rev.add_argument("--libro", required=True, help="código USFM, p. ej. JAS o RUT")
    rev.add_argument("--capitulo", type=int, help="capítulo, p. ej. 1 (obligatorio en el AT)")
    rev.add_argument("--max", type=int, default=MAX_REVISION, help=f"líneas de la lista (por defecto {MAX_REVISION})")
    apl = orden.add_parser("aplicar-revision", help="valida las glosas revisadas y las aplica")
    apl.add_argument("respuesta", help="p. ej. estudio/herramientas/original/.cache/salida/JAS.revision.respuesta.json")
    args = parser.parse_args(argv)
    try:
        if args.orden == "preparar":
            creados, pendientes = preparar(args.libro, args.capitulo)
            for nombre, cuantos in creados:
                print(f"lote {nombre} · {cuantos} strongs")
            print(f"lotes {len(creados)} · pendientes {pendientes}")
        elif args.orden == "estado":
            print(f"pendientes {len(estado(args.libro, args.capitulo))}")
        elif args.orden == "revision":
            en_lista, pendientes = revision(args.libro, args.capitulo, maximo=args.max)
            print(f"revision · {en_lista} líneas · pendientes para el usuario {pendientes}")
        elif args.orden == "aplicar-revision":
            revisadas, cambiadas = aplicar_revision(args.respuesta)
            print(f"revisadas {revisadas} · cambiadas {cambiadas}")
        else:
            incorporadas, revisar, ya = incorporar(args.respuesta)
            print(f"incorporadas {incorporadas} · revisar {revisar} · ya estaban {ya}")
    except (ValueError, KeyError, OSError) as error:
        for linea in str(error).split("\n"):
            print(f"error: {linea}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
