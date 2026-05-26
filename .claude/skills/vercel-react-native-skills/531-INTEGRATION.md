# 531 integration notes

Vendored from `vercel-labs/agent-skills/skills/react-native-skills` on 2026-05-26. Upstream is unmodified — local adaptations live here.

## Who reads this

- `rn-frontend` — consult during implementation, especially for list-performance and animation work.
- `rn-qa` — consult as an audit checklist (see "RN best-practices audit" section in `.claude/agents/rn-qa.md`).
- `rn-designer` — consult when proposing a new primitive that involves a list, animation, or platform-native control.

## How to read it

`SKILL.md` is the categorized index (rule names, priorities). `AGENTS.md` is the full compiled doc with code examples. `rules/*.md` is per-rule detail.

For audit work, walk the index by priority (CRITICAL → HIGH → MEDIUM → LOW) and only open a rule file when you have evidence the implementation might violate it.

## Local adaptations

### `ui-styling`
Upstream recommends `StyleSheet.create` *or* Nativewind. **531 uses neither directly** — components consume design tokens via primitives from `src/design/`. Treat the rule's *intent* as satisfied when a component imports from `src/design/primitives/` and the primitive itself uses `StyleSheet.create`. A raw hex/px literal outside `src/design/` is still a finding (boundary rule, enforced separately by `rn-qa`).

### `react-compiler-destructure-functions`, `react-compiler-reanimated-shared-values`
**Not applicable until React Compiler is enabled.** Expo SDK 55 ships RC as opt-in; 531 has not opted in. Skip these two rules in audits. Revisit if `babel.config.js` adds `babel-plugin-react-compiler`.

### `monorepo-native-deps-in-app`, `monorepo-single-dependency-versions`
531 is a pnpm workspace with `apps/mobile/` as the only native-RN app. Rules apply — native deps belong in `apps/mobile/package.json`, not the workspace root. Cross-package version drift is a real concern as more packages get added.

### `imports-design-system-folder`
The rule aligns with the existing `src/design/` boundary. Treat as reinforcing, not new.

### `navigation-native-navigators`
531 uses `expo-router` with `react-native-screens` enabled — native stack is the default, native tabs are configurable per route group. Audit: confirm tab groups use `Tabs` from expo-router (which uses native tabs on iOS via `react-native-screens`) and not a JS-only tab component.

## What's *not* covered upstream

- The boundary rules in `CLAUDE.md` (hex/px in `src/design/`, no React in `src/domain/`, etc.) — those are 531-specific and live in `rn-qa.md` already.
- PWA behavioral parity — also `rn-qa.md`.
- Token usage / accessibility per-spec — `rn-designer.md` enforces at spec time.

Treat vercel-react-native-skills as *the RN/Expo runtime-quality layer* and the existing 531 rules as *the architecture layer*. Both must pass.
