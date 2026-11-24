"""Pruebas de descargar.py. Sin red: la descarga se simula o se parchea urlopen."""
import hashlib
import json
import os
import tempfile
import unittest
from unittest import mock

import descargar

CONTENIDO = b"contenido de prueba"
FUENTES_PRUEBA = [
    {"repo": "Clear-Bible/Alignments", "rama": "main", "ruta": "data/sources/WLCM.tsv"},
    {"repo": "STEPBible/STEPBible-Data", "rama": "master", "ruta": "Lexicons/TBESG - x.txt"},
]


class UrlTest(unittest.TestCase):
    def test_codifica_espacios_y_mas(self):
        url = descargar.url_de(
            "STEPBible/STEPBible-Data", "master",
            "Translators Amalgamated OT+NT/TAGNT Mat-Jhn - Translators Amalgamated Greek NT - STEPBible.org CC-BY.txt")
        self.assertEqual(
            url,
            "https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/"
            "Translators%20Amalgamated%20OT%2BNT/TAGNT%20Mat-Jhn%20-%20Translators%20Amalgamated%20Greek%20NT"
            "%20-%20STEPBible.org%20CC-BY.txt")

    def test_ruta_simple_queda_igual(self):
        self.assertEqual(
            descargar.url_de("Clear-Bible/Alignments", "main", "data/sources/WLCM.tsv"),
            "https://raw.githubusercontent.com/Clear-Bible/Alignments/main/data/sources/WLCM.tsv")

    def test_user_agent_generico(self):
        self.assertEqual(descargar.USER_AGENT, "verbo-herramientas/0.1")


class FuentesTest(unittest.TestCase):
    def test_fuentes_json_lista_19_sin_ttesv(self):
        fuentes = descargar.cargar_fuentes()
        self.assertEqual(len(fuentes), 19)
        rutas = [f["ruta"] for f in fuentes]
        self.assertEqual(len(set(rutas)), 19)
        self.assertFalse(any("TTESV" in r for r in rutas))
        self.assertTrue(all(set(f) == {"repo", "rama", "ruta"} for f in fuentes))


class DescargaTest(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.raiz = self._tmp.name
        self.bajadas = []

    def tearDown(self):
        self._tmp.cleanup()

    def bajar_falso(self, url, destino):
        self.bajadas.append(url)
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        with open(destino, "wb") as f:
            f.write(CONTENIDO)

    def test_destino_refleja_repo_y_ruta(self):
        destino = descargar.destino_de("Clear-Bible/Alignments", "data/sources/WLCM.tsv", self.raiz)
        self.assertEqual(destino, os.path.join(self.raiz, "Clear-Bible", "Alignments", "data", "sources", "WLCM.tsv"))

    def test_baja_lo_que_falta_y_luego_ya_esta(self):
        r1 = descargar.procesar(FUENTES_PRUEBA, self.raiz, self.bajar_falso)
        self.assertEqual([e for e, _, _ in r1], ["bajado", "bajado"])
        r2 = descargar.procesar(FUENTES_PRUEBA, self.raiz, self.bajar_falso)
        self.assertEqual([e for e, _, _ in r2], ["ya está", "ya está"])
        self.assertEqual(len(self.bajadas), 2)

    def test_error_en_una_fuente_no_detiene_las_demas(self):
        def bajar(url, destino):
            if "WLCM" in url:
                raise OSError("corte de red")
            self.bajar_falso(url, destino)

        resultados = descargar.procesar(FUENTES_PRUEBA, self.raiz, bajar)
        self.assertEqual([e for e, _, _ in resultados], ["error", "bajado"])
        self.assertIn("corte de red", resultados[0][2])

    def test_descarga_fallida_no_deja_parcial_ni_destino(self):
        destino = descargar.destino_de("Clear-Bible/Alignments", "data/sources/WLCM.tsv", self.raiz)
        with mock.patch("urllib.request.urlopen", side_effect=OSError("sin red")):
            with self.assertRaises(OSError):
                descargar.descargar_a("https://example.invalid/x", destino)
        self.assertFalse(os.path.exists(destino))
        self.assertFalse(os.path.exists(destino + ".parcial"))

    def test_manifiesto_tiene_tamano_y_sha256(self):
        descargar.procesar(FUENTES_PRUEBA, self.raiz, self.bajar_falso)
        archivos = descargar.escribir_manifiesto(FUENTES_PRUEBA, self.raiz)
        self.assertEqual(len(archivos), 2)
        self.assertEqual(archivos[0]["bytes"], len(CONTENIDO))
        self.assertEqual(archivos[0]["sha256"], hashlib.sha256(CONTENIDO).hexdigest())
        self.assertEqual(archivos[0]["local"], "Clear-Bible/Alignments/data/sources/WLCM.tsv")
        with open(os.path.join(self.raiz, "manifiesto.json"), encoding="utf-8") as f:
            self.assertEqual(len(json.load(f)["archivos"]), 2)

    def test_manifiesto_omite_los_que_faltan(self):
        descargar.procesar(FUENTES_PRUEBA[:1], self.raiz, self.bajar_falso)
        archivos = descargar.escribir_manifiesto(FUENTES_PRUEBA, self.raiz)
        self.assertEqual(len(archivos), 1)


if __name__ == "__main__":
    unittest.main()
