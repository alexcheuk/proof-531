import { CapsLabel } from '@/design/primitives/CapsLabel';
import { View, type ViewStyle } from 'react-native';

export type TmTableHeaderCellProps = {
  children: string;
  width?: number;
  flex?: boolean;
  right?: boolean;
};

/**
 * Header cell for the onboarding Review TM table. Caps-mono on the
 * inverted ink-0 band. Width / flex / right options mirror the cell
 * options of the rows below so the columns align.
 */
export function TmTableHeaderCell({ children, width, flex, right }: TmTableHeaderCellProps) {
  const cellStyle: ViewStyle = {
    ...(width ? { width } : {}),
    ...(flex ? { flex: 1 } : {}),
    ...(right ? { alignItems: 'flex-end' } : {}),
  };
  return (
    <View style={cellStyle}>
      <CapsLabel size="xs" weight="bold" color="bg0">
        {children}
      </CapsLabel>
    </View>
  );
}
