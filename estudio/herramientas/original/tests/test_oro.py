"""Pruebas de oro.py con datos sintéticos pequeños (sin tocar la caché real).

Las funciones que leen archivos reciben una ruta temporal (`raiz=`, `ruta=`, `carpeta=`).
"""
import json
import os
import sys
import tempfile
import unittest
from collections import defaultdict

HO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HO)

import oro  # noqa: E402


def _token(id_, texto, strongs, lemma, gloss="x"):
    return {"id": id_, "altId": "", "text": texto, "strongs": strongs,
            "gloss": gloss, "gloss2": "", "lemma": lemma, "pos": "", "morph": ""}


def _nota(cap, vers, griego, palabra="palabra", libro="santiago"):
    return {"book": libro, "chapter": cap, "verse": vers, "word": palabra, "greek": griego}


def _datos_rvr(textos):
    """`textos` = {(cap, vers): texto} de Santiago, con la forma de rvr1960.leer()."""
    capitulos = defaultdict(dict)
    for (cap, vers), texto in textos.items():
        capitulos[cap][vers] = texto
    return {"JAS": {"nombre": "Santiago", "capitulos": dict(capitulos), "titulos": {}}}


class TestNormalizar(unittest.TestCase):
    def test_quita_diacriticos_y_mayusculas(self):
        self.assertEqual(oro.normalizar("Χαρά"), "χαρα")
        self.assertEqual(oro.normalizar("ἀδελφός"), oro.normalizar("αδελφος"))

    def test_sigma_final_igual_que_sigma(self):
        self.assertEqual(oro.normalizar("λόγος"), oro.normalizar("λόγοσ"))
        self.assertEqual(oro.normalizar("λόγος"), "λογοσ")


class TestBuscarToken(unittest.TestCase):
    def setUp(self):
        self.tokens = [
            _token("n59001002001", "Πᾶσαν", "G3956", "πᾶς"),
            _token("n59001002002", "χαρὰν", "G5479", "χαρά"),
        ]

    def test_por_texto(self):
        self.assertEqual(oro.buscar_token(self.tokens, "χαρὰν")["strongs"], "G5479")

    def test_por_lema(self):
        self.assertEqual(oro.buscar_token(self.tokens, "χαρά")["strongs"], "G5479")

    def test_sin_coincidencia(self):
        self.assertIsNone(oro.buscar_token(self.tokens, "λόγος"))


class TestCandidatos(unittest.TestCase):
    def test_filtra_y_enlaza(self):
        fuente = {
            (1, 2): [
                _token("n59001002001", "Πᾶσαν", "G3956", "πᾶς"),
                _token("n59001002002", "χαρὰν", "G5479", "χαρά", gloss="joy"),
                _token("n59001002003", "ἡγήσασθε", "G2233", "ἡγέομαι"),
                _token("n59001002004", "ἀδελφοί", "", "ἀδελφός"),
            ],
            (1, 3): [_token("n59001003001", "γινώσκοντες", "G1097", "γινώσκω")],
        }
        notas = [
            _nota(1, 2, "χαρά", "gozo"),                     # match por lema
            _nota(1, 2, "ἐν πειρασμοῖς", "pruebas"),          # varias palabras: se descarta
            _nota(1, 2, "ἀδελφός", "hermanos"),               # token sin Strong: se descarta
            _nota(1, 2, "χαρά", "gozo"),                     # duplicado (mismo ref y strong)
            _nota(1, 2, "Ἰάκωβος", "Santiago"),              # no está en el versículo: se descarta
            _nota(1, 3, "γινώσκω", "sabiendo"),              # match por lema
        ]
        resultado = oro.candidatos(notas, fuente)
        self.assertEqual(resultado, [
            {"ref": "JAS.1.2", "strong": "G5479", "lemma": "χαρά", "gloss": "joy", "nbla": "gozo"},
            {"ref": "JAS.1.3", "strong": "G1097", "lemma": "γινώσκω", "gloss": "x", "nbla": "sabiendo"},
        ])

    def test_strong_sin_ceros_en_la_salida(self):
        fuente = {(1, 1): [_token("n59001001001", "Βίβλος", "G0976", "βίβλος")]}
        resultado = oro.candidatos([_nota(1, 1, "βίβλος", "libro")], fuente)
        self.assertEqual(resultado[0]["strong"], "G976")

    def test_orden_por_referencia(self):
        fuente = {
            (2, 1): [_token("n59002001001", "a", "G1", "uno")],
            (1, 5): [_token("n59001005001", "b", "G2", "dos")],
        }
        notas = [_nota(2, 1, "uno"), _nota(1, 5, "dos")]
        refs = [c["ref"] for c in oro.candidatos(notas, fuente)]
        self.assertEqual(refs, ["JAS.1.5", "JAS.2.1"])


class TestEspaciar(unittest.TestCase):
    def test_lista_corta_se_devuelve_entera(self):
        self.assertEqual(oro.espaciar([1, 2, 3], 12), [1, 2, 3])

    def test_lista_larga_reparte_uniforme_y_determinista(self):
        lista = list(range(30))
        elegidos = oro.espaciar(lista, 12)
        self.assertEqual(len(elegidos), 12)
        self.assertEqual(elegidos[0], 0)
        self.assertEqual(elegidos[-1], 29)
        self.assertEqual(elegidos, sorted(set(elegidos)))
        self.assertEqual(elegidos, oro.espaciar(lista, 12))


class TestSeleccionar(unittest.TestCase):
    def test_maximo_doce_por_capitulo_en_orden(self):
        total = [{"ref": f"JAS.1.{i}", "strong": "G1", "lemma": "", "gloss": "", "nbla": ""}
                 for i in range(1, 31)]
        total += [{"ref": f"JAS.2.{i}", "strong": "G2", "lemma": "", "gloss": "", "nbla": ""}
                  for i in range(1, 6)]
        elegidos = oro.seleccionar(total)
        caps = [int(c["ref"].split(".")[1]) for c in elegidos]
        self.assertEqual(caps.count(1), 12)
        self.assertEqual(caps.count(2), 5)
        self.assertEqual(caps, sorted(caps))


class TestLinea(unittest.TestCase):
    def test_formato_de_la_linea(self):
        candidato = {"ref": "JAS.1.2", "strong": "G5479", "lemma": "χαρά", "gloss": "joy", "nbla": "gozo"}
        datos = _datos_rvr({(1, 2): "Hermanos míos, tened por sumo gozo"})
        self.assertEqual(
            oro.linea(candidato, datos),
            "JAS.1.2 · G5479 · χαρά · joy · NBLA «gozo» · RVR1960: Hermanos míos, tened por sumo gozo")


class TestLecturas(unittest.TestCase):
    def test_versiculos_fuente_agrupa_por_capitulo_y_versiculo(self):
        with tempfile.TemporaryDirectory() as raiz:
            carpeta = os.path.join(raiz, "Clear-Bible", "Alignments", "data", "sources")
            os.makedirs(carpeta)
            filas = [
                "id\taltId\ttext\tstrongs\tgloss\tgloss2\tlemma\tpos\tmorph",
                "n59001002001\tx\tΠᾶσαν\tG3956\tAll\tall\tπᾶς\tadj\tA-ASF",
                "n59001002002\tx\tχαρὰν\tG5479\tjoy\tjoy\tχαρά\tnoun\tN-ASF",
                "n59001003001\tx\tγινώσκοντες\tG1097\tknowing\tknow\tγινώσκω\tverb\tV-PAP",
                "n40001001001\tx\tΒίβλος\tG0976\tbook\tbook\tβίβλος\tnoun\tN-NSF",
            ]
            with open(os.path.join(carpeta, "SBLGNT.tsv"), "w", encoding="utf-8") as f:
                f.write("\n".join(filas) + "\n")
            agrupados = oro.versiculos_fuente(raiz=raiz)
        self.assertEqual(sorted(agrupados), [(1, 2), (1, 3)])
        self.assertEqual([t["text"] for t in agrupados[(1, 2)]], ["Πᾶσαν", "χαρὰν"])
        self.assertEqual(len(agrupados[(1, 3)]), 1)

    def test_leer_notas_solo_del_libro(self):
        with tempfile.TemporaryDirectory() as carpeta:
            ruta = os.path.join(carpeta, "griego.json")
            datos = {"notes": [_nota(1, 1, "a", libro="santiago"), _nota(1, 1, "b", libro="otro")]}
            with open(ruta, "w", encoding="utf-8") as f:
                json.dump(datos, f)
            notas = oro.leer_notas(ruta)
        self.assertEqual([n["greek"] for n in notas], ["a"])

    def test_escribir_json_y_txt(self):
        elegidos = [{"ref": "JAS.1.2", "strong": "G5479", "lemma": "χαρά", "gloss": "joy", "nbla": "gozo"}]
        datos = _datos_rvr({(1, 2): "Hermanos míos"})
        with tempfile.TemporaryDirectory() as carpeta:
            oro.escribir(elegidos, datos, carpeta)
            with open(os.path.join(carpeta, "oro-candidatos.json"), encoding="utf-8") as f:
                self.assertEqual(json.load(f), elegidos)
            with open(os.path.join(carpeta, "oro-candidatos.txt"), encoding="utf-8") as f:
                lineas = f.read().splitlines()
        self.assertEqual(len(lineas), 1)
        self.assertTrue(lineas[0].startswith("JAS.1.2 · G5479 · χαρά"))
        self.assertTrue(lineas[0].endswith("RVR1960: Hermanos míos"))


class TestComprobar(unittest.TestCase):
    def test_aparece_con_la_regla_de_la_app(self):
        texto = "Hermanos míos, tened por sumo gozo cuando os halléis en diversas pruebas,"
        self.assertTrue(oro.aparece(texto, "gozo"))
        self.assertTrue(oro.aparece(texto, "HERMANOS"))
        self.assertTrue(oro.aparece(texto, "sumo gozo"))
        self.assertFalse(oro.aparece(texto, "prueba"))  # letra pegada: «pruebas»
        self.assertFalse(oro.aparece(texto, "ermanos"))
        self.assertFalse(oro.aparece(texto, "tened gozo"))  # no contigua

    def test_cuenta_asociaciones_y_fuera(self):
        datos = _datos_rvr({(1, 2): "Hermanos míos, tened por sumo gozo,"})
        muestra = [
            {"ref": "JAS.1.2", "strong": "G5479", "word": "gozo"},
            {"ref": "JAS.1.2", "strong": "G80", "word": "hermano"},
            {"ref": "JAS.1.2", "strong": "G1", "word": None},
            {"ref": "JAS.9.9", "strong": "G2", "word": "gozo"},
        ]
        n, fuera = oro.comprobar(muestra, datos)
        self.assertEqual(n, 3)
        self.assertEqual([e["strong"] for e in fuera], ["G80", "G2"])


if __name__ == "__main__":
    unittest.main()
