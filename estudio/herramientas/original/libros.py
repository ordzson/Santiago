"""Libros de la Biblia en orden canónico y conversiones de códigos.

Importado por los demás módulos de HO/. Solo biblioteca estándar.
Contratos: PLAN.md §Contratos (libros, Strong).
"""
import re
import unicodedata

# 66 códigos USFM en orden canónico (AT 1–39, NT 40–66).
LIBROS = [
    "GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA",
    "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO",
    "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO",
    "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL",
    "MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH",
    "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS",
    "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV",
]

_STRONG_BASE = re.compile(r"^[GH]?0*(\d+)[A-Za-z]*$")
_STRONG_CANON = re.compile(r"^([GH]?)0*(\d+)([A-Za-z]*)$")


def numero(usfm):
    """Número canónico 1–66 de un código USFM (`JAS` → 59, `RUT` → 8)."""
    codigo = usfm.strip().upper()
    try:
        return LIBROS.index(codigo) + 1
    except ValueError:
        raise ValueError(f"código USFM desconocido: {usfm!r}") from None


def step(usfm):
    """Abreviatura de STEPBible: primer carácter alfabético en mayúscula, resto en minúscula.

    `JAS` → `Jas`, `1SA` → `1Sa`, `SNG` → `Sng`.
    """
    codigo = usfm.strip().upper()
    numero(codigo)
    i = next(i for i, c in enumerate(codigo) if c.isalpha())
    return codigo[:i] + codigo[i] + codigo[i + 1:].lower()


def id_app(nombre):
    """Slug del nombre español de la RVR1960: sin diacríticos, minúsculas, espacios → `-`.

    `Santiago` → `santiago`, `1 Corintios` → `1-corintios`.
    """
    descompuesto = unicodedata.normalize("NFD", nombre)
    sin_diacriticos = "".join(c for c in descompuesto if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", "-", sin_diacriticos.strip().lower())


def _primer_valor(s):
    """Primer Strong de un campo: `5921|3963a` → `5921`. None si está vacío."""
    if not s:
        return None
    valor = s.split("|")[0].strip()
    return valor or None


def strong_base(s, lengua):
    """Strong sin ceros ni sufijo, con su letra de lengua.

    `G0976` → `G976`, `G2385I` → `G2385`, WLCM `0871a` con «H» → `H871`.
    `lengua` es «G» (griego) o «H» (hebreo). Devuelve None si no hay valor.
    """
    if lengua not in ("G", "H"):
        raise ValueError(f"lengua de Strong desconocida: {lengua!r}")
    valor = _primer_valor(s)
    if valor is None:
        return None
    m = _STRONG_BASE.match(valor)
    if not m:
        return None
    return f"{lengua}{int(m.group(1))}"


def strong_canon(s, lengua=None):
    """Strong sin ceros pero con su sufijo: `G2385I` → `G2385I`, `G0976` → `G976`.

    Si el valor no trae letra y se pasa `lengua`, la añade (`0871a`, «H» → `H871a`).
    Devuelve None si no hay valor.
    """
    valor = _primer_valor(s)
    if valor is None:
        return None
    m = _STRONG_CANON.match(valor)
    if not m:
        return None
    letra = m.group(1) or (lengua or "")
    return f"{letra}{int(m.group(2))}{m.group(3)}"
