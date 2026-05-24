import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { Text as RNText } from 'react-native';
import { PAPER_28, PAPER_55 } from './paperTints';

export type SignOffRowProps = {
  liftLabel: string;
};

/** "On the squat — filed · 531 · ledger" sign-off bar at the bottom. */
export function SignOffRow({ liftLabel }: SignOffRowProps) {
  const { type } = useTheme();
  const labelStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 9,
    letterSpacing: 1.98,
    textTransform: 'uppercase' as const,
    color: PAPER_55,
  };
  return (
    <Row
      justify="space-between"
      align="baseline"
      style={{
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: PAPER_28,
      }}
    >
      <RNText style={labelStyle}>{`On the ${liftLabel}`}</RNText>
      <RNText style={labelStyle}>filed · 531 · ledger</RNText>
    </Row>
  );
}
