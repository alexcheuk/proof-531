import { CapsLabel } from '@/design/primitives/CapsLabel';
import { NumberStepper } from '@/design/primitives/NumberStepper';
import { Row } from '@/design/primitives/Row';
import { Sheet } from '@/design/primitives/Sheet';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
import { View, type ViewStyle } from 'react-native';
import { useTmTestLogState } from '../../hooks/useTmTestLogState';
import { LogSheetFooter } from '../LogSheetFooter';
import { TmTestBandChip } from './TmTestBandChip';
import { TmTestCaption } from './TmTestCaption';

/**
 * Bottom-sheet TM Test rep logger  -  sibling to {@link AmrapLogSheet} but
 * with distinct semantics:
 *
 *   - Stepper cap at 10 (vs AMRAP's 30)  -  the band tops out at 5, this is
 *     honest record-keeping room without making the stepper feel infinite.
 *   - Seed value is 0 (vs AMRAP's prescribedReps)  -  TM test logging is a
 *     deliberate count entry, not a near-default save.
 *   - No e1RM projection chip  -  bounded set, no max-effort.
 *   - No PR-edge haptic  -  the TM test is information, not celebration.
 *   - PASS / HOLD / RESET band chip on the right of the question line, live
 *     caption beneath the stepper.
 *
 * Composition discipline (per the Vercel design-system rules):
 *   - Two booleans at most (`open`, `pending`).
 *   - Children over render-props  -  the band chip and caption are
 *     sub-components.
 *   - State is internal (rep count, pending). No provider, no sibling
 *     cross-talk.
 */

export const TM_TEST_REPS_MAX = 10;

export type TmTestLogSheetProps = {
  open: boolean;
  lift: Lift;
  /**
   * Training Max in display units  -  drives the header weight readout. The
   * tm-test set is 100% TM, so this is the bar weight too.
   */
  tm: number;
  unit: Unit;
  onCancel: () => void;
  /**
   * Called when the user confirms a rep count. May be sync or async  -  the
   * sheet awaits the returned value so the disabled state resolves on
   * parent resolution.
   */
  onSave: (reps: number) => void | Promise<void>;
  testID?: string;
};

export function TmTestLogSheet({
  open,
  lift,
  tm,
  unit,
  onCancel,
  onSave,
  testID,
}: TmTestLogSheetProps) {
  const { spacing } = useTheme();
  const { reps, setReps, pending, handleSave, handleCancel } = useTmTestLogState({
    open,
    onSave,
    onCancel,
  });

  const bodyStyle: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  };

  return (
    <Sheet open={open} onDismiss={handleCancel} {...(testID !== undefined ? { testID } : {})}>
      <View style={bodyStyle}>
        <Row justify="space-between" align="baseline" style={{ marginBottom: spacing.md }}>
          <View>
            <CapsLabel weight="semibold">LOG TM TEST</CapsLabel>
            <Text variant="sans" weight="medium" size={24} color="ink0">
              {liftDisplayName(lift)}
            </Text>
          </View>
          <CapsLabel size="md" weight="semibold" style={{ letterSpacing: 1.8 }}>
            {`${tm} ${displayUnit(unit)}`}
          </CapsLabel>
        </Row>

        <Row justify="space-between" align="center" style={{ marginBottom: spacing.md }}>
          <CapsLabel weight="semibold" style={{ letterSpacing: 1.5 }}>
            Reps achieved at TM
          </CapsLabel>
          <TmTestBandChip reps={reps} lift={lift} unit={unit} testID="tm-test-band-chip" />
        </Row>

        <NumberStepper
          value={reps}
          onChange={setReps}
          min={0}
          max={TM_TEST_REPS_MAX}
          step={1}
          accessibilityLabelDecrement="Decrease reps"
          accessibilityLabelIncrement="Increase reps"
          testID="tm-test-reps-stepper"
        />

        <TmTestCaption reps={reps} lift={lift} unit={unit} />

        <LogSheetFooter
          pending={pending}
          onCancel={handleCancel}
          onSave={handleSave}
          cancelTestID="tm-test-cancel"
          saveTestID="tm-test-save"
          cancelA11yLabel="Cancel and close the TM test sheet"
          saveA11yLabel="Save TM test reps"
        />
      </View>
    </Sheet>
  );
}
