import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { LiveCtaButton } from '../LiveCtaButton';

const renderCta = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const handlers = {
  onAdvanceFromRest: jest.fn(),
  onOpenAmrapSheet: jest.fn(),
  onLogWorkingSet: jest.fn(),
};

beforeEach(() => {
  handlers.onAdvanceFromRest.mockClear();
  handlers.onOpenAmrapSheet.mockClear();
  handlers.onLogWorkingSet.mockClear();
});

describe('LiveCtaButton', () => {
  it('rest + not-last set → "Next set"', () => {
    const screen = renderCta(
      <LiveCtaButton phase="rest" setIndex={0} isAmrap={false} {...handlers} />,
    );
    expect(screen.getByText('Next set')).toBeTruthy();
    fireEvent.press(screen.getByTestId('cta-advance-rest'));
    expect(handlers.onAdvanceFromRest).toHaveBeenCalledTimes(1);
  });

  it('rest + last set → "Complete session"', () => {
    const screen = renderCta(
      <LiveCtaButton phase="rest" setIndex={2} isAmrap={false} {...handlers} />,
    );
    expect(screen.getByText('Complete session')).toBeTruthy();
  });

  it('set + AMRAP → "Log AMRAP"', () => {
    const screen = renderCta(<LiveCtaButton phase="set" setIndex={2} isAmrap {...handlers} />);
    expect(screen.getByText('Log AMRAP')).toBeTruthy();
    fireEvent.press(screen.getByTestId('cta-log-amrap'));
    expect(handlers.onOpenAmrapSheet).toHaveBeenCalledTimes(1);
  });

  it('set + working → "Set complete"', () => {
    const screen = renderCta(
      <LiveCtaButton phase="set" setIndex={0} isAmrap={false} {...handlers} />,
    );
    expect(screen.getByText('Set complete')).toBeTruthy();
    fireEvent.press(screen.getByTestId('cta-log-working'));
    expect(handlers.onLogWorkingSet).toHaveBeenCalledTimes(1);
  });

  it('cancel-confirm phase still renders the set CTA (popped-out source)', () => {
    const screen = renderCta(
      <LiveCtaButton phase="cancel-confirm" setIndex={0} isAmrap={false} {...handlers} />,
    );
    expect(screen.getByText('Set complete')).toBeTruthy();
  });

  it('renders null on an unrecognised phase', () => {
    // @ts-expect-error narrowing — passing a phase the union doesn't cover
    const screen = renderCta(
      <LiveCtaButton phase="bogus" setIndex={0} isAmrap={false} {...handlers} />,
    );
    expect(screen.queryByTestId('cta-log-working')).toBeNull();
    expect(screen.queryByTestId('cta-log-amrap')).toBeNull();
    expect(screen.queryByTestId('cta-advance-rest')).toBeNull();
  });
});
