import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { AdjustTmCta } from '../AdjustTmCta';

const renderCta = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('AdjustTmCta', () => {
  it('renders the label, delta sub-copy, and chevron', () => {
    const screen = renderCta(<AdjustTmCta delta={12} unitGlyph="lb" onPress={() => {}} />);
    expect(screen.getByText('Adjust training max')).toBeTruthy();
    expect(screen.getByText('e1rm jumped 12 lb — consider a bump')).toBeTruthy();
    expect(screen.getByText('›')).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    const screen = renderCta(<AdjustTmCta delta={5} unitGlyph="kg" onPress={onPress} />);
    fireEvent.press(screen.getByTestId('session-complete-adjust-tm'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders the kg unit glyph correctly', () => {
    const screen = renderCta(<AdjustTmCta delta={7} unitGlyph="kg" onPress={() => {}} />);
    expect(screen.getByText('e1rm jumped 7 kg — consider a bump')).toBeTruthy();
  });

  it('honors a custom testID', () => {
    const screen = renderCta(
      <AdjustTmCta delta={8} unitGlyph="lb" onPress={() => {}} testID="custom-cta" />,
    );
    expect(screen.getByTestId('custom-cta')).toBeTruthy();
    expect(screen.queryByTestId('session-complete-adjust-tm')).toBeNull();
  });

  it('exposes an accessible label for screen readers', () => {
    const screen = renderCta(<AdjustTmCta delta={5} unitGlyph="lb" onPress={() => {}} />);
    expect(screen.getByTestId('session-complete-adjust-tm').props.accessibilityLabel).toBe(
      'Adjust training max in settings',
    );
  });
});
