"""Pruebas de medir.py con datos sintéticos (sin caché): unión oro ↔ borrador, regla de acierto,
tablas, cuenta de alineación y escritura del reporte (última línea `alta: n · precisión p %`)."""
import datetime
import json
import os
import sys
import tempfile
import unicodedata
import unittest

HO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HO)

import generar  # noqa: E402
import medir  # noqa: E402

AHORA = datetime.datetime(2026, 11, 24, 9, 0, 0, tzinfo=datetime.timezone.utc)


def _oro(ref, strong, word):
    return {"ref": ref, "strong": strong, "word": word}


def _nota(cap, vers, strong, word, confianza="alta", regla="igual"):
    return {"book": "santiago", "chapter": cap, "verse": vers, "word": word, "strong": strong,
            "confidence": confianza, "source": f"RV09 manual → RVR1960 ({regla})"}


class TestCoincide(unittest.TestCase):
    def test_igual_sin_distinguir_mayusculas(self):
        self.assertTrue(medir.coincide("Santiago", "santiago"))

    def test_contencion_en_cualquier_sentido(self):
        self.assertTrue(medir.coincide("anillo", "anillo de oro"))
        self.assertTrue(medir.coincide("anillo de oro", "anillo"))

    def test_signos_no_cuentan(self):
        self.assertTrue(medir.coincide("Dios,", "Dios, dioses"))

    def test_palabras_distintas_no_coinciden(self):
        self.assertFalse(medir.coincide("tienta", "tentado"))

    def test_vacio_no_coincide(self):
        self.assertFalse(medir.coincide("", "x"))
        self.assertFalse(medir.coincide("—", "x"))

    def test_acentos_nfd_y_nfc_son_iguales(self):
        self.assertTrue(medir.coincide(unicodedata.normalize("NFD", "ánimo"), "ánimo"))


class TestClaveYRegla(unittest.TestCase):
    def test_strong_base_une_con_el_canonico(self):
        self.assertEqual(medir.clave("JAS.1.13", "G3985G"), ("JAS.1.13", "G3985"))
        self.assertEqual(medir.clave("JAS.1.13", "G3985"), ("JAS.1.13", "G3985"))

    def test_regla_del_source(self):
        self.assertEqual(medir.regla_de({"source": "RV09 manual → RVR1960 (igual)"}), "igual")
        self.assertEqual(medir.regla_de({"source": "RV09 manual → RVR1960 (no_contiguo)"}), "no_contiguo")
        self.assertEqual(medir.regla_de({}), "—")


class TestEvaluar(unittest.TestCase):
    def setUp(self):
        self.oro = [
            _oro("JAS.1.8", "G182", "inconstante"),                 # correcta
            _oro("JAS.1.13", "G3985", "tentado"),                   # correcta; «tienta» sin evaluar
            _oro("JAS.2.20", "G692", None),                         # nula con nota: incorrecta
            _oro("JAS.3.1", "G1320", "maestros"),                   # sin nota
            _oro("JAS.4.7", "G1228", None),                         # nula sin nota: no cuenta
            _oro("JAS.5.1", "G3649", "aullad"),                     # nota distinta: incorrecta
        ]
        self.notas = [
            _nota(1, 8, "G182", "inconstante"),
            _nota(1, 13, "G3985G", "tienta"),
            _nota(1, 13, "G3985G", "tentado"),
            _nota(2, 20, "G692", "algo", regla="pista"),
            _nota(5, 1, "G3649", "clamad", confianza="media", regla="ambiguo"),
            _nota(2, 5, "G1586", "elegido"),                        # fuera del oro
        ]

    def test_filas_y_correctas(self):
        filas, sin_nota, sin_evaluar = medir.evaluar("JAS", self.oro, self.notas)
        self.assertEqual(len(filas), 4)
        self.assertEqual([f["correcta"] for f in filas], [True, True, False, False])

    def test_sin_nota_solo_las_de_palabra(self):
        _, sin_nota, _ = medir.evaluar("JAS", self.oro, self.notas)
        self.assertEqual([e["ref"] for e in sin_nota], ["JAS.3.1"])

    def test_nota_repetida_queda_sin_evaluar_y_se_evalua_la_que_coincide(self):
        filas, _, sin_evaluar = medir.evaluar("JAS", self.oro, self.notas)
        evaluada = next(f["nota"] for f in filas if f["oro"]["ref"] == "JAS.1.13")
        self.assertEqual(evaluada["word"], "tentado")
        self.assertEqual([n["word"] for n in sin_evaluar], ["tienta"])

    def test_sin_coincidencia_se_evalua_la_primera(self):
        oro = [_oro("JAS.1.13", "G3985", "tentado")]
        notas = [_nota(1, 13, "G3985", "tienta"), _nota(1, 13, "G3985", "prueba")]
        filas, _, sin_evaluar = medir.evaluar("JAS", oro, notas)
        self.assertFalse(filas[0]["correcta"])
        self.assertEqual(filas[0]["nota"]["word"], "tienta")
        self.assertEqual([n["word"] for n in sin_evaluar], ["prueba"])

    def test_oro_repetido_es_error(self):
        oro = [_oro("JAS.1.8", "G182", "a"), _oro("JAS.1.8", "G182", "b")]
        with self.assertRaises(ValueError):
            medir.evaluar("JAS", oro, [])


class TestTablas(unittest.TestCase):
    def test_porcentaje_con_coma(self):
        self.assertEqual(medir.porcentaje(267, 324), "82,4 %")
        self.assertEqual(medir.porcentaje(22, 22), "100,0 %")
        self.assertEqual(medir.porcentaje(0, 0), "—")

    def test_tabla_por_confianza_con_ceros(self):
        filas = [
            {"nota": _nota(1, 8, "G182", "a", confianza="alta"), "correcta": True},
            {"nota": _nota(1, 9, "G182", "b", confianza="alta"), "correcta": False},
        ]
        lineas = medir.tabla_por(filas, lambda n: n["confidence"], "confianza",
                                 generar.CONFIANZAS)
        self.assertIn("| alta | 2 | 1 | 50,0 % |", lineas)
        self.assertIn("| media | 0 | 0 | — |", lineas)

    def test_cuenta_alineacion(self):
        items = [{"id": "a"}, {"id": "b"}, {"id": "c"}]
        res = {"a": {"regla": "igual", "word": "x"}, "b": {"regla": "sin_par"},
               "c": {"regla": "pista"}}
        cuenta = medir.cuenta_alineacion(items, res)
        self.assertEqual(cuenta, {"tokens": 3, "con_destino": 2, "con_word": 1})


class TestReporte(unittest.TestCase):
    def _medir(self, tmp, oro, notas, alin):
        ruta_oro = os.path.join(tmp, "santiago.json")
        ruta_borrador = os.path.join(tmp, "griego.rvr1960.borrador.json")
        with open(ruta_oro, "w", encoding="utf-8") as f:
            json.dump(oro, f, ensure_ascii=False)
        with open(ruta_borrador, "w", encoding="utf-8") as f:
            json.dump({"notes": notas}, f, ensure_ascii=False)
        datos = {"JAS": {"nombre": "Santiago"}}
        return medir.medir("JAS", oro=ruta_oro, borrador=ruta_borrador,
                           reportes=os.path.join(tmp, "reportes"), datos=datos, alin=alin,
                           ahora=AHORA)

    def test_escribe_reporte_y_ultima_linea(self):
        oro = [_oro("JAS.1.8", "G182", "inconstante"), _oro("JAS.1.13", "G3985", "tentado"),
               _oro("JAS.2.20", "G692", None)]
        notas = [_nota(1, 8, "G182", "inconstante"), _nota(1, 13, "G3985G", "tienta"),
                 _nota(1, 13, "G3985G", "tentado"), _nota(2, 20, "G692", "algo", regla="pista")]
        alin = {"tokens": 324, "con_destino": 267, "con_word": 267}
        with tempfile.TemporaryDirectory() as tmp:
            r = self._medir(tmp, oro, notas, alin)
            with open(r["reporte"], encoding="utf-8") as f:
                contenido = f.read()
        # 1.8 correcta, 1.13 correcta (la otra nota de la clave queda sin evaluar), 2.20 nula con nota
        self.assertEqual(r["ultima"], "alta: 3 · precisión 66,7 %")
        self.assertTrue(contenido.endswith("alta: 3 · precisión 66,7 %\n"))
        self.assertIn("| alta | 3 | 2 | 66,7 % |", contenido)
        self.assertIn("Tokens seleccionados: 324 · con destino RV09: 267 (82,4 %)", contenido)
        self.assertIn("- JAS.1.13 · G3985G · tienta (alta)", contenido)
        self.assertEqual(r["no_evaluadas"], 1)

    def test_at_se_rechaza_sin_leer_datos(self):
        with self.assertRaises(ValueError):
            medir.medir("RUT")


if __name__ == "__main__":
    unittest.main()
