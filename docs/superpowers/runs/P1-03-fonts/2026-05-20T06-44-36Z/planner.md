# Plan for P1-03-fonts: Bundle Space Grotesk + JetBrains Mono via expo-font

(Logged separately — see implementer prompt for full content.)

Key decisions:
- 8 PostScript-keyed TTFs from expo/google-fonts GitHub repo
- useFonts in apps/mobile/src/app/_layout.tsx, return null while loading
- tokens.ts NOT modified this task (consumer rewire deferred)
- Test = file-content inspection (no RN renderer)
