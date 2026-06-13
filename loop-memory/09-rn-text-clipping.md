---
name: rn-text-clipping
description: React Native clips text descenders when `lineHeight` is too close to `fontSize`. For display-size text containing lowercase letters with descenders (g j p q y), always set `lineHeight ≥ 1.14 × fontSize`. This bug keeps coming back; it has its own memory now.
---

# RN text clipping  - the lineHeight / fontSize ratio

## The rule

For any display-size text (≥ 24 px) on iOS or Android: **`lineHeight ≥
1.14 × fontSize`**, *especially* if the string contains lowercase
descenders (`g j p q y`). RN renders the glyph inside the lineHeight
box; when the box is shorter than the font's natural descent, the
bottom of the descender is clipped.

The PWA's Tailwind defaults look fine in the browser (`leading-[0.92]`
on a 64 px font ≈ 58.88) because the browser allows glyphs to bleed
below the line box. RN does not. You cannot port a tight `leading`
value from the PWA verbatim for any display text.

## Cases observed (and fixed)

| Site | font | lineHeight | ratio | clipped? |
|------|------|-----------|-------|----------|
| `ProgressTitleBlock` "Progress." | 56 | 52 → **64** | 0.93× → 1.14× | yes (loop-020) |
| `PickLifts` "are you training?" | 44 | 48 → **52** | 1.09× → 1.18× | suspected (loop-020) |
| `LiftPageTitle` "Squat." | 64 | 74 | 1.16× | safe  - comment in source |
| `Intro` "Get strong / slowly." | 56 | 64 | 1.14× | safe (has 'y' descender) |
| `Heading.xl` default ("In the / book") | 64 | 60 | 0.94× | currently safe only because "book" has no descender  - **next consumer with a descender will hit this** |
| `Heading.huge` default (PR cert digits) | 92 | 90 | 0.98× | safe  - digit-only consumer |

## Why we keep getting this

- The canonical Tailwind designs use ratios under 1.0×. The PWA renders
  them fine. RN renders them clipped. Designers and porters both miss
  this on review.
- The bug only fires on letters with descenders. "Squat.", "Bench.",
  "Press." render fine; "Deadlift." renders fine. "Progress." has a
  `g`; "training?" has a `g`. Test fixtures rarely use words with
  descenders.
- The clipping is subtle on simulators with default fonts but obvious
  on physical Android. Some renders are 1 px clipped  - still wrong,
  still ugly, still hard to spot on screenshot diff.

## How to audit going forward

When porting any PWA hero text to RN, check the `leading-[…]` value:

```
leading-[0.92] × 64px = 58.88   # browser-safe
                       → in RN, use lineHeight: ≥ 74 (1.16×)
```

When reviewing a PR that adds inline `style={{ fontSize: N, lineHeight:
M }}` and `M < N * 1.14`, flag it. If the text is digits-only (e.g.
`numeric` prop, RestTimer's clock, GoalPanel's value display) the rule
relaxes  - digits don't descend.

## Heading primitive defaults

The `Heading` primitive's `xl` default (size 64, lh 60) is technically
unsafe  - the only consumer today (`SessionCompleteTitle`'s "In the /
book") just happens to use a descender-free word. Bumping the default
to 74 would shift the two-line stacking of "In the / book" upward by
14 px in aggregate, which is a real visual change; it was not done
in loop-020 because the user's complaint was specifically about
`ProgressTitleBlock`. If a future consumer adds a descender to a
`size="xl"` heading and hits this bug, the right fix is to bump the
default and update the SessionCompleteTitle layout to compensate.
