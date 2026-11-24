"""Pruebas de libros.py y fuentes.py con fixtures recortadas de las fuentes reales.

Los fixtures (tests/fixtures/) reproducen la estructura de HO/.cache/fuentes/ y se leen
con `raiz=`. Los conteos esperados salen de los propios recortes.
"""
import os
import sys
import unittest
from collections import Counter

HO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HO)

import fuentes  # noqa: E402
import libros  # noqa: E402

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures")


class TestLibros(unittest.TestCase):
    def test_sesenta_y_seis_libros_en_orden(self):
        self.assertEqual(len(libros.LIBROS), 66)
        self.assertEqual(libros.LIBROS[0], "GEN")
        self.assertEqual(libros.LIBROS[-1], "REV")

    def test_numero_canonico(self):
        self.assertEqual(libros.numero("JAS"), 59)
        self.assertEqual(libros.numero("RUT"), 8)
        self.assertEqual(libros.numero("GEN"), 1)
        self.assertEqual(libros.numero("REV"), 66)

    def test_numero_desconocido(self):
        with self.assertRaises(ValueError):
            libros.numero("XXX")

    def test_step(self):
        self.assertEqual(libros.step("JAS"), "Jas")
        self.assertEqual(libros.step("1SA"), "1Sa")
        self.assertEqual(libros.step("SNG"), "Sng")

    def test_id_app(self):
        self.assertEqual(libros.id_app("Santiago"), "santiago")
        self.assertEqual(libros.id_app("1 Corintios"), "1-corintios")
        self.assertEqual(libros.id_app("Génesis"), "genesis")

    def test_strong_base(self):
        self.assertEqual(libros.strong_base("0871a", "H"), "H871")
        self.assertEqual(libros.strong_base("G0976", "G"), "G976")
        self.assertEqual(libros.strong_base("G2385I", "G"), "G2385")
        self.assertEqual(libros.strong_base("5921|3963a", "H"), "H5921")
        self.assertIsNone(libros.strong_base("", "G"))
        with self.assertRaises(ValueError):
            libros.strong_base("G1", "X")

    def test_strong_canon(self):
        self.assertEqual(libros.strong_canon("G2385I"), "G2385I")
        self.assertEqual(libros.strong_canon("G0976"), "G976")
        self.assertEqual(libros.strong_canon("0871a", "H"), "H871a")
        self.assertIsNone(libros.strong_canon(""))


class TestFuentes(unittest.TestCase):
    def test_leer_fuente_jas_filtra_por_prefijo(self):
        filas = fuentes.leer_fuente("JAS", raiz=RAIZ)
        self.assertEqual(len(filas), 12)
        self.assertTrue(all(f["id"].startswith("n59") for f in filas))
        self.assertEqual(filas[0]["strongs"], "G2385")
        self.assertIn("morph", filas[0])

    def test_leer_fuente_rut_usa_wlcm(self):
        filas = fuentes.leer_fuente("RUT", raiz=RAIZ)
        self.assertEqual(len(filas), 9)
        self.assertTrue(all(f["id"].startswith("o08") for f in filas))
        self.assertIn("strongs", filas[0])

    def test_leer_rv09_jas_exclude_booleano(self):
        filas = fuentes.leer_rv09("JAS", raiz=RAIZ)
        self.assertEqual(len(filas), 10)
        self.assertEqual(filas[0]["text"], "JACOBO")
        self.assertIs(filas[0]["exclude"], False)
        self.assertIs(filas[1]["exclude"], True)
        self.assertEqual(sum(f["exclude"] for f in filas), 2)

    def test_leer_rv09_rut(self):
        filas = fuentes.leer_rv09("RUT", raiz=RAIZ)
        self.assertEqual(len(filas), 10)
        self.assertTrue(all(f["id"].startswith("08") for f in filas))
        self.assertEqual(sum(f["exclude"] for f in filas), 1)

    def test_leer_alineacion_jas_solo_destinos_del_libro(self):
        pares = fuentes.leer_alineacion("JAS", raiz=RAIZ)
        self.assertEqual(len(pares), 5)
        for _, destinos in pares:
            self.assertTrue(all(d.startswith("59") for d in destinos))
        self.assertEqual(pares[0], (["n59001001001"], ["59001001001"]))
        self.assertIn((["n59002011005"], ["59002011008", "59002011007"]), pares)

    def test_leer_alineacion_rut_excluye_otros_libros(self):
        pares = fuentes.leer_alineacion("RUT", raiz=RAIZ)
        self.assertEqual(len(pares), 3)
        for fuente_ids, destinos in pares:
            self.assertTrue(all(f.startswith("o08") for f in fuente_ids))
            self.assertTrue(all(d.startswith("08") for d in destinos))

    def test_frecuencias_nt(self):
        cuenta = fuentes.frecuencias("NT", raiz=RAIZ)
        self.assertIsInstance(cuenta, Counter)
        self.assertEqual(cuenta["G3588"], 2)
        self.assertEqual(sum(cuenta.values()), 14)

    def test_frecuencias_at_toma_primer_valor_multiple(self):
        cuenta = fuentes.frecuencias("AT", raiz=RAIZ)
        self.assertEqual(cuenta["H5921"], 1)
        self.assertEqual(sum(cuenta.values()), 13)

    def test_frecuencias_testamento_desconocido(self):
        with self.assertRaises(ValueError):
            fuentes.frecuencias("XX", raiz=RAIZ)


if __name__ == "__main__":
    unittest.main()
