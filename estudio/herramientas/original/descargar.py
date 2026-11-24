#!/usr/bin/env python3
"""Descarga a la caché las fuentes del original listadas en fuentes.json.

Uso: python3 -I estudio/herramientas/original/descargar.py
- Destino: HO/.cache/fuentes/<repo>/<ruta>. Si ya existe, imprime «ya está» y no la baja.
- Escribe HO/.cache/fuentes/manifiesto.json (tamaño y sha256 de cada archivo presente).
- Sale 1 si alguna descarga falla; las demás se procesan igual.
Solo biblioteca estándar.
"""
import hashlib
import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

FUENTES_JSON = os.path.join(BASE, "fuentes.json")
CACHE = os.path.join(BASE, ".cache", "fuentes")
RAIZ_RAW = "https://raw.githubusercontent.com"
USER_AGENT = "verbo-herramientas/0.1"
TIMEOUT = 120
CLAVES = {"repo", "rama", "ruta"}


def cargar_fuentes(ruta=FUENTES_JSON):
    with open(ruta, encoding="utf-8") as f:
        fuentes = json.load(f)
    for fuente in fuentes:
        if set(fuente) != CLAVES:
            raise ValueError(f"entrada mal formada en fuentes.json: {fuente}")
    return fuentes


def url_de(repo, rama, ruta):
    return f"{RAIZ_RAW}/{repo}/{rama}/{urllib.parse.quote(ruta)}"


def destino_de(repo, ruta, raiz=CACHE):
    return os.path.join(raiz, *repo.split("/"), *ruta.split("/"))


def descargar_a(url, destino):
    """Baja url a destino (escribe .parcial y renombra al final). Devuelve los bytes."""
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    parcial = destino + ".parcial"
    peticion = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(peticion, timeout=TIMEOUT) as resp:
            esperados = resp.headers.get("Content-Length")
            total = 0
            with open(parcial, "wb") as salida:
                for bloque in iter(lambda: resp.read(1 << 16), b""):
                    salida.write(bloque)
                    total += len(bloque)
        if esperados is not None and int(esperados) != total:
            raise OSError(f"tamaño incompleto: {total} de {esperados} bytes")
        os.replace(parcial, destino)
        return total
    except BaseException:
        if os.path.exists(parcial):
            os.remove(parcial)
        raise


def sha256_de(ruta):
    h = hashlib.sha256()
    with open(ruta, "rb") as f:
        for bloque in iter(lambda: f.read(1 << 20), b""):
            h.update(bloque)
    return h.hexdigest()


def procesar(fuentes, raiz=CACHE, bajar=descargar_a):
    """Devuelve [(estado, fuente, detalle)] con estado «ya está», «bajado» o «error»."""
    resultados = []
    for fuente in fuentes:
        destino = destino_de(fuente["repo"], fuente["ruta"], raiz)
        if os.path.isfile(destino):
            resultados.append(("ya está", fuente, ""))
            continue
        url = url_de(fuente["repo"], fuente["rama"], fuente["ruta"])
        try:
            bajar(url, destino)
            resultados.append(("bajado", fuente, ""))
        except Exception as exc:  # una fuente fallida no detiene a las demás
            resultados.append(("error", fuente, f"{type(exc).__name__}: {exc}"))
    return resultados


def escribir_manifiesto(fuentes, raiz=CACHE):
    archivos = []
    for fuente in fuentes:
        destino = destino_de(fuente["repo"], fuente["ruta"], raiz)
        if not os.path.isfile(destino):
            continue
        archivos.append({
            "repo": fuente["repo"],
            "rama": fuente["rama"],
            "ruta": fuente["ruta"],
            "local": os.path.relpath(destino, raiz).replace(os.sep, "/"),
            "bytes": os.path.getsize(destino),
            "sha256": sha256_de(destino),
        })
    datos = {"generado": datetime.now(timezone.utc).isoformat(timespec="seconds"), "archivos": archivos}
    os.makedirs(raiz, exist_ok=True)
    with open(os.path.join(raiz, "manifiesto.json"), "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, indent=2)
        f.write("\n")
    return archivos


def main():
    fuentes = cargar_fuentes()
    resultados = procesar(fuentes)
    for estado, fuente, detalle in resultados:
        ruta = f"{fuente['repo']}/{fuente['ruta']}"
        if estado == "error":
            print(f"error  {ruta}: {detalle}")
        else:
            print(f"{estado}  {ruta}")
    archivos = escribir_manifiesto(fuentes)
    errores = [r for r in resultados if r[0] == "error"]
    print(f"manifiesto: {len(archivos)} archivos · errores: {len(errores)}")
    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main())
