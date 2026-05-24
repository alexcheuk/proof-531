/**
 * Behavior tests for the W2.4 BBB confirm fork surface.
 *
 * Asserts the visible copy ("MAIN WORK · DONE", "Boring But Big?"), the
 * derived sub-paragraph showing 5×10 at the BBB weight, and the two split
 * CTAs fire their respective callbacks. Visual fidelity (PlateBar layout,
 * spacing) is out of scope — see the per-PR screenshot pair vs. PWA.
 */
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { BbbConfirmSurface } from '../BbbConfirmSurface';

const renderWithTheme = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('BbbConfirmSurface', () => {
  const baseProps = {
    bbbWeight: 150,
    unit: 'lbs' as const,
    perSide: [45, 5, 2.5] as const,
    onConfirm: jest.fn(),
    onSkip: jest.fn(),
  };

  beforeEach(() => {
    baseProps.onConfirm.mockClear();
    baseProps.onSkip.mockClear();
  });

  it('renders the MAIN WORK · DONE eyebrow + headline', () => {
    const screen = renderWithTheme(<BbbConfirmSurface {...baseProps} />);
    expect(screen.getByText('MAIN WORK · DONE')).toBeTruthy();
    expect(screen.getByTestId('bbb-confirm-headline').props.children).toBe('Boring But Big?');
  });

  it('renders the 5 sets of 10 sub-paragraph with weight and unit', () => {
    const screen = renderWithTheme(<BbbConfirmSurface {...baseProps} />);
    const sub = screen.getByTestId('bbb-confirm-sub');
    expect(sub.props.children).toEqual([
      '5 sets of 10 at ',
      150,
      ' ',
      'lb',
      '. Optional assistance — log it if you do it.',
    ]);
  });

  it('renders kg unit glyph for kg sessions', () => {
    const screen = renderWithTheme(<BbbConfirmSurface {...baseProps} unit="kg" />);
    const sub = screen.getByTestId('bbb-confirm-sub');
    expect(sub.props.children).toContain('kg');
  });

  it('renders the PlateBar with the BBB weight', () => {
    const screen = renderWithTheme(<BbbConfirmSurface {...baseProps} />);
    expect(screen.getByTestId('bbb-confirm-plate-bar')).toBeTruthy();
  });

  it('"Logged it" tap fires onConfirm', () => {
    const screen = renderWithTheme(<BbbConfirmSurface {...baseProps} />);
    fireEvent.press(screen.getByTestId('cta-bbb-confirm'));
    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('"Skip BBB" tap fires onSkip', () => {
    const screen = renderWithTheme(<BbbConfirmSurface {...baseProps} />);
    fireEvent.press(screen.getByTestId('cta-bbb-skip'));
    expect(baseProps.onSkip).toHaveBeenCalledTimes(1);
  });
});
