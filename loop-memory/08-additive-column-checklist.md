---
name: additive-column-checklist
description: Checklist for adding a new column to the singleton `settings` table (or any append-only table). Forget any of the five steps and existing user installs break on next launch.
---

# Adding a column to `settings` — the five-step checklist

The mobile DB lives on the user's device. New columns must arrive
non-destructively or existing installs lose their data. The current
`runMigrations` infra handles that via `ADDITIVE_COLUMNS` (ALTER
TABLE on a missing column), but coordination across five files is
required.

When you add `<column_name>` (snake_case) / `<columnName>` (camelCase)
with default `<default_value>`:

1. **`apps/mobile/src/data/drizzle/schema.ts`** — add the column to
   the Drizzle table definition AND to `DEFAULT_SETTINGS_VALUES`.
2. **`apps/mobile/src/data/drizzle/migrations/0001_init.sql`** AND
   **`apps/mobile/src/data/drizzle/migrations/0001_init.ts`** — add
   the column to the CREATE TABLE so fresh installs get the column.
   Default value lives here (`<column_name> <TYPE> NOT NULL DEFAULT
   <default_value>`).
3. **`apps/mobile/src/data/drizzle/runMigrations.ts`** — add the
   column to BOTH `REQUIRED_SETTINGS_COLUMNS` AND `ADDITIVE_COLUMNS`.
   The ADDITIVE_COLUMNS entry is what runs on existing installs via
   `ALTER TABLE ... ADD COLUMN ... NOT NULL DEFAULT ...`.
4. **`apps/mobile/src/domain/types.ts`** — add the field to the
   `Settings` interface AND to the `DEFAULT_SETTINGS` constant.
5. **`apps/mobile/src/data/accessors/settings.ts`** — add the field
   to both `toRow()` and `fromRow()`. AND
   **`apps/mobile/src/data/accessors/onboarding.ts`** — add it to the
   existing-row spread block AND the row insert object.

Tests with hard-coded settings fixtures will fail typecheck after
step 4 — `grep -rn "restTargetSeconds:" apps/mobile/src --include
'*.test.*'` and add the new field to each.

## How it bites if you skip a step

- Skip 1: TS errors, won't compile.
- Skip 2: fresh installs are missing the column at boot — first SELECT
  fails with `no such column`.
- Skip 3: existing installs upgrade and crash on first read — the
  ALTER never runs.
- Skip 4: TS errors in consumers, won't compile.
- Skip 5: writes succeed but the new column is missing from
  payloads, so the column always reads as its default.

## Reference

Loop-007 (commit cce4632…) added `bbb_rest_target_seconds INTEGER NOT
NULL DEFAULT 90` as the worked example. Five-file diff. Caught all
the coordination at typecheck time.
