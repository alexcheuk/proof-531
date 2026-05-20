// On-device Storybook is currently disabled.
//
// `apps/mobile/.storybook/storybook.requires.ts` calls `view.getStorybookUI`
// from `@storybook/react-native`, which resolves `view` to undefined on the
// installed v8 — boot-time crash. Until the storybook wiring is repaired
// (and `storybook.requires.ts` is regenerated to include the P8 stories),
// this route returns `null` so it doesn't take down the app.
//
// To re-enable: fix the `@storybook/react-native` import in
// `apps/mobile/.storybook/index.tsx`, regen `storybook.requires.ts` via
// `scripts/storybook-generate.mjs`, then restore the require call.
export default function StorybookRoute() {
  return null;
}
