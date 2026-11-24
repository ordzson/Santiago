"""Pruebas de enlace.py para el AT (WLCM ↔ TAHOT): fixture de Rut 1:1 y casos sintéticos."""
import os
import sys
import tempfile
import unittest

HO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HO)

import enlace  # noqa: E402

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures", "enlace_at")


def wlcm(palabra, texto, strong, pos="noun", segmento=1):
    """Segmento WLCM de Rut 1 (id `oBBCCCVVVWWWS`, aquí 08 001 001 WWW S)."""
    return {"id": f"o08001001{palabra:03d}{segmento}", "text": texto, "strongs": strong, "pos": pos}


def fila(n, dstrongs):
    """Fila TAHOT de Rut 1:1 con un segmento por cada Strong de `dstrongs` (`""` = sin Strong)."""
    segmentos = [{"dstrong": d, "morf": "", "hebreo": "", "translit": ""} for d in dstrongs]
    return {"ref_orig": "RUT.1.1", "ref_es": "RUT.1.1", "n": n, "segmentos": segmentos}


class TestFixtureRut11(unittest.TestCase):
    """Rut 1:1 real (fixtures/enlace_at): 32 segmentos WLCM, 18 de contenido, 19 filas TAHOT."""

    def setUp(self):
        self.enlaces, self.no = enlace.enlazar_at("RUT", 1, raiz_fuentes=RAIZ, raiz_step=RAIZ)

    def test_16_de_18_segmentos_de_contenido_se_enlazan(self):
        self.assertEqual(len(self.enlaces), 16)
        self.assertEqual(len(self.no), 2)

    def test_los_no_enlazados_son_los_sin_strong(self):
        self.assertEqual(
            {(n["id"], n["motivo"]) for n in self.no},
            {("o080010010102", "sin_strong"), ("o080010010111", "sin_strong")},
        )

    def test_datos_del_enlace(self):
        e = self.enlaces["o080010010012"]  # יְהִי, verbo H1961, palabra 1
        self.assertEqual(e["dstrong"], "H1961")
        self.assertEqual(e["ref_tahot"], "RUT.1.1#01")
        self.assertEqual(e["segmento"], 2)
        self.assertEqual(e["translit_forma"], "y.Hi")

    def test_prefijos_no_entran_en_el_total(self):
        # וַ (conjunction), בִּ (preposition), הוּא (pronoun): ni enlazados ni no enlazados.
        for prefijo in ("o080010010011", "o080010010021", "o080010010161"):
            self.assertNotIn(prefijo, self.enlaces)
            self.assertNotIn(prefijo, [n["id"] for n in self.no])

    def test_ids_son_de_rut_1_1(self):
        self.assertTrue(all(i.startswith("o080010010") for i in self.enlaces))


class TestPalabraYVecinas(unittest.TestCase):
    def test_se_enlaza_en_la_misma_palabra(self):
        s = wlcm(1, "יְהִי", "1961", "verb")
        e, no = enlace.enlazar_versiculo_at([s], [fila(1, ["H9001", "H1961"])], "RUT.1.1")
        self.assertEqual(no, [])
        self.assertEqual(e[s["id"]]["ref_tahot"], "RUT.1.1#01")
        self.assertEqual(e[s["id"]]["segmento"], 2)

    def test_se_enlaza_en_palabra_vecina(self):
        s = wlcm(2, "יְהִי", "1961", "verb")
        e, no = enlace.enlazar_versiculo_at([s], [fila(3, ["H1961"])], "RUT.1.1")
        self.assertEqual(no, [])
        self.assertEqual(e[s["id"]]["ref_tahot"], "RUT.1.1#03")

    def test_se_enlaza_a_dos_palabras_de_distancia(self):
        s = wlcm(4, "יְהִי", "1961", "verb")
        e, no = enlace.enlazar_versiculo_at([s], [fila(2, ["H1961"])], "RUT.1.1")
        self.assertEqual(no, [])
        self.assertEqual(e[s["id"]]["ref_tahot"], "RUT.1.1#02")

    def test_a_mas_de_dos_palabras_es_sin_par(self):
        s = wlcm(5, "יְהִי", "1961", "verb")
        e, no = enlace.enlazar_versiculo_at([s], [fila(2, ["H1961"])], "RUT.1.1")
        self.assertEqual(e, {})
        self.assertEqual([(n["id"], n["motivo"]) for n in no], [(s["id"], "sin_par")])

    def test_varios_en_la_misma_palabra_es_ambiguo(self):
        s = wlcm(1, "x", "1961", "verb")
        e, no = enlace.enlazar_versiculo_at([s], [fila(1, ["H1961", "H1961"])], "RUT.1.1")
        self.assertEqual(e, {})
        self.assertEqual([n["motivo"] for n in no], ["ambiguo"])

    def test_varios_en_palabras_vecinas_es_ambiguo(self):
        s = wlcm(2, "x", "1961", "verb")
        e, no = enlace.enlazar_versiculo_at([s], [fila(1, ["H1961"]), fila(3, ["H1961"])], "RUT.1.1")
        self.assertEqual(e, {})
        self.assertEqual([n["motivo"] for n in no], ["ambiguo"])

    def test_la_misma_palabra_tiene_prioridad_sobre_vecinas(self):
        s = wlcm(2, "x", "1961", "verb")
        e, no = enlace.enlazar_versiculo_at([s], [fila(2, ["H1961"]), fila(3, ["H1961"])], "RUT.1.1")
        self.assertEqual(no, [])
        self.assertEqual(e[s["id"]]["ref_tahot"], "RUT.1.1#02")


class TestMotivosYPrefijos(unittest.TestCase):
    def test_prefijos_por_pos_se_omiten(self):
        s = wlcm(1, "וַ", "2050b", "conjunction")
        e, no = enlace.enlazar_versiculo_at([s], [fila(1, ["H9001"])], "RUT.1.1")
        self.assertEqual((e, no), ({}, []))

    def test_sin_strong_no_se_enlaza(self):
        s = wlcm(1, "בֵּית", "", "noun")
        e, no = enlace.enlazar_versiculo_at([s], [fila(1, [""])], "RUT.1.1")
        self.assertEqual(e, {})
        self.assertEqual([n["motivo"] for n in no], ["sin_strong"])

    def test_strong_se_compara_por_base_sin_ceros_ni_sufijo(self):
        s = wlcm(1, "אָרֶץ", "0776", "noun")
        e, no = enlace.enlazar_versiculo_at([s], [fila(1, ["H9003", "H0776G"])], "RUT.1.1")
        self.assertEqual(no, [])
        self.assertEqual(e[s["id"]]["dstrong"], "H0776G")

    def test_puntuacion_pegada_al_strong_no_impide_enlazar(self):
        s = wlcm(8, "שְׁנֵי", "8147", "adjective")
        e, no = enlace.enlazar_versiculo_at([s], [fila(8, ["H8147\\H9014"])], "RUT.1.2")
        self.assertEqual(no, [])
        self.assertEqual(e[s["id"]]["dstrong"], "H8147")

    def test_strong_principal_quita_puntuacion(self):
        self.assertEqual(enlace._strong_principal("H8147\\H9014"), "H8147")
        self.assertEqual(enlace._strong_principal("H1035G+"), "H1035G")
        self.assertEqual(enlace._strong_principal(""), "")

    def test_es_prefijo_solo_para_h9xxx(self):
        self.assertTrue(enlace._es_prefijo("H9001"))
        self.assertFalse(enlace._es_prefijo("H90"))
        self.assertFalse(enlace._es_prefijo("H1961"))
        self.assertFalse(enlace._es_prefijo(None))


class TestErrores(unittest.TestCase):
    def test_at_rechaza_libro_del_nt(self):
        with self.assertRaises(ValueError):
            enlace.enlazar_at("JAS", 1, raiz_fuentes=RAIZ, raiz_step=RAIZ)

    def test_capitulo_sin_segmentos_es_error(self):
        with self.assertRaises(ValueError):
            enlace.enlazar_at("RUT", 2, raiz_fuentes=RAIZ, raiz_step=RAIZ)


class TestResumenYSinStrong(unittest.TestCase):
    """Los `sin_strong` quedan fuera de la base del porcentaje; se cuentan aparte."""

    def test_fixture_rut_1_resumen_sin_contar_sin_strong(self):
        enlaces, no = enlace.enlazar_at("RUT", 1, raiz_fuentes=RAIZ, raiz_step=RAIZ)
        self.assertEqual(
            enlace._resumen("RUT-1", enlaces, no),
            "RUT-1: 16 de 16 enlazados (100,0 %) · 0 no enlazados · 2 sin Strong (fuera de la base)",
        )

    def test_sin_par_entra_en_la_base_y_sin_strong_no(self):
        s1, s2, s3 = wlcm(1, "a", "1961", "verb"), wlcm(2, "b", "7", "noun"), wlcm(3, "c", "", "noun")
        filas = [fila(1, ["H1961"])]
        enlaces, no = enlace.enlazar_versiculo_at([s1, s2, s3], filas, "RUT.1.1")
        self.assertEqual(
            enlace._resumen("X", enlaces, no),
            "X: 1 de 2 enlazados (50,0 %) · 1 no enlazados · 1 sin Strong (fuera de la base)",
        )

    def test_sin_sin_strong_no_se_imprime_la_clausula(self):
        s1 = wlcm(1, "a", "1961", "verb")
        enlaces, no = enlace.enlazar_versiculo_at([s1], [fila(1, ["H1961"])], "RUT.1.1")
        self.assertEqual(enlace._resumen("X", enlaces, no), "X: 1 de 1 enlazados (100,0 %) · 0 no enlazados")

    def test_txt_conserva_los_sin_strong_con_su_motivo(self):
        s1, s2 = wlcm(1, "a", "1961", "verb"), wlcm(2, "b", "", "noun")
        enlaces, no = enlace.enlazar_versiculo_at([s1, s2], [fila(1, ["H1961"])], "RUT.1.1")
        with tempfile.TemporaryDirectory() as tmp:
            original = enlace.SALIDA
            enlace.SALIDA = tmp
            try:
                enlace._escribir("X", enlaces, no, enlace._resumen("X", enlaces, no))
                with open(os.path.join(tmp, "X.enlace.txt"), encoding="utf-8") as f:
                    lineas = f.read().splitlines()
            finally:
                enlace.SALIDA = original
        self.assertEqual(lineas[0], "X: 1 de 1 enlazados (100,0 %) · 0 no enlazados · 1 sin Strong (fuera de la base)")
        self.assertEqual(lineas[1].split("\t")[3], "sin_strong")


if __name__ == "__main__":
    unittest.main()
