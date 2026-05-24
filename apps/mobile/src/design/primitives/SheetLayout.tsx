import { Children, Fragment, type ReactNode, isValidElement } from 'react';
import {
  Pressable,
  Text as RNText,
  ScrollView,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { Sheet } from './Sheet';

/**
 * Sheet shell primitive — wraps `Sheet` with the standard
 * `[eyebrow + title] → body → primary CTA → ghost cancel` chrome shared by
 * `TmEditSheet`, `ResetConfirmSheet`, and `UnitMigrationSheet`.
 *
 * Body content is provided as children. Pass `scroll` to wrap the body in a
 * ScrollView (used by the migration sheet's preview table). The cancel
 * button is rendered as a tertiary action below the primary CTA.
 */
export type SheetLayoutProps = {
  open: boolean;
  onDismiss: () => void;
  testID?: string;
  /** Optional snap points (default: ['50%']). */
  snapPoints?: (string | number)[];
  /** Short caps eyebrow above the title (e.g., "CONFIRM"). */
  eyebrow?: string;
  /** Main sheet title. */
  title: string;
  /** Title typography variant: `display` (26px, used by confirm sheets) or `compact` (22px, used by editors). */
  titleVariant?: 'display' | 'compact';
  /** Body content rendered between the title block and the CTAs. */
  children?: ReactNode;
  /** Wrap body content in a ScrollView (use for long previews). */
  scroll?: boolean;
  /** Primary CTA — typically a `<PrimaryPillButton>`. */
  primary: ReactNode;
  /** Ghost cancel button — pass `{ label, onPress, variant }`. Omit to suppress. */
  cancel?: SheetCancelProps;
  /** True while the primary action is mid-flight; disables the cancel. */
  pending?: boolean;
};

export type SheetCancelProps = {
  label: string;
  onPress: () => void;
  /** `outlined` — bordered ghost (confirm/destructive sheets). `text` — bare caps mono (editors). */
  variant?: 'outlined' | 'text';
  accessibilityLabel?: string;
  testID?: string;
};

export function SheetLayout({
  open,
  onDismiss,
  testID,
  snapPoints,
  eyebrow,
  title,
  titleVariant = 'display',
  children,
  scroll = false,
  primary,
  cancel,
  pending = false,
}: SheetLayoutProps) {
  const { colors, type, spacing } = useTheme();

  const bodyStyle: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.bg2,
    gap: titleVariant === 'compact' ? spacing.lg : spacing.md,
  };

  const eyebrowStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginBottom: 6,
  };

  const displayTitleStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 26,
    letterSpacing: -0.52,
    color: colors.ink0,
  };

  const compactTitleStyle: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    fontSize: 22,
    letterSpacing: -0.66,
    color: colors.ink0,
  };

  const titleStyle = titleVariant === 'compact' ? compactTitleStyle : displayTitleStyle;

  const body = (
    <Fragment>
      <View>
        {eyebrow ? <RNText style={eyebrowStyle}>{eyebrow}</RNText> : null}
        <RNText style={titleStyle}>{title}</RNText>
      </View>
      {renderChildren(children)}
      {primary}
      {cancel ? <SheetCancel {...cancel} pending={pending} /> : null}
    </Fragment>
  );

  return (
    <Sheet
      open={open}
      onDismiss={onDismiss}
      {...(testID !== undefined ? { testID } : {})}
      {...(snapPoints ? { snapPoints } : {})}
    >
      {scroll ? (
        <ScrollView contentContainerStyle={bodyStyle}>{body}</ScrollView>
      ) : (
        <View style={bodyStyle}>{body}</View>
      )}
    </Sheet>
  );
}

function renderChildren(children: ReactNode) {
  // Filter falsy slots so callers can use `{cond ? <X/> : null}` without
  // visible gaps from the parent flex gap.
  return Children.toArray(children).filter((c) => isValidElement(c));
}

function SheetCancel({
  label,
  onPress,
  variant = 'outlined',
  accessibilityLabel,
  testID,
  pending,
}: SheetCancelProps & { pending: boolean }) {
  const { colors, type } = useTheme();

  const outlinedStyle: ViewStyle = {
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.ink0,
    opacity: pending ? 0.5 : 1,
  };

  const outlinedLabelStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 14,
    color: colors.ink0,
  };

  const textStyle: ViewStyle = {
    paddingVertical: 16,
    alignItems: 'center',
  };

  const textLabelStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 11,
    letterSpacing: 2.42,
    textTransform: 'uppercase',
    color: pending ? colors.ink3 : colors.ink2,
  };

  const pressStyle = variant === 'text' ? textStyle : outlinedStyle;
  const labelStyle = variant === 'text' ? textLabelStyle : outlinedLabelStyle;

  return (
    <Pressable
      onPress={onPress}
      disabled={pending}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={pressStyle}
      {...(testID !== undefined ? { testID } : {})}
    >
      <RNText style={labelStyle}>{label}</RNText>
    </Pressable>
  );
}
