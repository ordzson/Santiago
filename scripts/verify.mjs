#!/usr/bin/env node
// Verificación silenciosa: una línea por paso; si algo falla, se detiene y
// muestra como máximo 40 líneas. La salida completa queda en .verify/<paso>.log.
//
// Uso: node scripts/verify.mjs [quick|full|<paso> ...]
//   quick  → pasos rápidos (por defecto)
//   full   → todos los pasos
//   <paso> → solo esos pasos, en el orden dado (p. ej. `build`, `test api`)
// Tope por paso: VERIFY_TIMEOUT_MS (por defecto 10 min).

import { spawn } from 'node:child_process';
import { createWriteStream, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// ── Pasos (edita este bloque según el stack; todo con pnpm, sin lint) ──────────
const STEPS = {
  test: 'pnpm --dir estudio test',
  pipeline: 'python3 -I estudio/herramientas/original/pruebas.py',
  build: 'pnpm --dir estudio build',
};
const MODES = {
  quick: ['test', 'pipeline'],
  full: ['test', 'pipeline', 'build'],
};
// ──────────────────────────────────────────────────────────────────────────────

const MAX_LINES = 40;
const TIMEOUT_MS = Number(process.env.VERIFY_TIMEOUT_MS) || 10 * 60 * 1000;
const LOG_DIR = '.verify';

const args = process.argv.slice(2);
const names = args.length === 0 ? MODES.quick : args.flatMap((a) => MODES[a] ?? [a]);
const unknown = names.filter((n) => !STEPS[n]);
if (unknown.length) {
  console.error(`Paso desconocido: ${unknown.join(', ')}`);
  console.error(`Modos: ${Object.keys(MODES).join(', ')} · Pasos: ${Object.keys(STEPS).join(', ')}`);
  process.exit(2);
}

mkdirSync(LOG_DIR, { recursive: true });

function run(name, cmd) {
  const logPath = join(LOG_DIR, `${name}.log`);
  const log = createWriteStream(logPath);
  const started = Date.now();
  return new Promise((resolve) => {
    const child = spawn(cmd, {
      shell: true,
      detached: true, // grupo propio: el timeout mata también a los hijos
      env: { ...process.env, CI: '1', FORCE_COLOR: '0', NO_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.pipe(log, { end: false });
    child.stderr.pipe(log, { end: false });
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {}
    }, TIMEOUT_MS);
    child.on('close', (code) => {
      clearTimeout(timer);
      log.end(() =>
        resolve({ code: timedOut ? 124 : (code ?? 1), timedOut, logPath, secs: (Date.now() - started) / 1000 }),
      );
    });
  });
}

function tail(logPath) {
  const lines = readFileSync(logPath, 'utf8')
    .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
    .split('\n')
    .filter((l) => l.trim());
  // Prioriza líneas con pinta de error; si no hay, las últimas.
  const err = lines.filter((l) => /\b(Error|ERROR|FAIL|Failed|AssertionError)\b|✗|×|ERR!|TS\d{4}|expected/.test(l));
  const pick = err.length ? err : lines;
  return pick.slice(-MAX_LINES).join('\n');
}

const total = Date.now();
for (const name of names) {
  const r = await run(name, STEPS[name]);
  if (r.code === 0) {
    console.log(`✓ ${name} (${r.secs.toFixed(1)}s)`);
    continue;
  }
  const why = r.timedOut ? `timeout ${TIMEOUT_MS / 1000}s` : `código ${r.code}`;
  console.log(`✗ ${name} (${why}, ${r.secs.toFixed(1)}s) — log completo: ${r.logPath}`);
  console.log(tail(r.logPath));
  process.exit(1);
}
console.log(`OK ${names.length} pasos (${((Date.now() - total) / 1000).toFixed(1)}s)`);
