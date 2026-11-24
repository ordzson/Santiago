"""Pruebas de stepbible.py con fixtures recortadas de STEPBible (tests/fixtures/STEPBible/).

Las filas y las entradas del léxico son líneas reales copiadas de la caché con `sed -n`/`grep`.
Los conteos esperados salen de esos recortes.
"""
import os
import sys
import unicodedata
import unittest

HO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HO)

import stepbible  # noqa: E402

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures")


def nfc(texto):
    """Compara griego en NFC: el lector conserva los bytes de la fuente tal cual."""
    return unicodedata.normalize("NFC", texto)


class TestTagnt(unittest.TestCase):
    def test_solo_filas_del_libro(self):
        filas = stepbible.leer_tagnt("JAS", raiz=RAIZ)
        self.assertEqual([f["n"] for f in filas], [1, 2, 3, 4])
        self.assertTrue(all(f["ref_es"].startswith("JAS.1.1") for f in filas))

    def test_kyriou_dstrong_morf_lema_y_espanol(self):
        fila = stepbible.leer_tagnt("JAS", raiz=RAIZ)[3]
        self.assertEqual(fila["ref_es"], "JAS.1.1")
        self.assertEqual(fila["ref_orig"], "JAS.1.1")
        self.assertEqual(nfc(fila["forma"]), "κυρίου")
        self.assertEqual(fila["translit"], "kuriou")
        self.assertEqual(fila["dstrong"], "G2962G")
        self.assertEqual(fila["morf"], "N-GSM-T")
        self.assertEqual(nfc(fila["lema"]), "κύριος")
        self.assertEqual(fila["glosa"], "lord")
        self.assertEqual(fila["es"], "de Señor")
        self.assertIn("SBL", fila["ediciones"].split("+"))

    def test_libro_sin_archivo_en_la_cache(self):
        with self.assertRaises(FileNotFoundError):
            stepbible.leer_tagnt("MAT", raiz=RAIZ)

    def test_resumen_nt(self):
        self.assertEqual(stepbible.resumen("JAS", raiz=RAIZ), "tagnt 4 · SBL 4")


class TestTahot(unittest.TestCase):
    def test_rut_segmentos_y_raiz(self):
        filas = stepbible.leer_tahot("RUT", raiz=RAIZ)
        self.assertEqual([f["n"] for f in filas], [1, 2])
        fila = filas[1]  # Rut.1.1#02: H9003 (prefijo «in») + {H3117G} (raíz «día»)
        self.assertEqual(len(fila["segmentos"]), 2)
        self.assertEqual(fila["segmentos"][0]["dstrong"], "H9003")
        self.assertEqual(fila["segmentos"][0]["morf"], "HR")
        self.assertEqual(fila["segmentos"][1]["dstrong"], "H3117G")
        self.assertEqual(fila["segmentos"][1]["morf"], "Ncmpc")
        self.assertEqual(fila["dstrong"], "H3117G")
        self.assertEqual(fila["morf"], "Ncmpc")
        self.assertEqual(fila["translit"], "bi.Mei")
        self.assertNotIn("/", fila["forma"])
        self.assertEqual(fila["glosa"], "in [the] days of")

    def test_raiz_entre_llaves_en_palabra_de_un_segmento(self):
        # Psa.3.1(3.2)#01: referencia hebrea entre paréntesis; {H3068G} sin separador.
        filas = stepbible.leer_tahot("PSA", raiz=RAIZ)
        self.assertEqual(len(filas), 1)
        fila = filas[0]
        self.assertEqual(fila["ref_es"], "PSA.3.1")
        self.assertEqual(fila["ref_orig"], "PSA.3.2")
        self.assertEqual(len(fila["segmentos"]), 1)
        self.assertEqual(fila["dstrong"], "H3068G")

    def test_resumen_at(self):
        self.assertEqual(stepbible.resumen("RUT", raiz=RAIZ), "tahot 2 · segmentos 4")


class TestLexico(unittest.TestCase):
    def test_clave_es_dstrong_canonico(self):
        lexico = stepbible.leer_lexico("G", raiz=RAIZ)
        self.assertEqual(lexico["G2316"]["translit"], "theos")
        self.assertEqual(nfc(lexico["G2316"]["lema"]), "θεός")
        self.assertEqual(lexico["G2316"]["gloss_en"], "God")
        # TBESG trae G2385G/H/I/J con el mismo eStrong: la clave es el dStrong.
        self.assertIn("G2385I", lexico)
        self.assertNotIn("G2385", lexico)

    def test_short_en_sin_etiquetas_y_maximo_200(self):
        corto = stepbible.leer_lexico("G", raiz=RAIZ)["G2316"]["short_en"]
        self.assertTrue(corto)
        self.assertLessEqual(len(corto), 200)
        self.assertNotIn("<", corto)
        self.assertNotIn(">", corto)

    def test_hebreo(self):
        lexico = stepbible.leer_lexico("H", raiz=RAIZ)
        self.assertEqual(lexico["H1961"]["translit"], "ha.yah")
        self.assertEqual(lexico["H1961"]["gloss_en"], "to be")
        self.assertLessEqual(len(lexico["H1961"]["short_en"]), 200)

    def test_lengua_desconocida(self):
        with self.assertRaises(ValueError):
            stepbible.leer_lexico("X", raiz=RAIZ)


if __name__ == "__main__":
    unittest.main()
