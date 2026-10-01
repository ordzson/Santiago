#!/usr/bin/env python3
"""Construye index.html a partir de src/, texto/ y fuentes/.

Uso:  python3 herramientas/construir.py

El resultado es un solo archivo, index.html, con todo adentro: estilos, fuentes, dibujos,
texto bíblico y el lector. No necesita internet ni librerías externas.
"""
import base64
import json
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / 'herramientas'))
from texto_nbla import leer_texto  # noqa: E402

TITULO = 'Epístola de Santiago'
CAPITULOS = [1, 2, 3, 4, 5]
# el motor va primero; el resto declara funciones y se puede leer en cualquier orden
GRABADOS = ['motor.js', 'santiago-1.js', 'santiago-2.js', 'santiago-3.js', 'santiago-4.js', 'santiago-5.js', 'inicio.js']


def leer(ruta):
    return (RAIZ / ruta).read_text(encoding='utf-8')


def fuentes_incrustadas():
    css = leer('fuentes/fuentes.css')

    def a_datos(m):
        datos = base64.b64encode((RAIZ / 'fuentes' / m.group(1)).read_bytes()).decode('ascii')
        return 'url(data:font/woff2;base64,%s)' % datos
    return re.sub(r'url\(([^)]+\.woff2)\)', a_datos, css)


def datos_capitulo(n):
    cuerpo = leer('src/datos/santiago-%d.js' % n)
    versiculos, titulos = leer_texto(RAIZ / 'texto' / ('santiago-%d.txt' % n), n)
    cuerpo = cuerpo.replace('__NBLA__', json.dumps({str(k): v for k, v in versiculos.items()}, ensure_ascii=False, indent=0))
    cuerpo = cuerpo.replace('__TITULOS__', json.dumps({str(k): v for k, v in titulos.items()}, ensure_ascii=False))
    return ('CH[%d] = (function(){\n' % n + cuerpo +
            '  return { BOOK, NBLA, HEADINGS, SECTIONS, INTRO, RECAP_TITLE, TEXT_PAGES, MEMO, introBody, recapBody };\n})();\n')


def construir():
    script = "(function(){\n'use strict';\n" + leer('src/base.js')
    script += ''.join(leer('src/grabados/' + g) for g in GRABADOS)
    script += ''.join(datos_capitulo(n) for n in CAPITULOS)
    script += leer('src/lector.js') + '})();\n'
    if '</script' in script.lower():
        raise ValueError('el código no puede contener la etiqueta </script>')

    html = ('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            '<meta name="theme-color" content="#F6F1E4">\n'
            '<title>%s</title>\n<style>\n' % TITULO +
            ':root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}\n'
            'img{max-width:100%}\n[hidden]{display:none!important}\n' +
            fuentes_incrustadas() + leer('src/estilo.css') +
            '</style>\n</head>\n<body>\n' + leer('src/pagina.html') +
            '<script>\n' + script + '</script>\n</body>\n</html>\n')
    (RAIZ / 'index.html').write_text(html, encoding='utf-8')
    return len(html)


if __name__ == '__main__':
    tam = construir()
    print('index.html listo (%d KB)' % (tam // 1024))
