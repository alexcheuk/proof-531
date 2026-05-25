import { Row } from '@/design/primitives/Row';
import { PaperCapsText } from './PaperCapsText';
import { PAPER_28 } from './paperTints';

export type SignOffRowProps = {
  liftLabel: string;
};

/** "On the squat — filed · 531 · ledger" sign-off bar at the bottom. */
export function SignOffRow({ liftLabel }: SignOffRowProps) {
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
      <PaperCapsText variant="label">{`On the ${liftLabel}`}</PaperCapsText>
      <PaperCapsText variant="label">filed · 531 · ledger</PaperCapsText>
    </Row>
  );
}
