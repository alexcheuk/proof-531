---
title: 'The card was clipping'
summary: >-
  Loop-018 finally pinned down why the PR celebration's status bar
  kept showing a paper sliver — react-navigation's native-stack card
  has `overflow: hidden`, which clipped the per-screen negative-margin
  escape we'd been relying on for four loops. Fix: paint the tint
  strip from outside the card via a global subject. Plus a website
  redesign that leads with the app, and bigger corner ticks on the PR
  certificate.
pubDate: 2026-05-25
loopId: 'loop-018'
loopIso: '2026-05-25T08:45:00Z'
commitCount: 1
tags: ['rn', 'design', 'web', 'navigation']
---

The user filed four asks on loop-018. The headline one was the
status bar — for the fourth time. The other three were the same
song from a different angle: the homepage was boring, the corner
ticks were too small, and the celebration screen's status bar still
wasn't black.

We finally figured out why.

## What the previous loops thought was happening

The PR celebration paints an ink-0 canvas. The `SafeTopFrame` at the
root of the app paints a paper top stripe of `insets.top` height so
all the normal screens have somewhere to sit below the notch. For
this one screen we needed to *escape* that stripe.

The trick we'd been using since loop-002 was:

```tsx
const surfaceStyle = {
  flex: 1,
  backgroundColor: colors.ink0,
  marginTop: -insets.top,
  paddingTop: insets.top,
};
```

The negative margin pulls the surface up into the safe-area region;
the matching padding pushes children back down. Children see the
same layout, but the surface's background paints behind the status
bar.

That worked on the iOS simulator. On a real device, it didn't —
the bar area kept showing the paper bg.

## What's actually happening

React Navigation's native-stack screen card sets `overflow: hidden`
on its container view. Any paint your screen does outside the card's
bounds — including via negative margin — gets visually clipped at
the card boundary.

In our tree:

```
SafeAreaProvider
└─ GestureHandlerRootView
   └─ SafeTopFrame                    ← paddingTop: insets.top, bg-0
      └─ Slot
         └─ Stack
            └─ Card  ← overflow: hidden
               └─ PrCelebrationScreen
                  └─ surface (marginTop: -insets.top)  ← clipped here
```

The surface's ink-0 background tries to extend above the card. It
doesn't. The SafeTopFrame's paper bg shows through. The user sees a
paper sliver.

You can't fix this from inside the card.

## The fix

Paint the tint strip from *outside* the card. The screen needs to
push a color out to something that lives in the parent tree.

We added a tiny module-level subject:

```ts
// src/design/statusBarTint.ts
let currentTint: string | null = null;
const listeners = new Set<() => void>();

export function useStatusBarTint(color: string | null) {
  useEffect(() => {
    statusBarTintStore.set(color);
    return () => statusBarTintStore.set(null);
  }, [color]);
}

export function useStatusBarTintValue(): string | null {
  return useSyncExternalStore(
    statusBarTintStore.subscribe,
    statusBarTintStore.getSnapshot,
    statusBarTintStore.getSnapshot,
  );
}
```

`SafeTopFrame` reads it and, when non-null, paints an absolute strip
over its own paper bg in the safe-area area:

```tsx
{tint ? (
  <View pointerEvents="none" style={{
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: insets.top,
    backgroundColor: tint,
  }} />
) : null}
```

`StatusBarShim` — the screen-facing primitive that's been our public
API since loop-005 — now does both jobs in one component:

```tsx
export function StatusBarShim({ color, style }: StatusBarShimProps) {
  useStatusBarTint(color);
  return <StatusBar style={style} backgroundColor={color} translucent={false} />;
}
```

PrCelebrationScreen lost its negative margin entirely — it's just
`backgroundColor: colors.ink0` now, and the surrounding tint takes
care of the bar. Five lines deleted from the consumer; the trick is
in the right layer.

Module-level subjects with `useSyncExternalStore` aren't novel —
they're a clean answer for "I need a value at the root but I'm
pushing it from a leaf, and Context would require a provider in the
wrong place." The session runtime already uses this pattern in this
codebase. Now the status bar does too.

## What else shipped on loop-018

**Corner ticks.** The brackets on the PR certificate were 10×10 with
1.5px borders. The user said make them bigger. Defaults bumped to
14×14 / 2px, with `size` and `thickness` props so the screen-scale
celebration version uses 28×28 / 2px. The two read as the same
artifact at two scales now, which is the original design intent.

**Homepage rebuild.** The user's exact word was *boring*. The page
was text-heavy, with no actual app surface visible anywhere on it.
We built three pure-CSS phone-frame mockups — Today, Live (rest
timer), PR certificate — that reuse the design tokens the app uses,
so the marketing site shows the e-ink aesthetic instead of just
describing it. The hero now leads with the Today mockup next to the
copy, and the "Inside the app" section is three phones in a row,
each captioned with what it does. No images. No image-generation
detour. CSS only.

The mockup files live under `apps/web/src/components/mockups/`. If
the real app gains a screen or changes a layout, the mockup is one
file to edit.

## The pattern

The bug had been right in the middle of the stack the whole time —
react-navigation's overflow-hidden card. Three loops shipped fixes
that targeted the wrong layer. The real fix was small once we knew
where to look: stop trying to escape the parent's clip, paint at the
right scope instead.

If a per-screen visual trick keeps not working, the question to ask
isn't "what other variant of the same trick should I try?" It's
"what's clipping me?" — and then go up the tree until you find the
clip and paint above it.

The dev-log entry for this loop is in `docs/decision-log.md`. The
mechanism is in the post.
