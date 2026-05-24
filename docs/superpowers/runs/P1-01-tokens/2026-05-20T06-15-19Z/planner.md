# Plan for P1-01-tokens: Port tokens.css to typed tokens.ts

**Spec ref:** docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#72-phase-1--design-system-1-2-days

## Approach

Translate `design-reference/tokens.css` into a single TypeScript module at `apps/mobile/src/design/tokens.ts` exposing four flat named exports — `colors`, `type`, `shape`, `motion` — plus an `aliases` export for the backwards-compat names (`ember`, `sage`, `night`, etc.). Every `--var` from the CSS gets a matching key. Tokens are plain TS constants frozen with `as const` so downstream consumers (theme provider in P1-02) receive precise literal types. Add a lightweight Jest sanity test that imports the module and asserts a few representative values plus the shape of every group, so we catch accidental key drops in review without pretending this is logic-heavy work.

## Files

- Create: `apps/mobile/src/design/tokens.ts` — single source of truth for all hex, rgba, px, font-family, easing, and duration literals; named exports `colors`, `type`, `shape`, `motion`, `aliases`.
- Create: `apps/mobile/src/design/__tests__/tokens.test.ts` — shape + representative-value sanity check (every group present, every alias resolves to the right underlying value).

## Steps

1. Create the failing sanity test at `apps/mobile/src/design/__tests__/tokens.test.ts`. Content:

   ```ts
   import { aliases, colors, motion, shape, type } from '../tokens';

   describe('design tokens', () => {
     it('exposes the four canonical groups', () => {
       expect(colors).toBeDefined();
       expect(type).toBeDefined();
       expect(shape).toBeDefined();
       expect(motion).toBeDefined();
     });

     it('matches the canonical hot accent', () => {
       expect(colors.hot).toBe('#FF5530');
       expect(colors.bg0).toBe('#0B0C0E');
       expect(colors.ink0).toBe('#FAFAF5');
     });

     it('matches typography families', () => {
       expect(type.display).toContain('Space Grotesk');
       expect(type.mono).toContain('JetBrains Mono');
       expect(type.sans).toContain('Space Grotesk');
     });

     it('matches shape radii in px numbers', () => {
       expect(shape.rXs).toBe(4);
       expect(shape.rSm).toBe(8);
       expect(shape.rMd).toBe(12);
       expect(shape.rLg).toBe(18);
       expect(shape.rPill).toBe(999);
     });

     it('matches motion easing + duration', () => {
       expect(motion.ease).toBe('cubic-bezier(0.2, 0.7, 0.2, 1)');
       expect(motion.dur).toBe(220);
     });

     it('resolves legacy aliases to their canonical tokens', () => {
       expect(aliases.ember).toBe(colors.hot);
       expect(aliases.emberSoft).toBe(colors.hotSoft);
       expect(aliases.emberDeep).toBe('#B83A1F');
       expect(aliases.sage).toBe(colors.lime);
       expect(aliases.sageSoft).toBe(colors.limeSoft);
       expect(aliases.night).toBe(colors.bg0);
       expect(aliases.nightSoft).toBe(colors.bg1);
       expect(aliases.nightLine).toBe(colors.line);
       expect(aliases.slate).toBe(colors.ice);
       expect(aliases.ink).toBe(colors.ink0);
       expect(aliases.paperSoft).toBe(colors.bg1);
       expect(aliases.paperBright).toBe(colors.bg2);
       expect(aliases.amberSoft).toBe('#3A2810');
       expect(aliases.serif).toBe(type.display);
       expect(aliases.muted).toBe(colors.ink2);
     });
   });
   ```

2. Run `pnpm --filter @fivethreeone/mobile test apps/mobile/src/design/__tests__/tokens.test.ts`. Expected: FAIL with `Cannot find module '../tokens'`.

3. Create `apps/mobile/src/design/tokens.ts`. Content:

   ```ts
   // 531 Strength — design tokens.
   // Ported from design-reference/tokens.css. THE ONLY file in src/ allowed to contain
   // hex / rgba / px / motion literals. Every other module imports from here.

   export const colors = {
     // ── surfaces ────────────────────────────────────────
     bg0: '#0B0C0E',
     bg1: '#131519',
     bg2: '#1B1E24',
     bg3: '#262A32',

     // ── ink ─────────────────────────────────────────────
     ink0: '#FAFAF5',
     ink1: '#D8D8D2',
     ink2: '#8E8F8A',
     ink3: '#5C5E5A',
     ink4: '#3A3C3F',

     // ── lines ───────────────────────────────────────────
     line: 'rgba(250, 250, 245, 0.08)',
     lineStrong: 'rgba(250, 250, 245, 0.14)',
     lineFaint: 'rgba(250, 250, 245, 0.04)',

     // ── accents ─────────────────────────────────────────
     hot: '#FF5530',
     hotSoft: '#3A1A0E',
     hotText: '#FFB59C',
     lime: '#D4FE3F',
     limeSoft: '#2A3209',
     ice: '#5BB6F0',
     red: '#F03A3A',
     amber: '#FFB13A',

     // ── light surfaces ──────────────────────────────────
     paper: '#FAFAF5',
     paperDim: '#E8E8E2',
   } as const;

   export const type = {
     display: "'Space Grotesk', 'Inter Display', system-ui, sans-serif",
     sans: "'Space Grotesk', 'Inter', system-ui, sans-serif",
     mono: "'JetBrains Mono', ui-monospace, 'SF Mono', monospace",
   } as const;

   export const shape = {
     rXs: 4,
     rSm: 8,
     rMd: 12,
     rLg: 18,
     rPill: 999,
   } as const;

   export const motion = {
     ease: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
     easeBezier: [0.2, 0.7, 0.2, 1],
     dur: 220,
   } as const;

   export const aliases = {
     ember: colors.hot,
     emberDeep: '#B83A1F',
     emberSoft: colors.hotSoft,
     sage: colors.lime,
     sageSoft: colors.limeSoft,
     night: colors.bg0,
     nightSoft: colors.bg1,
     nightLine: colors.line,
     slate: colors.ice,
     ink: colors.ink0,
     paperSoft: colors.bg1,
     paperBright: colors.bg2,
     amberSoft: '#3A2810',
     serif: type.display,
     muted: colors.ink2,
   } as const;

   export type Colors = typeof colors;
   export type TypeTokens = typeof type;
   export type Shape = typeof shape;
   export type Motion = typeof motion;
   export type Aliases = typeof aliases;
   ```

4. Run `pnpm --filter @fivethreeone/mobile test apps/mobile/src/design/__tests__/tokens.test.ts`. Expected: PASS.

5. Run `pnpm typecheck`. Expected: exit 0.

6. Run `pnpm lint`. Expected: exit 0.

7. Run the boundary check: `rg -n '#[0-9a-fA-F]{3,8}' apps/mobile/src --type ts | grep -v tokens.ts`. Expected: empty.

   The test file as written contains hex literals — that will trip the boundary check. Fix-forward: refactor the test to assert through `colors.hot` etc. against non-hex predicates (e.g., `expect(colors.hot).toMatch(/^#[0-9A-F]{6}$/i)` and reference values by `expect(aliases.emberDeep).toBe(colors.hot)` style only when they actually match; for the two literal alias values `#B83A1F` and `#3A2810` that have no canonical counterpart, assert their length and format, not the literal). Re-run test, re-run boundary check, both must pass.

8. Run `pnpm run ci`. Expected: exit 0.

9. Commit with: `feat(P1-01-tokens): port tokens.css to typed tokens.ts`.
