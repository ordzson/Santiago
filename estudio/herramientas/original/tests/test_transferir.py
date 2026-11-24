"""Pruebas de transferir.py con versículos sintéticos (sin caché ni fixtures de archivo)."""
import os
import sys
import unittest

HO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HO)

import transferir  # noqa: E402

CONFIG = {"reglas_alta": ["igual"], "vacias_es": ["el", "la", "los", "las", "de", "y", "su"]}


def toks(texto, prefijo="59001004"):
    return [{"id": f"{prefijo}{i + 1:03d}", "text": t, "exclude": False}
            for i, t in enumerate(texto.split())]


def ids(prefijo, *numeros):
    return [f"{prefijo}{n:03d}" for n in numeros]


def correr(rv09, rvr, destinos, pistas=None, strongs=None):
    return transferir.transferir(toks(rv09), rvr, destinos, pistas, config=CONFIG,
                                 equivalencias=transferir.cargar_equivalencias(), strongs=strongs)


class TestEncontrarApp(unittest.TestCase):
    def test_sin_letra_a_ambos_lados_y_minusculas_es(self):
        self.assertEqual(transferir.encontrar_app("Fe y feliz, FE.", "fe"), [(0, 2), (12, 14)])

    def test_vacio_si_no_hay(self):
        self.assertEqual(transferir.encontrar_app("hola", "adios"), [])


class TestTransferir(unittest.TestCase):
    P = "59001004"

    def test_igual_recorta_vacias_de_los_bordes(self):
        r = correr("tenga la paciencia perfecta", "tenga la paciencia perfecta",
                   {"f1": ids(self.P, 2, 3)})
        self.assertEqual(r["f1"], {"word": "paciencia", "confidence": "alta", "regla": "igual"})

    def test_equivalencia_mas_pero(self):
        r = correr("Mas tenga paciencia", "Pero tenga paciencia", {"f1": ids(self.P, 1)})
        self.assertEqual(r["f1"], {"word": "Pero", "confidence": "media", "regla": "equivalencia"})

    def test_no_contiguo_toma_el_token_mas_largo(self):
        r = correr("amor grande y luz", "amor grande y luz", {"f1": ids(self.P, 1, 4)})
        self.assertEqual(r["f1"]["word"], "amor")
        self.assertEqual(r["f1"]["regla"], "no_contiguo")
        self.assertEqual(r["f1"]["confidence"], "revisar")

    def test_ambiguo_misma_palabra_en_otro_strong(self):
        r = correr("Dios amó Dios", "Dios amó Dios",
                   {"f1": ids(self.P, 1), "f2": ids(self.P, 3)}, strongs={"f1": "G1", "f2": "G2"})
        self.assertEqual(r["f1"]["regla"], "ambiguo")
        self.assertEqual(r["f1"]["confidence"], "revisar")

    def test_mismo_strong_no_es_ambiguo(self):
        r = correr("Dios amó Dios", "Dios amó Dios",
                   {"f1": ids(self.P, 1), "f2": ids(self.P, 3)}, strongs={"f1": "G1", "f2": "G1"})
        self.assertEqual(r["f1"]["regla"], "igual")

    def test_no_literal_si_la_app_no_encuentra_el_word(self):
        # «İ» baja a dos caracteres: el índice de la app se desplaza y la letra previa lo rechaza.
        r = correr("İ casa", "İ casa", {"f1": ids(self.P, 2)})
        self.assertEqual(r["f1"], {"regla": "no_literal"})

    def test_pista_en_reemplazo_uno_a_uno(self):
        r = correr("hizo cosas grandes", "hizo obras grandes", {"f1": ids(self.P, 2)},
                   pistas={"f1": "obra"})
        self.assertEqual(r["f1"], {"word": "obras", "confidence": "media", "regla": "pista"})

    def test_sin_par_si_no_hay_pista(self):
        r = correr("hizo cosas grandes", "hizo obras grandes", {"f1": ids(self.P, 2)})
        self.assertEqual(r["f1"], {"regla": "sin_par"})

    def test_versiculo_distinto(self):
        r = correr("uno dos tres cuatro", "alfa beta gamma delta", {"f1": ids(self.P, 1)})
        self.assertEqual(r["f1"], {"regla": "versiculo_distinto"})


class TestVersificacion(unittest.TestCase):
    def test_capitulos_con_distinto_conteo(self):
        rv09 = [{"id": "59001001001"}, {"id": "59001002001"}, {"id": "59002001001"}]
        datos = {"JAS": {"capitulos": {1: {1: "a", 2: "b"}, 2: {1: "c", 2: "d"}}}}
        self.assertEqual(transferir.comparar_versificacion("JAS", rv09=rv09, datos_rvr=datos),
                         [(2, 1, 2)])


if __name__ == "__main__":
    unittest.main()
