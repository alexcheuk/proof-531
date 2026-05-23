import { useTheme } from '@/design/theme';
/**
 * PR certificate — inverted-ink celebration surface for new estimated 1RMs.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * PRCertificate.tsx`. The PWA renders an inverted (`bg = ink-0, fg = bg-0`)
 * panel with corner ticks, a hero "Stronger." headline, the new 1RM hero
 * number row, a "previous best" struck-through comparison, and a sign-off
 * line. The same composition lifts cleanly to React Native.
 *
 * Render gate lives in the parent (see SessionCompleteScreen). This component
 * trusts its props.
 *
 * Translucent paper tints (`rgba(231,227,214,X)`) reference the RGB of
 * `bg0` at varying opacity. Same documented exception as the PWA — tokenizing
 * these in `design/tokens.ts` is a future follow-up.
 */
import { Text as RNText, View, type ViewStyle } from 'react-native';

export type PRCertificateProps = {
  /** New estimated 1RM (rounded int). */
  e1RM: number;
  /** Prior best e1RM the cert strikes through (rounded int, > 0). */
  prevE1RM: number;
  /** e1RM - prevE1RM, positive int (rounded). */
  delta: number;
  /** Unit token — `lb` or `kg`. */
  unit: 'lb' | 'kg';
  /** Lower-case lift name — `squat` / `bench` / `deadlift` / `press`. */
  liftLabel: string;
  testID?: string;
};

// Paper RGB at varied alpha — same translucent tints the PWA uses on the
// ink-0 surface so they shade the inverted background without introducing
// new color tokens. The base RGB is `bg0` (231, 227, 214).
const PAPER_28 = 'rgba(231,227,214,0.28)';
const PAPER_45 = 'rgba(231,227,214,0.45)';
const PAPER_55 = 'rgba(231,227,214,0.55)';
const PAPER_65 = 'rgba(231,227,214,0.65)';

export function PRCertificate({
  e1RM,
  prevE1RM,
  delta,
  unit,
  liftLabel,
  testID,
}: PRCertificateProps) {
  const { colors, type } = useTheme();

  const panelStyle: ViewStyle = {
    marginHorizontal: 24,
    marginTop: 24,
    paddingTop: 22,
    paddingRight: 22,
    paddingBottom: 20,
    paddingLeft: 22,
    backgroundColor: colors.ink0,
    position: 'relative',
  };

  return (
    <View
      testID={testID}
      style={panelStyle}
      accessibilityRole="summary"
      accessibilityLabel="A new record"
    >
      <CornerTicks color={colors.bg0} />

      {/* Eyebrow — ★ A NEW RECORD ★ */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 6,
          paddingRight: 16,
        }}
      >
        <RNText
          style={{
            fontFamily: `${type.mono}-Bold`,
            fontSize: 10,
            letterSpacing: 2.8,
            textTransform: 'uppercase',
            color: PAPER_65,
          }}
        >
          {'★  A new record  ★'}
        </RNText>
      </View>

      {/* Hero — Stronger. */}
      <RNText
        style={{
          fontFamily: `${type.display}-Bold`,
          fontSize: 52,
          lineHeight: 56,
          letterSpacing: -2.34,
          color: colors.bg0,
          marginBottom: 14,
        }}
      >
        Stronger.
      </RNText>

      {/* Hero number row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          paddingTop: 14,
          borderTopWidth: 1,
          borderTopColor: PAPER_28,
          gap: 12,
        }}
      >
        <RNText
          testID={testID ? `${testID}-e1rm` : undefined}
          style={{
            fontFamily: `${type.display}-Bold`,
            fontSize: 92,
            lineHeight: 90,
            color: colors.bg0,
            letterSpacing: -4.6,
          }}
        >
          {e1RM}
        </RNText>
        <View style={{ gap: 4 }}>
          <RNText
            style={{
              fontFamily: `${type.mono}-Bold`,
              fontSize: 13,
              letterSpacing: 2.6,
              textTransform: 'uppercase',
              color: colors.bg0,
            }}
          >
            {unit}
          </RNText>
          <RNText
            style={{
              fontFamily: `${type.mono}-Medium`,
              fontSize: 9,
              letterSpacing: 1.62,
              textTransform: 'uppercase',
              color: PAPER_55,
            }}
          >
            est. 1rm
          </RNText>
        </View>
      </View>

      {/* Comparison row */}
      <View
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTopWidth: 1,
          borderTopColor: PAPER_28,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 12,
        }}
      >
        <View>
          <RNText
            style={{
              fontFamily: `${type.mono}-SemiBold`,
              fontSize: 9,
              letterSpacing: 1.98,
              textTransform: 'uppercase',
              color: PAPER_55,
              marginBottom: 4,
            }}
          >
            Previous best
          </RNText>
          <RNText
            style={{
              fontFamily: `${type.display}-Medium`,
              fontSize: 22,
              color: PAPER_65,
              letterSpacing: -0.44,
              lineHeight: 22,
              textDecorationLine: 'line-through',
              textDecorationColor: PAPER_45,
            }}
          >
            {`${prevE1RM} `}
            <RNText
              style={{
                fontFamily: `${type.mono}-Medium`,
                fontSize: 10,
                letterSpacing: 1.8,
                textTransform: 'uppercase',
                color: PAPER_45,
                textDecorationLine: 'none',
              }}
            >
              {unit}
            </RNText>
          </RNText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <RNText
            style={{
              fontFamily: `${type.mono}-SemiBold`,
              fontSize: 9,
              letterSpacing: 1.98,
              textTransform: 'uppercase',
              color: PAPER_55,
              marginBottom: 4,
            }}
          >
            Stronger by
          </RNText>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              gap: 6,
            }}
          >
            <RNText
              testID={testID ? `${testID}-delta` : undefined}
              style={{
                fontFamily: `${type.display}-Bold`,
                fontSize: 32,
                lineHeight: 32,
                letterSpacing: -0.96,
                color: colors.bg0,
              }}
            >
              {`+${delta}`}
            </RNText>
            <RNText
              style={{
                fontFamily: `${type.mono}-Bold`,
                fontSize: 11,
                letterSpacing: 2.2,
                textTransform: 'uppercase',
                color: colors.bg0,
              }}
            >
              {unit}
            </RNText>
          </View>
        </View>
      </View>

      {/* Sign-off line */}
      <View
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: PAPER_28,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <RNText
          style={{
            fontFamily: `${type.mono}-SemiBold`,
            fontSize: 9,
            letterSpacing: 1.98,
            textTransform: 'uppercase',
            color: PAPER_55,
          }}
        >
          {`On the ${liftLabel}`}
        </RNText>
        <RNText
          style={{
            fontFamily: `${type.mono}-SemiBold`,
            fontSize: 9,
            letterSpacing: 1.98,
            textTransform: 'uppercase',
            color: PAPER_55,
          }}
        >
          filed · 531 · ledger
        </RNText>
      </View>
    </View>
  );
}

function CornerTicks({ color }: { color: string }) {
  const base = {
    position: 'absolute' as const,
    width: 10,
    height: 10,
    borderColor: color,
  };
  return (
    <>
      <View
        style={{
          ...base,
          top: 6,
          left: 6,
          borderTopWidth: 1.5,
          borderLeftWidth: 1.5,
        }}
      />
      <View
        style={{
          ...base,
          top: 6,
          right: 6,
          borderTopWidth: 1.5,
          borderRightWidth: 1.5,
        }}
      />
      <View
        style={{
          ...base,
          bottom: 6,
          left: 6,
          borderBottomWidth: 1.5,
          borderLeftWidth: 1.5,
        }}
      />
      <View
        style={{
          ...base,
          bottom: 6,
          right: 6,
          borderBottomWidth: 1.5,
          borderRightWidth: 1.5,
        }}
      />
    </>
  );
}
