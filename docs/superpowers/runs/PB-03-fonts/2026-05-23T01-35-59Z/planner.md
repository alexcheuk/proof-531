# Plan for PB-03-fonts: Bundle IBM Plex Sans + Mono + Sans Condensed via expo-font

## Approach
Config/scaffold task: pull 12 IBM Plex TTFs, write a thin useAppFonts shim, gate _layout on font load. No TDD (no testable logic in a useFonts wrapper). Verification: file presence, typecheck, lint, expo export (Metro bundle).

Hook signature: `useAppFonts(): { fontsLoaded: boolean; fontError: Error | null }`.
Font map keys are weighted PostScript names (e.g. `IBMPlexSans-Bold`).
Splash: `SplashScreen.preventAutoHideAsync()` at module top, `hideAsync()` in effect when loaded/error.
Delete stale JetBrainsMono + SpaceGrotesk TTFs (zero references, dead code).
Leave `#0B0C0E` in _layout.tsx (out of scope).

## Files
- Create 12 TTFs in apps/mobile/assets/fonts/ (IBM Plex Sans/Mono/Sans-Condensed × Regular/Medium/SemiBold/Bold)
- Create apps/mobile/src/design/fonts.ts
- Modify apps/mobile/src/app/_layout.tsx
- Delete 8 stale TTFs (JetBrains Mono + Space Grotesk)

## Steps

### 1. Download 12 TTFs
For each, try IBM canonical URL first, fallback to Google Fonts mirror:
- IBM: `https://github.com/IBM/plex/raw/master/IBM-Plex-Sans/fonts/complete/ttf/IBMPlexSans-Regular.ttf` (and equivalents)
- Fallback: `https://github.com/google/fonts/raw/main/ofl/ibmplexsans/IBMPlexSans-Regular.ttf` (and equivalents under `ibmplexmono`, `ibmplexsanscondensed`)

Use `curl -fL --retry 2 --max-time 30 -o <name>.ttf <url>`. After each, `test -s <file>`. If BOTH primary and fallback fail for the same file, halt with `IMPLEMENTER_HALT: <step> BLOCKED: unable to fetch <filename>`.

### 2. Delete stale TTFs
`rm apps/mobile/assets/fonts/{JetBrainsMono,SpaceGrotesk}-{Regular,Medium,SemiBold,Bold}.ttf`

### 3. Create apps/mobile/src/design/fonts.ts:
```ts
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

void SplashScreen.preventAutoHideAsync();

const fontMap = {
  'IBMPlexSans-Regular': require('@/assets/fonts/IBMPlexSans-Regular.ttf'),
  'IBMPlexSans-Medium': require('@/assets/fonts/IBMPlexSans-Medium.ttf'),
  'IBMPlexSans-SemiBold': require('@/assets/fonts/IBMPlexSans-SemiBold.ttf'),
  'IBMPlexSans-Bold': require('@/assets/fonts/IBMPlexSans-Bold.ttf'),
  'IBMPlexMono-Regular': require('@/assets/fonts/IBMPlexMono-Regular.ttf'),
  'IBMPlexMono-Medium': require('@/assets/fonts/IBMPlexMono-Medium.ttf'),
  'IBMPlexMono-SemiBold': require('@/assets/fonts/IBMPlexMono-SemiBold.ttf'),
  'IBMPlexMono-Bold': require('@/assets/fonts/IBMPlexMono-Bold.ttf'),
  'IBMPlexSansCondensed-Regular': require('@/assets/fonts/IBMPlexSansCondensed-Regular.ttf'),
  'IBMPlexSansCondensed-Medium': require('@/assets/fonts/IBMPlexSansCondensed-Medium.ttf'),
  'IBMPlexSansCondensed-SemiBold': require('@/assets/fonts/IBMPlexSansCondensed-SemiBold.ttf'),
  'IBMPlexSansCondensed-Bold': require('@/assets/fonts/IBMPlexSansCondensed-Bold.ttf'),
};

export function useAppFonts(): {
  fontsLoaded: boolean;
  fontError: Error | null;
} {
  const [fontsLoaded, fontError] = useFonts(fontMap);
  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);
  return { fontsLoaded, fontError };
}
```

If Biome forbids `require`, switch to ES `import` form for assets:
```ts
import IBMPlexSansRegular from '@/assets/fonts/IBMPlexSans-Regular.ttf';
// ...
const fontMap = { 'IBMPlexSans-Regular': IBMPlexSansRegular, ... };
```

### 4. Modify apps/mobile/src/app/_layout.tsx:
```tsx
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppFonts } from '@/design/fonts';

export default function RootLayout() {
  const { fontsLoaded, fontError } = useAppFonts();
  if (!fontsLoaded && !fontError) {
    return null;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0B0C0E' }}>
      <Slot />
    </GestureHandlerRootView>
  );
}
```

### 5–8. Verification sweep
```bash
pnpm --filter @proof-531/mobile typecheck   # exit 0
pnpm --filter @proof-531/mobile lint        # exit 0
pnpm --filter @proof-531/mobile test        # exit 0
pnpm --filter @proof-531/mobile exec expo export --platform ios --output-dir /tmp/expo-bundle-check-pb03 --dump-sourcemap=false --dump-assetmap=false   # exit 0
```

### 9. Commit
Stage 12 new TTFs + 8 deletions + fonts.ts + _layout.tsx. Commit: `feat(PB-03-fonts): bundle IBM Plex TTFs and gate _layout on font load`.
