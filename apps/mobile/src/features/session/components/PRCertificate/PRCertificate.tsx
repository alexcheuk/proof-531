import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
/**
 * PR certificate — inverted-ink celebration surface for new estimated 1RMs.
 *
 * Composition shell. The panel chrome lives here; the four interior bands
 * (eyebrow + hero title, hero number row, comparison row, sign-off row) each
 * live in their own files inside this directory.
 *
 * Render gate lives in the parent (see SessionCompleteScreen). This component
 * trusts its props.
 */
import { Text as RNText, View, type ViewStyle } from 'react-native';
import { ComparisonRow } from './ComparisonRow';
import { CornerTicks } from './CornerTicks';
import { HeroNumberRow } from './HeroNumberRow';
import { SignOffRow } from './SignOffRow';
import { PAPER_65 } from './paperTints';

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
    padding: 22,
    paddingBottom: 20,
    backgroundColor: colors.ink0,
    position: 'relative',
  };

  return (
    <View
      testID={testID}
      style={panelStyle}
      accessibilityRole="summary"
      accessibilityLabel={`A new record on the ${liftLabel}: ${e1RM} ${unit} estimated 1RM, stronger by ${delta}.`}
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
          lineHeight: 72,
          letterSpacing: -2.34,
          color: colors.bg0,
          marginBottom: 14,
        }}
      >
        Stronger
        <Text variant="sans" weight="bold" size={64} color="amber" style={{ lineHeight: 74 }}>
          .
        </Text>
      </RNText>

      <HeroNumberRow e1RM={e1RM} unit={unit} {...(testID ? { testID: `${testID}-e1rm` } : {})} />
      <ComparisonRow
        prevE1RM={prevE1RM}
        delta={delta}
        unit={unit}
        {...(testID ? { testID: `${testID}-delta` } : {})}
      />
      <SignOffRow liftLabel={liftLabel} />
    </View>
  );
}
