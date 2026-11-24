"""Pruebas de generar.py con datos sintéticos (sin caché): notas, lema vacío, duplicados, reemplazo
por libro o capítulo en el borrador, tabla del reporte y validaciones previas a leer las fuentes."""
import contextlib
import datetime
import io
import json
import os
import sys
import tempfile
import unittest

HO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HO)

import generar  # noqa: E402

AHORA = datetime.datetime(2026, 11, 24, 9, 0, 0, tzinfo=datetime.timezone.utc)
LEX = {
    "G2316": {"lemma": "θεός", "translit": "theos", "gloss": "Dios", "short": "", "review": False},
    "G5479": {"lemma": "χαρά", "translit": "chara", "gloss": "gozo", "short": "", "review": False},
    "H430J": {"lemma": "", "translit": "", "gloss": "Dios, dioses", "short": "", "review": True},
}
DATOS = {"JAS": {"nombre": "Santiago", "titulos": {}, "capitulos": {
    1: {1: "Santiago, siervo de Dios y del Señor.", 2: "Tened por sumo gozo, hermanos míos."},
    2: {1: "Hermanos míos, no tengáis fe con acepción de personas."}}}}


def item(id_, ref, forma, strong, lemma="", morph="N-NSM"):
    return {"id": id_, "ref_orig": ref, "strong": strong, "strong_base": strong, "lemma": lemma,
            "forma": forma, "morph": morph, "pos": "noun", "frecuencia": 5}


def nota(word="Dios", verso=1, conf="alta", regla="igual", original="θεός", capitulo=1):
    return {"book": "santiago", "chapter": capitulo, "verse": verso, "word": word, "original": original,
            "transliteration": "theos", "meaning": "Dios", "context": "", "strong": "G2316",
            "lemma": original, "morph": "N-NSM", "confidence": conf,
            "source": f"RV09 manual → RVR1960 ({regla})"}


def cand(orden, word, verso=1, conf="alta", regla="igual"):
    fila = {"ref": f"JAS.1.{verso}", "texto": "", "lema": "", "glosa": "", "word": word,
            "regla": regla, "motivo": ""}
    return (orden, nota(word, verso, conf, regla), fila)


class TestAuxiliares(unittest.TestCase):
    def test_referencia_y_prefijo(self):
        self.assertEqual(generar.referencia("JAS.1.2"), (1, 2))
        self.assertEqual(generar.prefijo("RUT", 1), "RUT-1")
        self.assertEqual(generar.prefijo("JAS", None), "JAS")

    def test_testamento_por_numero_usfm(self):
        self.assertEqual(generar.testamento("RUT"), "AT")
        self.assertEqual(generar.testamento("JAS"), "NT")

    def test_faltan_strong_lista_sin_glosa(self):
        lex = dict(LEX, G9999={"gloss": ""})
        items = [item("a", "JAS.1.1", "θεοῦ", "G2316"), item("b", "JAS.1.1", "x", "G9999")]
        self.assertEqual(generar.faltan_strong(items, lex), ["G9999"])
        self.assertEqual(generar.faltan_strong(items[:1], LEX), [])


class TestOriginal(unittest.TestCase):
    def test_lema_del_lexico(self):
        it = item("a", "JAS.1.2", "χαρὰν", "G5479", lemma="χαρά")
        self.assertEqual(generar.original_y_translit(it, {}, LEX["G5479"], "lema"), ("χαρά", "chara"))

    def test_lema_vacio_cae_al_de_la_fuente_y_luego_a_la_forma(self):
        hebreo = item("h", "RUT.1.15", "אֱלֹהֶי", "H430J", lemma="")
        enl = {"translit_forma": "e.lo.Hei."}
        self.assertEqual(generar.original_y_translit(hebreo, enl, LEX["H430J"], "lema"),
                         ("אֱלֹהֶי", "e.lo.Hei."))
        con_lema = item("h2", "RUT.1.15", "אֱלֹהֶי", "H430J", lemma="אֱלֹהִים")
        self.assertEqual(generar.original_y_translit(con_lema, enl, {}, "lema")[0], "אֱלֹהִים")

    def test_modo_forma_usa_la_forma_y_la_translit_del_enlace(self):
        it = item("a", "JAS.1.2", "χαρὰν", "G5479", lemma="χαρά")
        self.assertEqual(generar.original_y_translit(it, {"translit_forma": "charan"}, LEX["G5479"],
                                                     "forma"), ("χαρὰν", "charan"))


class TestValidacion(unittest.TestCase):
    def test_nota_valida_no_tiene_motivo(self):
        self.assertIsNone(generar.motivo_invalida(nota(), "Santiago, siervo de Dios.", "griego"))

    def test_motivos_de_la_app(self):
        texto = "Santiago, siervo de Dios."
        self.assertEqual(generar.motivo_invalida(dict(nota(), original=""), texto, "griego"), "sin_original")
        self.assertEqual(generar.motivo_invalida(dict(nota(), transliteration=""), texto, "griego"),
                         "sin_translit")
        self.assertEqual(generar.motivo_invalida(dict(nota(), meaning=""), texto, "griego"), "sin_glosa")
        self.assertEqual(generar.motivo_invalida(nota(), texto, "hebreo"), "escritura")
        self.assertEqual(generar.motivo_invalida(nota(word="pueblo"), texto, "griego"), "no_literal")


class TestDeduplicar(unittest.TestCase):
    def test_gana_la_de_mayor_confianza_y_la_otra_va_al_reporte(self):
        cands = [cand(0, "Dios", conf="media", regla="pista"), cand(1, "dios", conf="alta", regla="igual")]
        notas, duplicadas = generar.deduplicar(cands)
        self.assertEqual([n["word"] for n in notas], ["dios"])
        self.assertEqual(notas[0]["confidence"], "alta")
        self.assertEqual([f["motivo"] for f in duplicadas], ["duplicado"])

    def test_misma_palabra_en_otro_versiculo_no_es_duplicado(self):
        notas, duplicadas = generar.deduplicar([cand(0, "Dios", verso=1), cand(1, "Dios", verso=2)])
        self.assertEqual(len(notas), 2)
        self.assertEqual(duplicadas, [])

    def test_conserva_el_orden_del_texto(self):
        notas, _ = generar.deduplicar([cand(2, "b", verso=1), cand(0, "a", verso=1)])
        self.assertEqual([n["word"] for n in notas], ["a", "b"])


class TestCandidatos(unittest.TestCase):
    def setUp(self):
        self.items = [
            item("a", "JAS.1.1", "θεοῦ", "G2316", lemma="θεός"),
            item("b", "JAS.1.2", "χαρὰν", "G5479", lemma="χαρά"),
            item("c", "JAS.1.2", "χαρά", "G5479", lemma="χαρά"),
        ]
        self.res = {
            "a": {"word": "Dios", "confidence": "alta", "regla": "igual", "ref": "JAS.1.1"},
            "b": {"regla": "sin_par"},
            "c": {"word": "gozo", "confidence": "media", "regla": "pista", "ref": "JAS.1.2"},
        }

    def test_notas_y_filas_del_reporte(self):
        filas, cands = generar.candidatos("JAS", self.items, {}, self.res, LEX, DATOS, "lema", set())
        self.assertEqual([f["word"] for f in filas], ["Dios", "—", "gozo"])
        self.assertEqual([f["regla"] for f in filas], ["igual", "sin_par", "pista"])
        self.assertEqual(filas[0]["texto"], "Santiago, siervo de Dios y del Señor.")
        self.assertEqual(filas[1]["texto"], "Tened por sumo gozo, hermanos míos.")
        self.assertEqual([c[1]["word"] for c in cands], ["Dios", "gozo"])
        n = cands[0][1]
        self.assertEqual(list(n.keys())[:3], ["book", "chapter", "verse"])
        self.assertEqual((n["book"], n["chapter"], n["verse"]), ("santiago", 1, 1))
        self.assertEqual((n["original"], n["transliteration"], n["meaning"]), ("θεός", "theos", "Dios"))
        self.assertEqual(n["strong"], "G2316")
        self.assertEqual(n["source"], "RV09 manual → RVR1960 (igual)")

    def test_capitulo_con_distinto_conteo_pasa_a_revisar(self):
        _, cands = generar.candidatos("JAS", self.items, {}, self.res, LEX, DATOS, "lema", {1})
        self.assertEqual({c[1]["confidence"] for c in cands}, {"revisar"})

    def test_palabra_no_literal_queda_como_motivo_sin_nota(self):
        res = dict(self.res, a={"word": "Jesús", "confidence": "alta", "regla": "igual", "ref": "JAS.1.1"})
        filas, cands = generar.candidatos("JAS", self.items[:1], {}, res, LEX, DATOS, "lema", set())
        self.assertEqual(cands, [])
        self.assertEqual(filas[0]["motivo"], "no_literal")


class TestBorrador(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.salida = self.dir.name

    def tearDown(self):
        self.dir.cleanup()

    def leer(self):
        with open(os.path.join(self.salida, "griego.rvr1960.borrador.json"), encoding="utf-8") as f:
            return json.load(f)

    def test_reemplaza_solo_el_capitulo_generado(self):
        generar.escribir_borrador("JAS", None, [nota("a", 1, capitulo=1), nota("b", 1, capitulo=2)],
                                  "santiago", self.salida, AHORA)
        generar.escribir_borrador("JAS", 1, [nota("c", 3, capitulo=1)], "santiago", self.salida, AHORA)
        palabras = [(n["chapter"], n["word"]) for n in self.leer()["notes"]]
        self.assertEqual(palabras, [(1, "c"), (2, "b")])

    def test_libro_completo_reemplaza_todos_sus_capitulos_y_no_toca_otros(self):
        otro = nota("otro", 1, capitulo=1)
        otro["book"] = "rut"
        generar.escribir_borrador("JAS", None, [nota("a", 1, capitulo=1)], "santiago", self.salida, AHORA)
        ruta = os.path.join(self.salida, "griego.rvr1960.borrador.json")
        with open(ruta, "w", encoding="utf-8") as f:
            json.dump({"notes": [otro, nota("a", 1, capitulo=2)]}, f)
        generar.escribir_borrador("JAS", None, [nota("nuevo", 2, capitulo=3)], "santiago", self.salida, AHORA)
        libros = [(n["book"], n["word"]) for n in self.leer()["notes"]]
        self.assertEqual(libros, [("rut", "otro"), ("santiago", "nuevo")])

    def test_cabecera_y_creditos(self):
        generar.escribir_borrador("JAS", None, [], "santiago", self.salida, AHORA)
        doc = self.leer()
        self.assertEqual(doc["generado"], "2026-11-24T09:00:00+00:00")
        self.assertIn("CC BY 4.0", doc["creditos"])
        self.assertEqual(doc["notes"], [])

    def test_hebreo_va_al_archivo_del_at(self):
        ruta = generar.escribir_borrador("RUT", 1, [], "rut", self.salida, AHORA)
        self.assertTrue(ruta.endswith("hebreo.rvr1960.borrador.json"))


class TestReporte(unittest.TestCase):
    def test_tabla_muestra_el_versiculo_una_vez_y_escapa_barras(self):
        filas = [
            {"ref": "JAS.1.1", "texto": "Santiago, siervo.", "lema": "θεός", "glosa": "Dios",
             "word": "Dios", "regla": "igual", "motivo": ""},
            {"ref": "JAS.1.1", "texto": "Santiago, siervo.", "lema": "δοῦλος", "glosa": "a|b",
             "word": "—", "regla": "sin_par", "motivo": ""},
            {"ref": "JAS.1.2", "texto": "Gozo.", "lema": "χαρά", "glosa": "gozo", "word": "gozo",
             "regla": "igual", "motivo": "duplicado"},
        ]
        lineas = generar.tabla(filas).split("\n")
        self.assertEqual(lineas[2], "| JAS.1.1 | Santiago, siervo. | θεός | Dios | Dios | igual |")
        self.assertEqual(lineas[3], "| JAS.1.1 |  | δοῦλος | a\\|b | — | sin_par |")
        self.assertEqual(lineas[4], "| JAS.1.2 | Gozo. | χαρά | gozo | gozo | igual · duplicado |")

    def test_resumen_con_coma_decimal_y_versificacion(self):
        items = [item("a", "JAS.1.1", "x", "G2316"), item("b", "JAS.1.1", "y", "G5479"),
                 item("c", "JAS.1.2", "z", "G5479")]
        res = {"a": {"word": "Dios", "confidence": "alta", "regla": "igual"},
               "b": {"word": "gozo", "confidence": "media", "regla": "pista"},
               "c": {"regla": "sin_par"}}
        notas = [nota("Dios"), nota("gozo", conf="media", regla="pista")]
        lineas = generar.resumen("JAS", None, items, res, notas, [], 0, [])
        self.assertEqual(lineas[0], "JAS: 3 tokens seleccionados · 2 con word (66,7 %) · "
                                    "2 con destino RV09 (66,7 %)")
        self.assertEqual(lineas[2], "Por confianza (notas): alta 1 · media 1 · revisar 0")
        self.assertEqual(lineas[-1], "Versificación RV09 vs RVR1960: sin diferencias")
        con_diferencia = generar.resumen("JAS", 2, items, res, notas, [], 0, [(2, 4, 5)])
        self.assertIn("2 (4 vs 5)", con_diferencia[-1])


class TestValidacionPrevia(unittest.TestCase):
    """Errores que se detectan antes de leer ninguna fuente (no necesitan caché)."""

    def test_at_sin_capitulo_es_error(self):
        with self.assertRaises(ValueError):
            generar.generar("RUT")

    def test_original_desconocido_es_error(self):
        with self.assertRaises(ValueError):
            generar.generar("JAS", config={"original": "raiz"})

    def test_cli_devuelve_2_sin_capitulo_en_el_at(self):
        with contextlib.redirect_stderr(io.StringIO()) as err:
            self.assertEqual(generar.main(["--libro", "RUT"]), 2)
        self.assertIn("indica el capítulo", err.getvalue())


if __name__ == "__main__":
    unittest.main()
