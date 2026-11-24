"""Pruebas de lexico.py: glosario, revisión, validación de respuestas, incorporación, lotes y estado.

Las pruebas de lotes usan las fixtures de Santiago 1:1 (NT): las alineaciones y RV09 de
tests/fixtures/Clear-Bible/ y las filas TAGNT de tests/fixtures/enlace/ (copiadas a una raíz
temporal junto con los léxicos de tests/fixtures/STEPBible/)."""
import contextlib
import io
import json
import os
import shutil
import sys
import tempfile
import unittest

HO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HO)

import lexico  # noqa: E402

FIXTURES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures")
RAIZ_NT = os.path.join(FIXTURES, "enlace")
CLAVES_LOTE = {"strong", "lemma", "gloss_en", "short_en", "es_rv09", "glosario"}


def raiz_mixta(destino):
    """Raíz STEPBible con las filas TAGNT de Santiago (enlace/) y los léxicos (fixtures/)."""
    stepbible_dir = os.path.join(destino, "STEPBible", "STEPBible-Data")
    os.makedirs(stepbible_dir)
    shutil.copytree(os.path.join(RAIZ_NT, "STEPBible", "STEPBible-Data", "Translators Amalgamated OT+NT"),
                    os.path.join(stepbible_dir, "Translators Amalgamated OT+NT"))
    shutil.copytree(os.path.join(FIXTURES, "STEPBible", "STEPBible-Data", "Lexicons"),
                    os.path.join(stepbible_dir, "Lexicons"))
    return destino


def escribir_json(ruta, datos):
    with open(ruta, "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, indent=1)


LOTE = [
    {"strong": "G2316", "lemma": "θεός", "gloss_en": "God", "short_en": "a god or deity",
     "es_rv09": "dios", "glosario": "Dios"},
    {"strong": "G2532", "lemma": "καί", "gloss_en": "and", "short_en": "",
     "es_rv09": None, "glosario": None},
]


class TestGlosario(unittest.TestCase):
    def test_es_objeto_con_claves_strong_base(self):
        glosario = lexico.cargar_glosario()
        self.assertIsInstance(glosario, dict)
        self.assertEqual(len(glosario), 56)
        for clave, termino in glosario.items():
            self.assertRegex(clave, r"^[GH][1-9]\d*$")
            self.assertTrue(termino.strip(), clave)

    def test_contiene_terminos_fijos_del_plan(self):
        glosario = lexico.cargar_glosario()
        self.assertEqual(glosario["G4102"], "fe")
        self.assertEqual(glosario["G2316"], "Dios")
        self.assertEqual(glosario["H136"], "Señor")

    def test_glosario_que_no_es_objeto_es_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            ruta = os.path.join(tmp, "g.json")
            escribir_json(ruta, ["G1"])
            with self.assertRaises(ValueError):
                lexico.cargar_glosario(ruta)


class TestRevision(unittest.TestCase):
    def setUp(self):
        self.glosario = {"G2962": "Señor"}

    def test_clave_en_glosario_pide_revision_por_su_base(self):
        self.assertTrue(lexico.requiere_revision("G2962G", "", "", self.glosario))

    def test_termino_teologico_en_gloss_en(self):
        self.assertTrue(lexico.requiere_revision("G1", "faith", "", {}))
        self.assertTrue(lexico.requiere_revision("G1", "", "a covenant of peace", {}))

    def test_flexiones_de_termino_teologico(self):
        for texto in ("saved", "forgiveness", "sinful", "blessings", "laws", "godly", "saves"):
            self.assertTrue(lexico.requiere_revision("G1", texto, "", {}), texto)

    def test_subcadenas_y_palabras_comunes_no_piden_revision(self):
        for texto in ("single", "since", "lawyer", "stone", "and", "house"):
            self.assertFalse(lexico.requiere_revision("G1", texto, "", {}), texto)


class TestValidarRespuesta(unittest.TestCase):
    def respuesta_ok(self):
        return [{"strong": "G2316", "gloss": "Dios", "short": "Ser supremo al que se adora."},
                {"strong": "G2532", "gloss": "y", "short": "Conjunción que une palabras y frases."}]

    def test_respuesta_valida_no_tiene_errores(self):
        self.assertEqual(lexico.validar_respuesta(LOTE, self.respuesta_ok()), [])

    def test_clave_de_mas(self):
        r = self.respuesta_ok()
        r[1]["lemma"] = "καί"
        errores = lexico.validar_respuesta(LOTE, r)
        self.assertTrue(any("clave de más «lemma»" in e for e in errores), errores)

    def test_falta_clave(self):
        r = self.respuesta_ok()
        del r[0]["short"]
        errores = lexico.validar_respuesta(LOTE, r)
        self.assertTrue(any("falta la clave «short»" in e for e in errores), errores)

    def test_vacio_es_error(self):
        r = self.respuesta_ok()
        r[1]["gloss"] = "   "
        errores = lexico.validar_respuesta(LOTE, r)
        self.assertTrue(any("«gloss» debe ser texto no vacío" in e for e in errores), errores)

    def test_short_de_21_palabras_se_rechaza(self):
        r = self.respuesta_ok()
        r[1]["short"] = " ".join(["palabra"] * 21)
        errores = lexico.validar_respuesta(LOTE, r)
        self.assertTrue(any("21 palabras (máximo 20)" in e for e in errores), errores)

    def test_short_de_20_palabras_pasa(self):
        r = self.respuesta_ok()
        r[1]["short"] = " ".join(["palabra"] * 20)
        self.assertEqual(lexico.validar_respuesta(LOTE, r), [])

    def test_gloss_de_4_palabras_se_rechaza(self):
        r = self.respuesta_ok()
        r[0]["gloss"] = "Dios vivo y verdadero"
        errores = lexico.validar_respuesta(LOTE, r)
        self.assertTrue(any("4 palabras (máximo 3)" in e for e in errores), errores)

    def test_longitud_distinta(self):
        errores = lexico.validar_respuesta(LOTE, self.respuesta_ok()[:1])
        self.assertEqual(errores, ["la respuesta trae 1 entradas; el lote tiene 2"])

    def test_orden_distinto_se_rechaza(self):
        errores = lexico.validar_respuesta(LOTE, list(reversed(self.respuesta_ok())))
        self.assertTrue(any("no coincide con el lote" in e for e in errores), errores)

    def test_termino_de_glosario_debe_empezar_la_glosa(self):
        r = self.respuesta_ok()
        r[0]["gloss"] = "el Dios"
        errores = lexico.validar_respuesta(LOTE, r)
        self.assertTrue(any("debe empezar por «Dios»" in e for e in errores), errores)

    def test_termino_de_glosario_acepta_mayusculas_y_palabra_extra(self):
        r = self.respuesta_ok()
        r[0]["gloss"] = "dios vivo"
        self.assertEqual(lexico.validar_respuesta(LOTE, r), [])

    def test_termino_de_glosario_es_palabra_completa(self):
        lote = [{"strong": "G4102", "glosario": "fe"}]
        errores = lexico.validar_respuesta(lote, [{"strong": "G4102", "gloss": "fenomenal", "short": "x"}])
        self.assertTrue(any("debe empezar por «fe»" in e for e in errores), errores)

    def test_no_es_arreglo(self):
        self.assertEqual(lexico.validar_respuesta(LOTE, {"strong": "G2316"}),
                         ["la respuesta debe ser un arreglo JSON"])


class TestIncorporar(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raiz = tempfile.mkdtemp()
        raiz_mixta(cls.raiz)

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.raiz, ignore_errors=True)

    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.lotes = os.path.join(self.tmp, "lotes")
        os.makedirs(self.lotes)
        self.lexico = os.path.join(self.tmp, "lexico-es.json")
        self.glosario = os.path.join(self.tmp, "glosario.json")
        escribir_json(self.glosario, {"G2316": "Dios"})
        escribir_json(os.path.join(self.lotes, "JAS-001.json"), LOTE)

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def respuesta(self, datos, nombre="JAS-001.respuesta.json"):
        ruta = os.path.join(self.lotes, nombre)
        escribir_json(ruta, datos)
        return ruta

    def incorporar(self, ruta):
        return lexico.incorporar(ruta, lexico=self.lexico, glosario=self.glosario, raiz_step=self.raiz)

    def test_incorpora_con_translit_revision_y_claves_ordenadas(self):
        ruta = self.respuesta([{"strong": "G2316", "gloss": "Dios", "short": "Ser supremo."},
                               {"strong": "G2532", "gloss": "y", "short": "Conjunción de unión."}])
        self.assertEqual(self.incorporar(ruta), (2, 1, 0))
        with open(self.lexico, encoding="utf-8") as f:
            contenido = json.load(f)
        self.assertEqual(list(contenido), ["G2316", "G2532"])
        self.assertEqual(contenido["G2316"], {"lemma": "θεός", "translit": "theos", "gloss": "Dios",
                                              "short": "Ser supremo.", "review": True,
                                              "fuente": "lote JAS-001"})
        self.assertFalse(contenido["G2532"]["review"])
        with open(self.lexico, encoding="utf-8") as f:
            self.assertTrue(f.read().endswith("}\n"))

    def test_no_sobrescribe_entradas_existentes(self):
        escribir_json(self.lexico, {"G2532": {"lemma": "καί", "translit": "kai", "gloss": "X",
                                              "short": "previa.", "review": False, "fuente": "a mano"}})
        ruta = self.respuesta([{"strong": "G2316", "gloss": "Dios", "short": "Ser supremo."},
                               {"strong": "G2532", "gloss": "y", "short": "Conjunción de unión."}])
        self.assertEqual(self.incorporar(ruta), (1, 1, 1))
        with open(self.lexico, encoding="utf-8") as f:
            self.assertEqual(json.load(f)["G2532"]["gloss"], "X")

    def test_respuesta_invalida_no_escribe_nada(self):
        ruta = self.respuesta([{"strong": "G2316", "gloss": "Dios", "short": "ok."},
                               {"strong": "G2532", "gloss": "y", "short": "ok.", "extra": 1}])
        with self.assertRaises(ValueError) as contexto:
            self.incorporar(ruta)
        self.assertIn("clave de más «extra»", str(contexto.exception))
        self.assertFalse(os.path.exists(self.lexico))

    def test_nombre_debe_ser_respuesta(self):
        ruta = os.path.join(self.lotes, "JAS-001.json")
        with self.assertRaises(ValueError):
            self.incorporar(ruta)

    def test_lote_inexistente_es_error(self):
        ruta = self.respuesta([], nombre="JAS-009.respuesta.json")
        with self.assertRaises(ValueError) as contexto:
            self.incorporar(ruta)
        self.assertIn("no existe el lote", str(contexto.exception))


class TestPreparar(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raiz = tempfile.mkdtemp()
        raiz_mixta(cls.raiz)
        cls.fuentes = FIXTURES

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.raiz, ignore_errors=True)

    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.lotes = os.path.join(self.tmp, "lotes")
        self.lexico = os.path.join(self.tmp, "lexico-es.json")

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def preparar(self):
        return lexico.preparar("JAS", lexico=self.lexico, lotes=self.lotes,
                               raiz_fuentes=self.fuentes, raiz_step=self.raiz)

    def test_palabras_rv09_por_strong_sin_vacias(self):
        conteo = lexico.palabras_rv09("JAS", raiz_fuentes=self.fuentes)
        self.assertEqual(conteo["G2316"].most_common(1)[0][0], "dios")
        self.assertEqual(lexico.es_rv09("G2316", conteo), "dios")
        self.assertIsNone(lexico.es_rv09("G2532", conteo))

    def test_crea_lote_con_el_contrato_de_entrada(self):
        creados, pendientes = self.preparar()
        self.assertEqual((creados, pendientes), ([("JAS-001", 3)], 3))
        with open(os.path.join(self.lotes, "JAS-001.json"), encoding="utf-8") as f:
            entradas = json.load(f)
        self.assertEqual([e["strong"] for e in entradas], ["G2316", "G2962G", "G1401"])
        for entrada in entradas:
            self.assertEqual(set(entrada), CLAVES_LOTE)
        self.assertEqual(entradas[0]["es_rv09"], "dios")
        self.assertEqual(entradas[0]["glosario"], "Dios")
        self.assertEqual(entradas[1]["glosario"], "Señor")
        self.assertIsNone(entradas[2]["es_rv09"])

    def test_no_incluye_strongs_ya_en_el_lexico(self):
        escribir_json(self.lexico, {"G2316": {"lemma": "θεός", "translit": "theos", "gloss": "Dios",
                                              "short": "x.", "review": True, "fuente": "a mano"}})
        self.assertEqual(self.preparar(), ([("JAS-001", 2)], 2))
        with open(os.path.join(self.lotes, "JAS-001.json"), encoding="utf-8") as f:
            self.assertNotIn("G2316", [e["strong"] for e in json.load(f)])

    def test_sin_pendientes_no_crea_lotes(self):
        escribir_json(self.lexico, {k: {"gloss": "x"} for k in ("G2316", "G2962G", "G1401")})
        self.assertEqual(self.preparar(), ([], 0))
        self.assertFalse(os.path.exists(self.lotes))

    def test_se_niega_a_sobrescribir_lotes_existentes(self):
        self.preparar()
        with self.assertRaises(ValueError) as contexto:
            self.preparar()
        self.assertIn("ya hay lotes de JAS", str(contexto.exception))

    def test_parte_en_lotes_del_tamano_indicado(self):
        original = lexico.TAMANO_LOTE
        lexico.TAMANO_LOTE = 2
        try:
            creados, pendientes = self.preparar()
        finally:
            lexico.TAMANO_LOTE = original
        self.assertEqual(creados, [("JAS-001", 2), ("JAS-002", 1)])
        self.assertEqual(pendientes, 3)

    def test_estado_cuenta_pendientes(self):
        pendientes = lexico.estado("JAS", lexico=self.lexico, raiz_fuentes=self.fuentes, raiz_step=self.raiz)
        self.assertEqual(pendientes, ["G2316", "G2962G", "G1401"])
        escribir_json(self.lexico, {k: {"gloss": "x"} for k in pendientes})
        self.assertEqual(lexico.estado("JAS", lexico=self.lexico, raiz_fuentes=self.fuentes,
                                       raiz_step=self.raiz), [])


ENTRADAS_REVISION = {
    "G2316": {"lemma": "θεός", "translit": "theos", "gloss": "Dios", "short": "Ser supremo.",
              "review": True, "fuente": "lote JAS-001"},
    "G2962G": {"lemma": "κύριος", "translit": "kyrios", "gloss": "Señor", "short": "Dueño, señor.",
               "review": True, "fuente": "lote JAS-001"},
    "G1401": {"lemma": "δοῦλος", "translit": "doulos", "gloss": "siervo", "short": "Esclavo.",
              "review": False, "fuente": "lote JAS-001"},
}
# Fixture de Santiago: los tres Strong están en JAS.1.1.
RVR_MINI = {"JAS": {"capitulos": {1: {v: f"versículo {v}" for v in range(1, 6)}}}}


class TestFrecuencias(unittest.TestCase):
    def test_cuenta_tokens_con_strong_del_libro_y_del_capitulo(self):
        cuenta = lexico.frecuencias_libro("JAS", raiz_fuentes=FIXTURES)
        self.assertEqual(cuenta["G2316"], 1)
        self.assertEqual(cuenta["G2962"], 1)
        self.assertEqual(lexico.frecuencias_libro("JAS", capitulo=2, raiz_fuentes=FIXTURES), {})


class TestListaRevision(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raiz = tempfile.mkdtemp()
        raiz_mixta(cls.raiz)

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.raiz, ignore_errors=True)

    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.lexico = os.path.join(self.tmp, "lexico-es.json")
        self.glosario = os.path.join(self.tmp, "glosario.json")
        self.salida = os.path.join(self.tmp, "salida")
        self.reportes = os.path.join(self.tmp, "reportes")
        escribir_json(self.lexico, ENTRADAS_REVISION)
        escribir_json(self.glosario, {"G2316": "Dios"})

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def revision(self, maximo=40, rvr=RVR_MINI, glosario=None):
        return lexico.revision("JAS", maximo=maximo, lexico=self.lexico,
                               glosario=glosario or self.glosario, rvr=rvr,
                               salida=self.salida, reportes=self.reportes,
                               raiz_fuentes=FIXTURES, raiz_step=self.raiz)

    def leer(self, ruta):
        with open(ruta, encoding="utf-8") as f:
            return f.read()

    def lista(self):
        return self.leer(os.path.join(self.salida, "JAS.revision.txt")).splitlines()

    def pendiente(self):
        return self.leer(os.path.join(self.reportes, "JAS.revision-pendiente.md"))

    def test_glosario_primero_y_el_resto_al_pendiente(self):
        self.assertEqual(self.revision(maximo=1), (1, 1))
        self.assertEqual(self.lista(), ["G2316 · θεός · Dios · Ser supremo. · JAS.1.1: versículo 1"])
        self.assertIn("- G2962G · κύριος · Señor · Dueño, señor. · JAS.1.1: versículo 1", self.pendiente())
        self.assertIn("Revisarlas a mano", self.pendiente())

    def test_sin_tope_todas_en_la_lista_y_sin_pendientes(self):
        self.assertEqual(self.revision(), (2, 0))
        self.assertEqual([linea.split(" · ")[0] for linea in self.lista()], ["G2316", "G2962G"])
        self.assertIn("Sin pendientes", self.pendiente())

    def test_solo_entradas_con_review_true(self):
        self.revision()
        self.assertNotIn("G1401", self.leer(os.path.join(self.salida, "JAS.revision.txt")))

    def test_sin_entradas_pendientes_la_lista_queda_vacia(self):
        escribir_json(self.lexico, {k: dict(v, review=False) for k, v in ENTRADAS_REVISION.items()})
        self.assertEqual(self.revision(), (0, 0))
        self.assertEqual(self.leer(os.path.join(self.salida, "JAS.revision.txt")), "")

    def test_versiculo_largo_se_recorta_a_160_caracteres(self):
        largo = {"JAS": {"capitulos": {1: {1: "palabra " * 80}}}}
        self.revision(maximo=1, rvr=largo)
        verso = self.lista()[0].split("JAS.1.1: ", 1)[1]
        self.assertLessEqual(len(verso), 160)
        self.assertTrue(verso.endswith("…"))

    def test_max_menor_que_uno_es_error(self):
        with self.assertRaises(ValueError):
            self.revision(maximo=0)


class TestAplicarRevision(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.lexico = os.path.join(self.tmp, "lexico-es.json")
        self.glosario = os.path.join(self.tmp, "glosario.json")
        self.ruta = os.path.join(self.tmp, "JAS.revision.respuesta.json")
        escribir_json(self.lexico, ENTRADAS_REVISION)
        escribir_json(self.glosario, {"G2316": "Dios"})

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def aplicar(self, datos):
        escribir_json(self.ruta, datos)
        return lexico.aplicar_revision(self.ruta, lexico=self.lexico, glosario=self.glosario)

    def contenido(self):
        with open(self.lexico, encoding="utf-8") as f:
            return json.load(f)

    def assertRechaza(self, datos, fragmento):
        with self.assertRaises(ValueError) as contexto:
            self.aplicar(datos)
        self.assertIn(fragmento, str(contexto.exception))
        self.assertEqual(self.contenido(), ENTRADAS_REVISION)

    def test_aplica_marca_review_false_y_revisado_opus(self):
        respuesta = {"G2316": {"gloss": "Dios", "short": "Ser supremo, el Dios verdadero."},
                     "G2962G": {"gloss": "Señor", "short": "Dueño, señor."}}
        self.assertEqual(self.aplicar(respuesta), (2, 1))
        contenido = self.contenido()
        self.assertEqual(contenido["G2316"]["short"], "Ser supremo, el Dios verdadero.")
        self.assertIs(contenido["G2316"]["review"], False)
        self.assertEqual(contenido["G2316"]["revisado"], "opus")
        self.assertEqual(contenido["G2962G"]["revisado"], "opus")
        self.assertEqual(contenido["G2316"]["lemma"], "θεός")
        self.assertNotIn("revisado", contenido["G1401"])

    def test_clave_fuera_del_lexico(self):
        self.assertRechaza({"G9999": {"gloss": "x", "short": "y."}}, "no está en lexico-es.json")

    def test_entrada_sin_pendiente_se_rechaza(self):
        self.assertRechaza({"G1401": {"gloss": "siervo", "short": "Esclavo."}}, "no está pendiente")

    def test_termino_de_glosario_debe_empezar_la_glosa(self):
        self.assertRechaza({"G2316": {"gloss": "Deidad", "short": "Ser supremo."}}, "debe empezar por «Dios»")

    def test_gloss_de_mas_de_tres_palabras(self):
        self.assertRechaza({"G2962G": {"gloss": "Dueño y Señor de todos", "short": "x."}}, "«gloss» tiene 5")

    def test_short_de_mas_de_veinte_palabras(self):
        largo = " ".join(["palabra"] * 21)
        self.assertRechaza({"G2962G": {"gloss": "Señor", "short": largo}}, "«short» tiene 21")

    def test_claves_de_mas_y_de_menos(self):
        self.assertRechaza({"G2962G": {"gloss": "Señor", "short": "x.", "extra": 1}}, "clave de más «extra»")
        self.assertRechaza({"G2962G": {"gloss": "Señor"}}, "falta la clave «short»")

    def test_no_es_objeto(self):
        with self.assertRaises(ValueError) as contexto:
            self.aplicar([{"strong": "G2962G"}])
        self.assertIn("objeto cuyas claves son Strong", str(contexto.exception))


class TestCli(unittest.TestCase):
    def test_libro_desconocido_sale_con_2(self):
        with contextlib.redirect_stderr(io.StringIO()) as err:
            self.assertEqual(lexico.main(["estado", "--libro", "XXX"]), 2)
        self.assertIn("error:", err.getvalue())

    def test_revision_de_libro_desconocido_sale_con_2(self):
        with contextlib.redirect_stderr(io.StringIO()) as err:
            self.assertEqual(lexico.main(["revision", "--libro", "XXX"]), 2)
        self.assertIn("error:", err.getvalue())


if __name__ == "__main__":
    unittest.main()
