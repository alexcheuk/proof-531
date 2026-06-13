import { useStatusBarTint } from '@/design/statusBarTint';
import { StatusBar } from 'expo-status-bar';

/**
 * Full-bleed status-bar tint for screens that want the OS status-bar
 * area painted in a non-paper color (the PR celebration's ink-0 is the
 * canonical case).
 *
 * Two effects, both required:
 *
 * 1. `<StatusBar translucent={false} backgroundColor={color} />`  -  on
 *    Android `backgroundColor` is only honored when `translucent` is
 *    `false`. Without this the OS draws its own default tint over the
 *    screen.
 * 2. `useStatusBarTint(color)`  -  pushes the color into the module
 *    subject the `SafeTopFrame` reads. The frame paints an absolute
 *    strip over its own paper bg in the safe-area area. This is the
 *    iOS path; it also works as a belt for Android.
 *
 * The previous implementation tried to paint the strip from inside
 * the consuming screen's tree, but the native-stack card has
 * `overflow: hidden`, which clipped the strip back at the card
 * boundary. The user reported "still not black" four times before we
 * pinned that down  -  see `loop-memory/07-status-bar-fill.md`.
 *
 * `style="light" | "dark"` follows the foreground-glyph contract from
 * expo-status-bar (light glyphs on dark, dark glyphs on light).
 */
export type StatusBarShimProps = {
  color: string;
  style: 'light' | 'dark';
};

export function StatusBarShim({ color, style }: StatusBarShimProps) {
  useStatusBarTint(color);
  return <StatusBar style={style} backgroundColor={color} translucent={false} />;
}
