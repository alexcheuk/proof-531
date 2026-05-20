# Plan for P0-99-smoke: Orchestrator smoke test — write a no-op marker file

**Spec ref:** docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#smoke-task-p0-99

## Approach

Create a single Markdown file at `apps/mobile/SMOKE.md` with exactly two lines: an H1 header and the literal string `orchestrator smoke ok`. This is the smallest test that exercises file creation, harness verification (typecheck/lint), and review.

## Files

- Create: `apps/mobile/SMOKE.md` — smoke-test marker file

## Steps

1. Create `apps/mobile/SMOKE.md` with the content:
   ```
   # Smoke
   orchestrator smoke ok
   ```
2. Run `pnpm typecheck`. Expected: exit 0.
3. Run `pnpm lint`. Expected: exit 0 (Biome ignores .md by default).
4. Verify SMOKE.md contents match the spec.
