/* eslint-disable @typescript-eslint/no-require-imports */
// Node built-ins aren't typed in this package's tsconfig (no @types/node).
// Loading via require + minimal local typings keeps this test self-contained
// and avoids touching tsconfig or workspace deps (authorized-paths constraint).
type FsModule = { readFileSync: (path: string, encoding: string) => string };
type PathModule = { join: (...parts: string[]) => string };
const { readFileSync } = require('node:fs') as FsModule;
const { join } = require('node:path') as PathModule;
declare const __dirname: string;

describe('root _layout.tsx — font wiring (P1-03-fonts)', () => {
  const layoutSource = readFileSync(join(__dirname, '..', '_layout.tsx'), 'utf8');

  const expectedKeys = [
    'SpaceGrotesk-Regular',
    'SpaceGrotesk-Medium',
    'SpaceGrotesk-SemiBold',
    'SpaceGrotesk-Bold',
    'JetBrainsMono-Regular',
    'JetBrainsMono-Medium',
    'JetBrainsMono-SemiBold',
    'JetBrainsMono-Bold',
  ];

  it('imports useFonts from expo-font', () => {
    expect(layoutSource).toMatch(/from ['"]expo-font['"]/);
    expect(layoutSource).toMatch(/useFonts/);
  });

  it.each(expectedKeys)('declares font key %s with a matching TTF require', (key) => {
    const pattern = new RegExp(`['"]${key}['"]\\s*:\\s*require\\(['"][^'"]*${key}\\.ttf['"]\\)`);
    expect(layoutSource).toMatch(pattern);
  });

  it('gates render on font load (returns null when !loaded && !error)', () => {
    expect(layoutSource).toMatch(/if\s*\(\s*!\s*loaded\s*&&\s*!\s*error\s*\)\s*\{\s*return\s+null/);
  });
});
