import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseOriginal} from '../src/app/content.ts';

const cargar = (nombre: string) => JSON.parse(readFileSync(new URL(`../public/data/${nombre}`, import.meta.url), 'utf8'));

test('el borrador del griego (Santiago) lo acepta parseOriginal', () => {
  const notas = parseOriginal(cargar('griego.rvr1960.borrador.json'), 'griego');
  assert.ok(notas.length > 0);
  assert.ok(notas.every(n => n.language === 'griego' && n.original.length > 0));
});

test('el borrador del hebreo (Rut 1) lo acepta parseOriginal', () => {
  const notas = parseOriginal(cargar('hebreo.rvr1960.borrador.json'), 'hebreo');
  assert.ok(notas.length > 0);
  assert.ok(notas.every(n => n.language === 'hebreo' && n.original.length > 0));
});
