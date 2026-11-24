"""Pruebas de rvr1960.py con la fixture de 3 versículos (tests/fixtures/rvr1960_mini.json).

Los casos que la fixture no cubre (versículo repartido, varios números, texto vacío)
se escriben en un JSON temporal con items sintéticos.
"""
import contextlib
import io
import json
import os
import sys
import tempfile
import unittest

HO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HO)

import rvr1960  # noqa: E402

FIXTURE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures", "rvr1960_mini.json")


def _ruta_temporal(directorio, libros):
    """Escribe un JSON con la forma de la RVR1960. `libros` = [(usfm, human, items)]."""
    datos = {"books": [{"usfm": usfm, "human": human,
                        "chapters": [{"usfm": f"{usfm}.1", "items": items}]}
                       for usfm, human, items in libros]}
    ruta = os.path.join(directorio, "rvr.json")
    with open(ruta, "w", encoding="utf-8") as f:
        json.dump(datos, f)
    return ruta


def _verso(numeros, *lineas):
    return {"type": "verse", "verse_numbers": numeros, "lines": list(lineas)}


class TestLeer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.datos = rvr1960.leer(FIXTURE)

    def test_encabezado_va_a_titulos_y_no_al_texto(self):
        self.assertEqual(self.datos["JAS"]["nombre"], "Santiago")
        self.assertEqual(self.datos["JAS"]["titulos"][1], "Salutación")
        self.assertEqual(sorted(self.datos["JAS"]["capitulos"][1]), [1, 2, 3])
        self.assertNotIn("Salutación", self.datos["JAS"]["capitulos"][1][1])

    def test_texto_de_la_fixture_sin_cambios(self):
        self.assertEqual(rvr1960.texto_versiculo(self.datos, "JAS", 1, 2),
                         "Hermanos míos, tened por sumo gozo cuando os halléis en diversas pruebas,")
        self.assertEqual(rvr1960.texto_versiculo(self.datos, "jas", 1, 3),
                         "sabiendo que la prueba de vuestra fe produce paciencia.")

    def test_versiculo_inexistente_falla(self):
        with self.assertRaises(KeyError):
            rvr1960.texto_versiculo(self.datos, "JAS", 1, 99)

    def test_versiculo_repartido_se_concatena_en_orden(self):
        with tempfile.TemporaryDirectory() as tmp:
            ruta = _ruta_temporal(tmp, [("JAS", "Santiago", [
                _verso([1], "Primera  parte"),
                _verso([1], " segunda", "parte "),
                _verso([], "final"),
                _verso([2], "Otro"),
            ])])
            datos = rvr1960.leer(ruta)
        self.assertEqual(datos["JAS"]["capitulos"][1][1], "Primera parte segunda parte final")
        self.assertEqual(datos["JAS"]["capitulos"][1][2], "Otro")

    def test_varios_numeros_texto_al_primero_y_aviso(self):
        with tempfile.TemporaryDirectory() as tmp:
            ruta = _ruta_temporal(tmp, [("JAS", "Santiago", [_verso([4, 5], "texto doble")])])
            aviso = io.StringIO()
            with contextlib.redirect_stderr(aviso):
                datos = rvr1960.leer(ruta)
        self.assertEqual(datos["JAS"]["capitulos"][1], {4: "texto doble"})
        self.assertIn("[4, 5]", aviso.getvalue())

    def test_texto_sin_numero_al_inicio_falla(self):
        with tempfile.TemporaryDirectory() as tmp:
            ruta = _ruta_temporal(tmp, [("JAS", "Santiago", [_verso([], "huérfano")])])
            with self.assertRaises(ValueError):
                rvr1960.leer(ruta)


class TestExportar(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.datos = rvr1960.leer(FIXTURE)

    def test_construir_sigue_el_contrato_de_parseBible(self):
        biblia = rvr1960.construir(self.datos, ["JAS"])
        self.assertEqual(biblia["version"], "RVR1960")
        self.assertEqual(biblia["name"], "Reina-Valera 1960")
        self.assertIs(biblia["demo"], False)
        self.assertIn("1960", biblia["copyright"])
        libro = biblia["books"][0]
        self.assertEqual((libro["id"], libro["name"]), ("santiago", "Santiago"))
        capitulo = libro["chapters"][0]
        self.assertEqual(capitulo["number"], 1)
        self.assertEqual(capitulo["title"], "Salutación")
        self.assertEqual([v["number"] for v in capitulo["verses"]], [1, 2, 3])
        self.assertTrue(capitulo["verses"][0]["text"].startswith("Santiago, siervo de Dios"))
        rvr1960.validar(biblia)

    def test_libros_en_orden_canonico(self):
        with tempfile.TemporaryDirectory() as tmp:
            ruta = _ruta_temporal(tmp, [
                ("JAS", "Santiago", [_verso([1], "Uno.")]),
                ("RUT", "Rut", [_verso([1], "Dos.")]),
            ])
            datos = rvr1960.leer(ruta)
        biblia = rvr1960.construir(datos, ["JAS", "RUT"])
        self.assertEqual([libro["id"] for libro in biblia["books"]], ["rut", "santiago"])

    def test_validar_rechaza_texto_vacio(self):
        biblia = rvr1960.construir(self.datos, ["JAS"])
        biblia["books"][0]["chapters"][0]["verses"][0]["text"] = "  "
        with self.assertRaises(ValueError):
            rvr1960.validar(biblia)

    def test_cli_exportar_escribe_el_archivo(self):
        with tempfile.TemporaryDirectory() as tmp:
            salida = os.path.join(tmp, "sub", "biblia.json")
            with contextlib.redirect_stdout(io.StringIO()) as out:
                codigo = rvr1960.main(["exportar", "--libros", "JAS",
                                       "--entrada", FIXTURE, "--salida", salida])
            self.assertEqual(codigo, 0)
            self.assertIn("versículos por capítulo: 3", out.getvalue())
            with open(salida, encoding="utf-8") as f:
                biblia = json.load(f)
        self.assertEqual(biblia["books"][0]["id"], "santiago")
        self.assertEqual(len(biblia["books"][0]["chapters"][0]["verses"]), 3)

    def test_cli_libro_desconocido_sale_con_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            with contextlib.redirect_stderr(io.StringIO()):
                codigo = rvr1960.main(["exportar", "--libros", "XYZ", "--entrada", FIXTURE,
                                       "--salida", os.path.join(tmp, "b.json")])
        self.assertEqual(codigo, 1)


if __name__ == "__main__":
    unittest.main()
