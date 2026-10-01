"""Lee el texto NBLA de un capítulo tal como se copia de la web.

Formato que entiende (el mismo que se pegó para cada capítulo):
  - Los títulos de sección van solos en su línea (por ejemplo «Guerras y conflictos»).
  - Cada versículo empieza con su número, con o sin espacio: «2 Ustedes…» o «2Sus riquezas…».
  - El primer versículo puede llevar el número del capítulo («4 ¿De dónde…») o el 1.
  - Se ignoran las líneas «Santiago 4», las que mencionan la NBLA y los enlaces de notas
    al pie como [[a](https://…)].
  - Si una línea termina en dos puntos y la siguiente no empieza con número (el saludo
    de 1:1), se conserva el salto de línea dentro del versículo.
"""
import re


def leer_texto(ruta, capitulo, libro='Santiago'):
    crudo = open(ruta, encoding='utf-8').read()
    txt = re.sub(r'\[\[[A-Za-z]{1,3}\]\([^)]*\)\]', '', crudo)
    for corte in ('\nFootnotes', '\nNotas', '\nCross references', '\nReferencias'):
        if corte in txt:
            txt = txt.split(corte)[0]

    texto, titulos_en = '', []
    for linea in txt.replace('\r', '').split('\n'):
        linea = re.sub(r'\s+', ' ', linea).strip()
        if not linea or re.match(r'^%s\s+\d' % re.escape(libro), linea) or 'Nueva Biblia' in linea or 'NBLA' in linea:
            continue
        es_versiculo = re.match(r'^\d{1,2}\D', linea)
        if not es_versiculo and len(linea) < 70 and not re.search(r'[.,;:?!»”"]$', linea):
            titulos_en.append((len(texto) + (1 if texto else 0), linea))
            continue
        sep = '\n' if (texto.endswith(':') and not es_versiculo) else ' '
        texto += (sep if texto else '') + linea

    m = re.match(r'^(%d|1)(?=\D)\s*' % capitulo, texto)
    if not m:
        raise ValueError('%s: no encuentro el primer versículo al inicio del texto' % ruta)
    inicios, pos, n = [(1, 0, m.end())], m.end(), 2
    while True:
        mm = re.compile(r'(?:(?<=[\s.,;:!?»”"\)])|^)%d(?=\D)\s*' % n).search(texto, pos)
        if not mm or not re.match(r'[^\d\s]', texto[mm.end():mm.end() + 1] or '0'):
            break
        inicios.append((n, mm.start(), mm.end()))
        pos, n = mm.end(), n + 1

    versiculos = {}
    for i, (v, _, cuerpo) in enumerate(inicios):
        fin = inicios[i + 1][1] if i + 1 < len(inicios) else len(texto)
        versiculos[v] = texto[cuerpo:fin].strip()
    titulos = {}
    for desde, titulo in titulos_en:
        v = next((vv for vv, en, _ in inicios if en >= desde - 1), None)
        if v is not None:
            titulos[v] = titulo
    return versiculos, titulos
