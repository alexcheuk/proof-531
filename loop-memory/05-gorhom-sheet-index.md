---
name: gorhom-sheet-index
description: gorhom v5 BottomSheet `index` prop is initial-only — not reactive. Use snapToIndex/close via ref to drive open/close.
---

# gorhom v5 `index` prop is initial-only

Documented at <https://gorhom.dev/react-native-bottom-sheet/props>: `index`
sets the **initial snap point**. Re-rendering with `index={-1}` does NOT
reliably close an open sheet — sometimes it does (depending on internal
animation state), sometimes the sheet visually stays open.

This bit us twice on the AmrapLogSheet's Cancel button:

- Discord 1508312977403678780 (2026-05-23) — original "Cancel doesn't
  dismiss" report. The "fix" in commit 7fbce7a guarded `handleCancel`
  against the auto-close race but didn't address the imperative-close
  gap; the cancel only worked when timing happened to land right.
- Discord 1508365310359633990 (2026-05-24) — same regression reported
  again after the SheetLayout/PR celebration commits.

## The right pattern

`src/design/primitives/Sheet.tsx` drives the BottomSheet imperatively:

```tsx
const sheetRef = useRef<BottomSheet>(null);

useEffect(() => {
  if (open) sheetRef.current?.snapToIndex(0);
  else sheetRef.current?.close();
}, [open]);

return <BottomSheet ref={sheetRef} index={-1} ... />;
```

Always `index={-1}` initially. The effect snaps/closes on every `open`
transition — deterministic, no race.

## When parent state still needs guarding

`useAmrapLogState.handleCancel` still needs `if (!open) return;` because
`onClose` fires for the natural auto-close path (Save flips phase →
`open` goes false → sheet closes → `onClose` fires `onDismiss` →
handleCancel). Without the guard, `onCancel` would clobber the
just-set `awaiting-bbb` phase. The imperative-close fix doesn't
eliminate this race; both are needed.

## How to spot it on review

If you see `index={open ? 0 : -1}` (or equivalent prop-driven snap) on
a `@gorhom/bottom-sheet` v5 component, flag it. The reliable pattern
is `index={-1}` + imperative ref.
