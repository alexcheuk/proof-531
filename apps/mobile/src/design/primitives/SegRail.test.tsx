import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { ThemeProvider } from '../theme';
import { SegRail } from './SegRail';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

type Choice = 'a' | 'b' | 'c';

const baseOptions: ReadonlyArray<{ value: Choice; label: string; disabled?: boolean }> = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
  { value: 'c', label: 'Charlie', disabled: true },
];

describe('SegRail', () => {
  beforeEach(() => {
    (Haptics.selectionAsync as jest.Mock).mockClear();
    (Haptics.impactAsync as jest.Mock).mockClear();
  });

  it('renders all option labels', () => {
    const { getByText } = renderWithTheme(
      <SegRail<Choice> value="a" options={baseOptions} onChange={() => {}} testID="seg" />,
    );
    expect(getByText('Alpha')).toBeTruthy();
    expect(getByText('Bravo')).toBeTruthy();
    expect(getByText('Charlie')).toBeTruthy();
  });

  it('calls onChange with the pressed value when an unselected segment is pressed', () => {
    const onChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <SegRail<Choice> value="a" options={baseOptions} onChange={onChange} testID="seg" />,
    );
    fireEvent.press(getByTestId('seg-b'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('fires Haptics.selectionAsync exactly once on segment change', () => {
    const { getByTestId } = renderWithTheme(
      <SegRail<Choice> value="a" options={baseOptions} onChange={() => {}} testID="seg" />,
    );
    fireEvent.press(getByTestId('seg-b'));
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('does not call onChange or selectionAsync when the currently selected segment is pressed', () => {
    const onChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <SegRail<Choice> value="a" options={baseOptions} onChange={onChange} testID="seg" />,
    );
    fireEvent.press(getByTestId('seg-a'));
    expect(onChange).not.toHaveBeenCalled();
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
  });

  it('does not call onChange or selectionAsync when a disabled segment is pressed', () => {
    const onChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <SegRail<Choice> value="a" options={baseOptions} onChange={onChange} testID="seg" />,
    );
    fireEvent.press(getByTestId('seg-c'));
    expect(onChange).not.toHaveBeenCalled();
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
  });

  it('reports accessibilityState.selected on the active segment and disabled on the disabled segment', () => {
    const { getByTestId } = renderWithTheme(
      <SegRail<Choice> value="a" options={baseOptions} onChange={() => {}} testID="seg" />,
    );
    expect(getByTestId('seg-a').props.accessibilityState).toEqual({
      selected: true,
      disabled: false,
    });
    expect(getByTestId('seg-b').props.accessibilityState).toEqual({
      selected: false,
      disabled: false,
    });
    expect(getByTestId('seg-c').props.accessibilityState).toEqual({
      selected: false,
      disabled: true,
    });
  });
});
