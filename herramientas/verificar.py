#!/usr/bin/env python3
"""Comprueba el proyecto antes de compartirlo.

Uso:  python3 herramientas/verificar.py

Revisa, para cada capítulo:
  1. que index.html tenga exactamente el texto de texto/santiago-N.txt (si no, falta construir);
  2. que las páginas cubran todos los versículos, en orden y sin huecos;
  3. que cada nota del griego apunte a palabras que de verdad están en su versículo.
"""
import json
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / 'herramientas'))
from texto_nbla import leer_texto  # noqa: E402

NOTA = re.compile(r"N\((\d+), '((?:[^'\\]|\\.)*)'")
RANGO = re.compile(r"vv: \[(\d+), (\d+)\]")


def main():
    html_ruta = RAIZ / 'index.html'
    html = html_ruta.read_text(encoding='utf-8') if html_ruta.exists() else ''
    partes = dict(re.findall(r'CH\[(\d)\] = \(function\(\)\{(.*?)\}\)\(\);', html, re.S))
    errores, total_v, total_n = [], 0, 0
    for n in range(1, 6):
        versiculos, titulos = leer_texto(RAIZ / 'texto' / ('santiago-%d.txt' % n), n)
        datos = (RAIZ / 'src' / 'datos' / ('santiago-%d.js' % n)).read_text(encoding='utf-8')
        total_v += len(versiculos)

        parte = partes.get(str(n))
        m = parte and re.search(r'const NBLA = (\{.*?\});', parte, re.S)
        if not m:
            errores.append('cap. %d: index.html no tiene este capítulo; ejecuta construir.py' % n)
        elif json.loads(m.group(1)) != {str(k): v for k, v in versiculos.items()}:
            errores.append('cap. %d: index.html no coincide con texto/santiago-%d.txt; ejecuta construir.py' % (n, n))

        esperado = 1
        for a, b in RANGO.findall(datos):
            a, b = int(a), int(b)
            if a != esperado:
                errores.append('cap. %d: las páginas saltan del v. %d al v. %d' % (n, esperado - 1, a))
            esperado = b + 1
        if esperado - 1 != len(versiculos):
            errores.append('cap. %d: las páginas llegan al v. %d, pero el texto tiene %d' % (n, esperado - 1, len(versiculos)))

        notas = NOTA.findall(datos)
        total_n += len(notas)
        for v, palabra in notas:
            palabra = palabra.replace("\\'", "'")
            if palabra not in versiculos.get(int(v), ''):
                errores.append('cap. %d, v. %s: la nota «%s» no aparece en el versículo' % (n, v, palabra))
        print('Santiago %d: %d versículos, %d títulos de sección, %d notas' % (n, len(versiculos), len(titulos), len(notas)))

    print('Total: %d versículos y %d notas' % (total_v, total_n))
    if errores:
        print('\nRevisar:')
        for e in errores:
            print('  - ' + e)
        sys.exit(1)
    print('Todo en orden.')


if __name__ == '__main__':
    main()
