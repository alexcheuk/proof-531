## Summary

<!-- What does this change do? 1–3 bullet points. Lead with the user-visible change, not the implementation detail. -->

-

## Test plan

<!-- How did you verify this works? For mobile changes, describe what you tapped through on a real device or emulator. -->

- [ ] `pnpm verify` passes locally (typecheck + lint + boundaries + test + Metro bundle + web build)
- [ ] Manual smoke-test on Android (or iOS if applicable)

## Checklist

- [ ] Follows the [boundary rules](docs/ARCHITECTURE.md#boundary-rules): no hex in features, no React in domain, no Drizzle outside data, one-way imports
- [ ] New design primitives use tokens from `src/design/tokens.ts`, not inline hex/px
- [ ] Tests added or updated for any domain logic changes (TDD, property-tested via fast-check where applicable)
- [ ] No color emoji in user-visible app text (e-ink monochrome aesthetic)
- [ ] Decision log updated if this is a notable architectural or process change ([docs/decision-log.md](docs/decision-log.md))
