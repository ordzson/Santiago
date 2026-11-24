#!/usr/bin/env python3
"""Ejecuta las pruebas unitarias del pipeline del original (tests/test_*.py).

Uso: python3 -I estudio/herramientas/original/pruebas.py
Sale 1 si alguna prueba falla; 0 si pasan o si aún no hay pruebas.
Solo biblioteca estándar.
"""
import glob
import os
import sys
import unittest

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)


def main():
    tests = os.path.join(BASE, "tests")
    if not glob.glob(os.path.join(tests, "test_*.py")):
        print("pipeline: sin pruebas todavía (no hay tests/test_*.py)")
        return 0
    # Con tests/__init__.py los módulos se importan como tests.test_x desde BASE.
    # Sin él, discover exige que el directorio de inicio sea el de nivel superior.
    top = BASE if os.path.isfile(os.path.join(tests, "__init__.py")) else tests
    suite = unittest.TestLoader().discover(start_dir=tests, pattern="test_*.py", top_level_dir=top)
    resultado = unittest.TextTestRunner(verbosity=1).run(suite)
    return 0 if resultado.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(main())
