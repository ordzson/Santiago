#!/usr/bin/env python3
"""Lector de la RVR1960 (bible-data-es-spa, vid 149) y exportación a la Biblia de la app.

Uso:
  python3 -I estudio/herramientas/original/rvr1960.py exportar --libros JAS,RUT \
      [--entrada estudio/public/data/RVR1960_vid_149.json] \
      [--salida estudio/herramientas/original/.cache/salida/rvr1960.biblia.json]

Lee `books[i].chapters[j].items` (el `html` no se parsea). Del texto solo cuenta
`type == "verse"`; los encabezados van a `titulos`. El texto exportado es el mismo que
muestra la app, así que `validar-app.ts` comprueba las notas contra este archivo.
Nunca se abre el JSON de entrada para mostrarlo: el trabajo lo hace el código.
Solo biblioteca estándar.
"""
import argparse
import json
import os
import re
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

from libros import id_app, numero  # noqa: E402

ENTRADA_POR_DEFECTO = os.path.normpath(
    os.path.join(BASE, "..", "..", "public", "data", "RVR1960_vid_149.json"))
SALIDA_POR_DEFECTO = os.path.join(BASE, ".cache", "salida", "rvr1960.biblia.json")
VERSION = "RVR1960"
NOMBRE = "Reina-Valera 1960"
COPYRIGHT = ("Reina-Valera 1960 © Sociedades Bíblicas en América Latina, 1960. "
             "Renovado © Sociedades Bíblicas Unidas, 1988.")

_ESPACIOS = re.compile(r"\s+")


def _unir(*partes):
    """Partes unidas con un espacio, espacios colapsados y `strip()`."""
    return _ESPACIOS.sub(" ", " ".join(p for p in partes if p)).strip()


def _capitulo(usfm_capitulo, codigo):
    """`JAS.1` → 1. Debe pertenecer al libro `codigo`."""
    libro, _, numero_txt = usfm_capitulo.partition(".")
    if libro.strip().upper() != codigo or not numero_txt.isdigit():
        raise ValueError(f"capítulo inesperado {usfm_capitulo!r} dentro de {codigo}")
    return int(numero_txt)


def leer(ruta):
    """Lee el JSON de la RVR1960 y devuelve solo lo que usa la app.

    {usfm: {"nombre": str, "capitulos": {cap: {vers: texto}}, "titulos": {cap: str}}}
    `titulos` solo trae el primer encabezado no vacío de cada capítulo.
    Un item de versículo sin número continúa el versículo anterior; si un versículo
    trae varios números, el texto va al primero y se avisa por stderr.
    """
    with open(ruta, encoding="utf-8") as f:
        raw = json.load(f)
    datos = {}
    for libro in raw["books"]:
        codigo = libro["usfm"].strip().upper()
        capitulos, titulos = {}, {}
        for cap in libro["chapters"]:
            num = _capitulo(cap["usfm"], codigo)
            versos, ultimo = {}, None
            for item in cap["items"]:
                tipo = item.get("type", "")
                if tipo != "verse":
                    if tipo.startswith("heading") and num not in titulos:
                        titulo = _unir(*item.get("lines", []))
                        if titulo:
                            titulos[num] = titulo
                    continue
                texto = _unir(*item.get("lines", []))
                numeros = item.get("verse_numbers") or []
                if not numeros:
                    if ultimo is None:
                        raise ValueError(f"{codigo}.{num}: texto de versículo sin número al inicio del capítulo")
                    versos[ultimo] = _unir(versos[ultimo], texto)
                    continue
                if len(numeros) > 1:
                    print(f"aviso: {codigo}.{num} trae los versículos {numeros}; "
                          f"el texto va solo a {numeros[0]}", file=sys.stderr)
                ultimo = numeros[0]
                versos[ultimo] = _unir(versos.get(ultimo, ""), texto)
            capitulos[num] = versos
        datos[codigo] = {"nombre": libro["human"], "capitulos": capitulos, "titulos": titulos}
    return datos


def texto_versiculo(datos, usfm, cap, vers):
    """Texto RVR1960 de `usfm cap:vers` (cap y vers enteros). KeyError si no existe."""
    codigo = usfm.strip().upper()
    try:
        return datos[codigo]["capitulos"][cap][vers]
    except KeyError:
        raise KeyError(f"la RVR1960 no tiene {codigo} {cap}:{vers}") from None


def construir(datos, codigos):
    """Biblia en el contrato de `parseBible` (estudio/src/app/content.ts), libros en orden canónico."""
    libros_app = []
    for codigo in sorted(codigos, key=numero):
        libro = datos[codigo]
        capitulos = []
        for num in sorted(libro["capitulos"]):
            cap = {"number": num}
            if libro["titulos"].get(num):
                cap["title"] = libro["titulos"][num]
            cap["verses"] = [{"number": v, "text": t}
                             for v, t in sorted(libro["capitulos"][num].items())]
            capitulos.append(cap)
        libros_app.append({"id": id_app(libro["nombre"]), "name": libro["nombre"], "chapters": capitulos})
    return {"version": VERSION, "name": NOMBRE, "demo": False, "copyright": COPYRIGHT,
            "books": libros_app}


def _positivo(n):
    return isinstance(n, int) and not isinstance(n, bool) and n > 0


def validar(biblia):
    """Mismas reglas que `parseBible`: ids únicos, números positivos y crecientes, texto no vacío."""
    if not biblia.get("books"):
        raise ValueError("la biblia no tiene libros")
    ids = set()
    for libro in biblia["books"]:
        if libro["id"] in ids:
            raise ValueError(f"id de libro repetido: {libro['id']}")
        ids.add(libro["id"])
        previo = 0
        for cap in libro["chapters"]:
            if not _positivo(cap["number"]) or cap["number"] <= previo or not cap["verses"]:
                raise ValueError(f"{libro['name']}: capítulos mal numerados o sin versículos")
            previo = cap["number"]
            previo_v = 0
            for v in cap["verses"]:
                if not _positivo(v["number"]) or v["number"] <= previo_v or not v["text"].strip():
                    raise ValueError(f"{libro['name']} {previo}:{v['number']}: versículo mal numerado o sin texto")
                previo_v = v["number"]


def _exportar(args):
    codigos = []
    for bruto in args.libros.split(","):
        codigo = bruto.strip().upper()
        if codigo and codigo not in codigos:
            numero(codigo)  # ValueError si el código no existe
            codigos.append(codigo)
    if not codigos:
        raise ValueError("--libros está vacío")
    datos = leer(args.entrada)
    faltan = [c for c in codigos if c not in datos]
    if faltan:
        raise ValueError(f"no están en la RVR1960 de entrada: {', '.join(faltan)}")
    biblia = construir(datos, codigos)
    validar(biblia)
    os.makedirs(os.path.dirname(os.path.abspath(args.salida)), exist_ok=True)
    with open(args.salida, "w", encoding="utf-8") as f:
        json.dump(biblia, f, ensure_ascii=False, indent=2)
        f.write("\n")
    for libro in biblia["books"]:
        conteos = ", ".join(str(len(c["verses"])) for c in libro["chapters"])
        print(f"{libro['name']} · versículos por capítulo: {conteos}")
    print(f"exportado: {args.salida}")
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(description="Lector de la RVR1960 y exportación a la app.")
    orden = parser.add_subparsers(dest="orden", required=True)
    ex = orden.add_parser("exportar", help="escribe la Biblia de la app para los libros indicados")
    ex.add_argument("--libros", required=True, help="códigos USFM separados por comas, p. ej. JAS,RUT")
    ex.add_argument("--entrada", default=ENTRADA_POR_DEFECTO, help="JSON de la RVR1960 (vid 149)")
    ex.add_argument("--salida", default=SALIDA_POR_DEFECTO, help="biblia.json de salida")
    args = parser.parse_args(argv)
    try:
        return _exportar(args)
    except (ValueError, KeyError, OSError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
