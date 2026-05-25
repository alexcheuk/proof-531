import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Belt-and-braces status-bar fill for full-bleed screens that need to
 * paint the OS status-bar area in a non-paper color (e.g. ink-0 on the
 * PR celebration).
 *
 * Two-layer pattern, both required:
 *
 * 1. `<StatusBar translucent={false} backgroundColor={color} />` — on
 *    Android `backgroundColor` is only honored when `translucent` is
 *    `false`. Without this the OS draws its own default tint over the
 *    screen.
 * 2. An absolute strip with `top: -insets.top` painted `color` — the
 *    iOS path. The screen's surface paints behind the bar via a
 *    negative-margin escape from the SafeTopFrame, but that only works
 *    inside the safe area; the strip handles the sliver above.
 *
 * `style="light" | "dark"` follows the foreground-glyph contract from
 * expo-status-bar (light glyphs on dark, dark glyphs on light).
 *
 * Documented in `loop-memory/05-gorhom-sheet-index.md` (sibling memory
 * about the gorhom prop pattern); the StatusBar gotcha is logged in
 * `loop-memory/07-status-bar-fill.md`.
 */
export type StatusBarShimProps = {
  color: string;
  style: 'light' | 'dark';
};

export function StatusBarShim({ color, style }: StatusBarShimProps) {
  const insets = useSafeAreaInsets();
  return (
    <>
      <StatusBar style={style} backgroundColor={color} translucent={false} />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -insets.top,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: color,
        }}
      />
    </>
  );
}
