"""Pruebas de enlace.py (SBLGNT ↔ TAGNT) con la fixture de Santiago 1:1 (tests/fixtures/enlace/)."""
import os
import sys
import unicodedata
import unittest

HO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HO)

import enlace  # noqa: E402

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures", "enlace")


def sbl(i, texto, strong):
    return {"id": f"n59001001{i:03d}", "text": texto, "strongs": strong}


def fila(n, forma, dstrong):
    return {"ref_es": "JAS.1.1", "n": n, "forma": forma, "translit": "", "dstrong": dstrong,
            "morf": "X", "es": ""}


class TestNormalizar(unittest.TestCase):
    def test_nfd_nfc_puntuacion_y_mayusculas(self):
        nfc = unicodedata.normalize("NFC", "Ἰησοῦ")
        nfd = unicodedata.normalize("NFD", "Ἰησοῦ")
        self.assertEqual(enlace.normalizar(nfc), enlace.normalizar(nfd))
        self.assertEqual(enlace.normalizar("χαίρειν.¶"), "χαιρειν")

    def test_sbl_por_nombre_base(self):
        self.assertTrue(enlace.tiene_sbl("NA28+SBL»1+TR"))
        self.assertTrue(enlace.tiene_sbl("NA28+SBL+TR"))
        self.assertFalse(enlace.tiene_sbl("TR+Byz"))


class TestFixtureJas11(unittest.TestCase):
    def test_los_15_tokens_se_enlazan(self):
        enlaces, no = enlace.enlazar_nt("JAS", raiz_fuentes=RAIZ, raiz_step=RAIZ)
        self.assertEqual(len(enlaces), 15)
        self.assertEqual(no, [])

    def test_datos_del_enlace(self):
        enlaces, _ = enlace.enlazar_nt("JAS", raiz_fuentes=RAIZ, raiz_step=RAIZ)
        e = enlaces["n59001001004"]
        self.assertEqual(e["dstrong"], "G2962G")
        self.assertEqual(e["morf_step"], "N-GSM-T")
        self.assertEqual(e["translit_forma"], "kuriou")
        self.assertEqual(e["es_step"], "de Señor")
        self.assertEqual(e["ref_tagnt"], "JAS.1.1#04")

    def test_nt_rechaza_libro_del_at(self):
        with self.assertRaises(ValueError):
            enlace.enlazar_nt("RUT", raiz_fuentes=RAIZ, raiz_step=RAIZ)


class TestVersiculo(unittest.TestCase):
    def test_mismo_strong_con_otra_forma_se_enlaza(self):
        e, no = enlace.enlazar_versiculo([sbl(1, "ἦτε", "G5600")], [fila(1, "ἔστε", "G5600")])
        self.assertEqual(len(e), 1)
        self.assertEqual(no, [])

    def test_misma_forma_con_otro_strong_se_enlaza(self):
        e, no = enlace.enlazar_versiculo([sbl(1, "μου", "G3450")], [fila(1, "μου,", "G3165")])
        self.assertEqual(len(e), 1)

    def test_variante_no_se_inventa(self):
        e, no = enlace.enlazar_versiculo([sbl(1, "λόγος", "G3056")], [fila(1, "ἔργον", "G2041")], "JAS.1.1")
        self.assertEqual(e, {})
        self.assertEqual([n["motivo"] for n in no], ["variante"])
        self.assertEqual(no[0]["ref"], "JAS.1.1")

    def test_palabra_sin_par(self):
        sb = [sbl(1, "καὶ", "G2532"), sbl(2, "μόνον", "G3441"), sbl(3, "θεοῦ", "G2316")]
        fl = [fila(1, "καὶ", "G2532"), fila(2, "θεοῦ", "G2316")]
        e, no = enlace.enlazar_versiculo(sb, fl)
        self.assertEqual(len(e), 2)
        self.assertEqual([(n["forma"], n["motivo"]) for n in no], [("μόνον", "sin_par")])


if __name__ == "__main__":
    unittest.main()
