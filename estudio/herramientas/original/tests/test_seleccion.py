"""Pruebas de seleccion.py: reglas de pos/Strong/frecuencia/tope y la selección con las fixtures
de Santiago 1:1 (NT, tests/fixtures/enlace/) y Rut 1:1 (AT, tests/fixtures/enlace_at/)."""
import os
import sys
import unittest

HO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HO)

import seleccion  # noqa: E402

FIXTURES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures")
RAIZ_NT = os.path.join(FIXTURES, "enlace")
RAIZ_AT = os.path.join(FIXTURES, "enlace_at")
GLOSARIO_FIXTURE = os.path.join(FIXTURES, "seleccion", "glosario.json")
POS_NT = {"det", "conj", "prep", "pron", "ptcl"}
POS_AT = {"conjunction", "particle", "preposition", "pronoun", "suffix"}


def item(id_, ref="JAS.1.1", pos="noun", sb="G100", freq=10, strong=None):
    return {"id": id_, "ref_orig": ref, "strong": strong or sb, "strong_base": sb, "lemma": "",
            "forma": "x", "morph": "", "pos": pos, "frecuencia": freq}


class TestElegir(unittest.TestCase):
    def setUp(self):
        self.cfg = seleccion.cargar_config()

    def test_config_tiene_los_valores_del_contrato(self):
        self.assertEqual(self.cfg["nt"]["umbral_frecuencia"], 1000)
        self.assertEqual(self.cfg["at"]["umbral_frecuencia"], 2000)
        self.assertEqual(self.cfg["max_por_versiculo"], 3)
        self.assertEqual(self.cfg["excluir"], ["G1510", "G3004", "H1961", "H559"])
        self.assertEqual(self.cfg["at"]["excluir_prefijo_strong"], ["H9"])

    def test_pos_excluidos_ausentes(self):
        items = [item(f"n{i}", pos=p, sb=f"G{100 + i}") for i, p in enumerate(sorted(POS_NT | {"noun"}))]
        elegidos = seleccion.elegir(items, self.cfg, "NT", set())
        self.assertEqual([i["pos"] for i in elegidos], ["noun"])

    def test_tope_por_versiculo_prioriza_menor_frecuencia_y_luego_orden(self):
        freqs = [50, 5, 30, 20, 10]
        items = [item(f"n{k}", sb=f"G{k}", freq=f) for k, f in enumerate(freqs)]
        elegidos = seleccion.elegir(items, self.cfg, "NT", set())
        self.assertEqual([i["id"] for i in elegidos], ["n1", "n3", "n4"])

    def test_tope_se_aplica_por_versiculo(self):
        items = [item("a1", ref="JAS.1.1", sb="G1"), item("a2", ref="JAS.1.1", sb="G2"),
                 item("a3", ref="JAS.1.1", sb="G3"), item("a4", ref="JAS.1.1", sb="G4"),
                 item("b1", ref="JAS.1.2", sb="G5")]
        elegidos = seleccion.elegir(items, self.cfg, "NT", set())
        self.assertEqual([i["id"] for i in elegidos], ["a1", "a2", "a3", "b1"])

    def test_siempre_entra_aunque_supere_el_umbral(self):
        items = [item("n1", sb="G2316", freq=5000)]
        self.assertEqual(seleccion.elegir(items, self.cfg, "NT", {"G2316"})[0]["id"], "n1")
        self.assertEqual(seleccion.elegir(items, self.cfg, "NT", set()), [])

    def test_siempre_tiene_prioridad_sobre_la_frecuencia(self):
        items = [item("n1", sb="G900", freq=900), item("n2", sb="G1", freq=1),
                 item("n3", sb="G2", freq=2), item("n4", sb="G3", freq=3)]
        elegidos = seleccion.elegir(items, self.cfg, "NT", {"G900"})
        self.assertEqual([i["id"] for i in elegidos], ["n1", "n2", "n3"])

    def test_umbral_descarta_frecuentes_no_siempre(self):
        items = [item("n1", sb="G2424", freq=1001), item("n2", sb="G5547", freq=1000)]
        elegidos = seleccion.elegir(items, self.cfg, "NT", set())
        self.assertEqual([i["id"] for i in elegidos], ["n2"])

    def test_excluir_strong_de_la_lista(self):
        items = [item("n1", sb="G1510"), item("n2", sb="G2316")]
        elegidos = seleccion.elegir(items, self.cfg, "NT", set())
        self.assertEqual([i["id"] for i in elegidos], ["n2"])

    def test_excluir_se_aplica_al_strong_enlazado_con_sufijo(self):
        items = [item("n1", sb="G3004", strong="G3004I")]
        self.assertEqual(seleccion.elegir(items, self.cfg, "NT", set()), [])

    def test_prefijo_h9_excluido_solo_en_at(self):
        items = [item("o1", ref="RUT.1.1", sb="H9003", strong="H9003", pos="noun"),
                 item("o2", ref="RUT.1.1", sb="H3117", pos="noun"),
                 item("o3", ref="RUT.1.1", sb="H1961", pos="verb")]
        elegidos = seleccion.elegir(items, self.cfg, "AT", set())
        self.assertEqual([i["id"] for i in elegidos], ["o2"])

    def test_salida_en_orden_de_texto(self):
        items = [item("n1", ref="JAS.1.2", sb="G1", freq=1), item("n2", ref="JAS.1.1", sb="G2", freq=9),
                 item("n3", ref="JAS.1.1", sb="G3", freq=1)]
        elegidos = seleccion.elegir(items, self.cfg, "NT", set())
        self.assertEqual([i["id"] for i in elegidos], ["n1", "n2", "n3"])


class TestSiempreEfectivo(unittest.TestCase):
    def test_une_config_y_claves_del_glosario(self):
        cfg = {"siempre": ["G1"]}
        self.assertEqual(seleccion.siempre_efectivo(cfg, GLOSARIO_FIXTURE), {"G1", "G5479", "H1254"})

    def test_sin_glosario_solo_config(self):
        cfg = {"siempre": ["G1"]}
        self.assertEqual(seleccion.siempre_efectivo(cfg, os.path.join(FIXTURES, "no-existe.json")), {"G1"})


class TestSeleccionarNT(unittest.TestCase):
    def setUp(self):
        self.cfg = seleccion.cargar_config()

    def test_fixture_jas_11_elige_tres_por_orden(self):
        items = seleccion.seleccionar("JAS", config=self.cfg, siempre=set(),
                                      raiz_fuentes=RAIZ_NT, raiz_step=RAIZ_NT)
        self.assertEqual([i["id"] for i in items],
                         ["n59001001001", "n59001001002", "n59001001004"])

    def test_fixture_jas_11_no_incluye_pos_excluidos(self):
        items = seleccion.seleccionar("JAS", config=self.cfg, siempre=set(),
                                      raiz_fuentes=RAIZ_NT, raiz_step=RAIZ_NT)
        self.assertFalse(POS_NT & {i["pos"] for i in items})

    def test_item_enlazado_usa_dstrong_y_datos_de_la_fuente(self):
        items = seleccion.seleccionar("JAS", config=self.cfg, siempre=set(),
                                      raiz_fuentes=RAIZ_NT, raiz_step=RAIZ_NT)
        kyrios = next(i for i in items if i["id"] == "n59001001004")
        self.assertEqual(kyrios, {"id": "n59001001004", "ref_orig": "JAS.1.1", "strong": "G2962G",
                                  "strong_base": "G2962", "lemma": "κύριος", "forma": "κυρίου",
                                  "morph": "N-GSM", "pos": "noun", "frecuencia": 1})

    def test_capitulo_inexistente_es_error(self):
        with self.assertRaises(ValueError):
            seleccion.seleccionar("JAS", capitulo=2, config=self.cfg, siempre=set(),
                                  raiz_fuentes=RAIZ_NT, raiz_step=RAIZ_NT)


class TestSeleccionarAT(unittest.TestCase):
    def setUp(self):
        self.cfg = seleccion.cargar_config()

    def test_at_exige_capitulo(self):
        with self.assertRaises(ValueError):
            seleccion.seleccionar("RUT", config=self.cfg, siempre=set(),
                                  raiz_fuentes=RAIZ_AT, raiz_step=RAIZ_AT, lexico={})

    def test_fixture_rut_11_respeta_tope_y_exclusiones(self):
        items = seleccion.seleccionar("RUT", capitulo=1, config=self.cfg, siempre=set(),
                                      raiz_fuentes=RAIZ_AT, raiz_step=RAIZ_AT, lexico={})
        self.assertEqual(len(items), 3)
        self.assertTrue(all(i["ref_orig"] == "RUT.1.1" for i in items))
        self.assertFalse(POS_AT & {i["pos"] for i in items})
        self.assertFalse(any(i["strong_base"].startswith("H9") for i in items))
        self.assertFalse(any(i["strong_base"] in {"H1961", "H559"} for i in items))

    def test_fixture_rut_11_sin_lexico_lema_vacio(self):
        items = seleccion.seleccionar("RUT", capitulo=1, config=self.cfg, siempre=set(),
                                      raiz_fuentes=RAIZ_AT, raiz_step=RAIZ_AT, lexico={})
        self.assertTrue(all(i["lemma"] == "" for i in items))


if __name__ == "__main__":
    unittest.main()
