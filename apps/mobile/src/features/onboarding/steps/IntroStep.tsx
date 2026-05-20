import { Eyebrow } from '@/design/primitives/Eyebrow';
import { PressButton } from '@/design/primitives/PressButton';
import { Text } from '@/design/primitives/Text';
import { colors, shape, type } from '@/design/tokens';
import { Text as RNText, View, type ViewStyle } from 'react-native';
import { OnboardingShell } from '../OnboardingShell';

export type IntroStepProps = {
  onBegin: () => void;
};

type BulletPointProps = {
  n: string;
  label: string;
  sub: string;
};

const BULLET_ROW: ViewStyle = {
  flexDirection: 'row',
  gap: shape.rMd,
  alignItems: 'flex-start',
};

const BULLET_DOT: ViewStyle = {
  width: shape.bulletDot,
  height: shape.bulletDot,
  borderRadius: shape.rPill,
  backgroundColor: colors.ink0,
  alignItems: 'center',
  justifyContent: 'center',
};

function BulletPoint({ n, label, sub }: BulletPointProps) {
  return (
    <View style={BULLET_ROW}>
      <View style={BULLET_DOT}>
        <RNText
          style={{
            fontFamily: type.mono,
            fontSize: shape.rMd,
            fontWeight: '700',
            color: colors.bg0,
          }}
        >
          {n}
        </RNText>
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="default" tone="ink0" style={{ fontWeight: '500' }}>
          {label}
        </Text>
        <Text
          tone="ink2"
          style={{
            fontFamily: type.mono,
            fontSize: shape.rMd,
            letterSpacing: shape.hairline,
            textTransform: 'uppercase',
            marginTop: shape.hairline,
          }}
        >
          {sub}
        </Text>
      </View>
    </View>
  );
}

export function IntroStep({ onBegin }: IntroStepProps) {
  return (
    <OnboardingShell
      footer={
        <PressButton size="lg" variant="ember" onPress={onBegin} testID="intro-begin">
          Begin →
        </PressButton>
      }
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Eyebrow style={{ marginBottom: shape.rMd }}>A program by Jim Wendler</Eyebrow>
        <Text variant="display" accessibilityRole="header" testID="intro-header">
          Get strong{'\n'}
          <Text variant="display" tone="hot">
            slowly.
          </Text>
        </Text>
        <Text
          tone="ink1"
          style={{
            marginTop: shape.rLg,
            maxWidth: shape.rLg * 18,
            lineHeight: shape.rLg + shape.rXs,
          }}
        >
          Four lifts. Four weeks. Small jumps every cycle. We'll calculate your training max so the
          program does the math — you just lift.
        </Text>
        <View style={{ marginTop: shape.rLg * 2, gap: shape.rMd }}>
          <BulletPoint
            n="1"
            label="Enter your four 1-rep maxes"
            sub="or use the calculator below"
          />
          <BulletPoint
            n="2"
            label="We'll set your training max to 90%"
            sub="that's your working number"
          />
          <BulletPoint n="3" label="Lift for 4 weeks, repeat" sub="add weight, every time" />
        </View>
      </View>
    </OnboardingShell>
  );
}

export default IntroStep;
