// Comprueba que cada nota de un borrador encuentra su `word` en el versículo de la
// RVR1960 tal como lo tokeniza la app (`parseOriginal`, `tokenize` de src/app/content.ts).
//
// Uso (desde la raíz del repo):
//   node --experimental-strip-types estudio/herramientas/original/validar-app.ts \
//     <biblia.json> <borrador.json>…
// El idioma sale del nombre del borrador: debe empezar por «griego» o «hebreo».
// Sale con 1 si alguna nota no se encuentra.

import {readFileSync} from 'node:fs';
import {basename} from 'node:path';
import {parseBible, parseOriginal, tokenize} from '../../src/app/content.ts';
import type {Bible, OriginalLanguage, OriginalNote} from '../../src/app/content.ts';

type Cuenta = {notas: number; encontradas: number; faltan: number};

function idiomaDe(ruta: string): OriginalLanguage {
  const nombre = basename(ruta).toLowerCase();
  if (nombre.startsWith('griego')) return 'griego';
  if (nombre.startsWith('hebreo')) return 'hebreo';
  throw new Error(`no sé el idioma de «${ruta}»: el nombre debe empezar por griego o hebreo`);
}

function textoDe(biblia: Bible, nota: OriginalNote): string | undefined {
  const libro = biblia.books.find(b => b.id === nota.book);
  const capitulo = libro?.chapters.find(c => c.number === nota.chapter);
  return capitulo?.verses.find(v => v.number === nota.verse)?.text;
}

function validarBorrador(biblia: Bible, ruta: string): Cuenta {
  const raw = JSON.parse(readFileSync(ruta, 'utf8'));
  const notas = parseOriginal(raw, idiomaDe(ruta));
  const faltan: string[] = [];
  for (const nota of notas) {
    const ref = `${nota.book} ${nota.chapter}:${nota.verse}`;
    const texto = textoDe(biblia, nota);
    if (texto === undefined) {
      faltan.push(`  ${ref} · «${nota.word}» · el versículo no existe en la Biblia`);
    } else if (!tokenize(texto, [nota]).some(token => token.note)) {
      faltan.push(`  ${ref} · «${nota.word}» · no aparece como palabra completa en el versículo`);
    }
  }
  const cuenta = {notas: notas.length, encontradas: notas.length - faltan.length, faltan: faltan.length};
  console.log(`${basename(ruta)}: ${cuenta.notas} notas · ${cuenta.encontradas} encontradas · ${cuenta.faltan} faltan`);
  for (const linea of faltan) console.log(linea);
  return cuenta;
}

function main(): number {
  const [bibliaRuta, ...borradores] = process.argv.slice(2);
  if (!bibliaRuta || borradores.length === 0) {
    console.error('uso: validar-app.ts <biblia.json> <borrador.json>…');
    return 1;
  }
  const biblia = parseBible(JSON.parse(readFileSync(bibliaRuta, 'utf8')));
  const total: Cuenta = {notas: 0, encontradas: 0, faltan: 0};
  for (const ruta of borradores) {
    const cuenta = validarBorrador(biblia, ruta);
    total.notas += cuenta.notas;
    total.encontradas += cuenta.encontradas;
    total.faltan += cuenta.faltan;
  }
  if (borradores.length > 1) {
    console.log(`total: ${total.notas} notas · ${total.encontradas} encontradas · ${total.faltan} faltan`);
  }
  return total.faltan > 0 ? 1 : 0;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(`error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
