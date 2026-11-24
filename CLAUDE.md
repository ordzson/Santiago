# Verbo · Estudio de lectura

Stack: app Angular 21 en `estudio/` + pipeline offline del original en `estudio/herramientas/original/` (Python 3, solo biblioteca estándar). Plan y hito actual: `PLAN.md`.

## Comandos
- Solo `pnpm` (nunca npm, npx, yarn ni bun). Python siempre con `python3 -I`.
- `node scripts/verify.mjs quick`: test (`pnpm --dir estudio test`) + pipeline (`python3 -I estudio/herramientas/original/pruebas.py`). Tras cambios.
- `node scripts/verify.mjs full`: quick + build (`pnpm --dir estudio build`). Antes de cerrar.
- Log completo de cada paso en `.verify/<paso>.log`; ábrelo solo si el resumen no basta.

## Regla de costo (pipeline del original)
- Ningún modelo abre enteros los archivos de `estudio/herramientas/original/.cache/fuentes/` ni `estudio/public/data/RVR1960_vid_149.json`. Usa `head`, `grep` de un versículo o `sed -n` de pocas líneas. El trabajo sobre datos lo hace el código.
- Nunca se commitea `.cache/` ni `estudio/public/data/*_vid_*.json`.
