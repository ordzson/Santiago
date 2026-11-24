# Instrucciones de traducción del léxico

Tarea: para cada entrada del lote, escribe la glosa y la frase breve en español, con el registro
de un estudio bíblico que acompaña la RVR1960. Este documento es fijo: se usa igual en cada lote.

## Entrada (en el lote, arreglo JSON)

- `strong`: número Strong del término (clave del léxico). Devuélvelo tal cual.
- `lemma`: lema griego o hebreo. No lo devuelvas ni lo transcribas.
- `gloss_en`: glosa breve en inglés (STEPBible). Base principal de la traducción.
- `short_en`: definición breve en inglés (STEPBible). Base de la frase.
- `es_rv09`: palabra que usa la RV1909 para este término en el libro. Es una pista, no una orden:
  si encaja con el sentido bíblico, úsala. `null` significa que no hay pista.
- `glosario`: término fijo o `null`. Si no es `null`, `gloss` empieza exactamente por ese término
  (puede seguir una palabra más, sin pasar de 3 palabras en total).

## Salida

- Devuelve **solo** un arreglo JSON: mismo orden, misma cantidad de entradas, y en cada objeto
  exactamente las claves `strong`, `gloss` y `short`.
- Nada antes ni después del arreglo: sin explicaciones, sin comentarios, sin bloques de código,
  sin campos adicionales.

Ejemplo de formato (no pertenece a ningún lote):

```json
[{"strong": "G4102", "gloss": "fe", "short": "confianza firme en Dios y en lo que él ha prometido."}]
```

## Reglas

- `gloss`: de 1 a 3 palabras. Es el encabezado de la palabra en la nota: en minúscula salvo los
  nombres propios.
- `short`: una sola frase de 20 palabras como máximo. Explica el sentido del término en el uso
  bíblico. Sin citar versículos ni referencias.
- Español neutro latinoamericano, registro de estudio bíblico, no académico.
- Prefiere el término que usa la RVR1960 cuando lo conozcas. `es_rv09` es la palabra de la RV1909
  en ese libro y sirve de pista.
- Nombres propios: forma española de la RVR1960 (Dios, Jehová, Jesús, Abraham, Belén, etc.).
- No inventes datos que no estén en `gloss_en` o `short_en`.
- Si `gloss_en` da dos sentidos muy distintos, elige el que corresponde al uso bíblico común.
- No escribas el griego ni el hebreo en la salida.
