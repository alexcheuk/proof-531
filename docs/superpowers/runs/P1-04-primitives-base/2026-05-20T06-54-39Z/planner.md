# Plan for P1-04-primitives-base — Box, Text, Caps, Eyebrow, WeightNum

(Full plan body — see implementer prompt for substituted content.)

Key decisions:
- Box, Caps, Eyebrow, WeightNum: direct token imports (static)
- Text: useTheme() (consumes colors.hot, must respect accent override)
- Tests use @testing-library/react-native; wrap Text test in ThemeProvider
- letterSpacing computed as em*px in RN (no em unit)
- WeightNum sizes sm/md/lg = 14/22/36 (sm/md from design-reference call-sites)
- Eyebrow distinct from Caps (11/500/0.16em vs 10/600/0.18em)
- Barrel index.ts at primitives/ (allowed per design CLAUDE.md)
