import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { LiveCtaButton } from '../LiveCtaButton';

const renderCta = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const handlers = {
  onAdvanceFromRest: jest.fn(),
  onOpenAmrapSheet: jest.fn(),
  onOpenTmTestSheet: jest.fn(),
  onLogWorkingSet: jest.fn(),
};

beforeEach(() => {
  handlers.onAdvanceFromRest.mockClear();
  handlers.onOpenAmrapSheet.mockClear();
  handlers.onOpenTmTestSheet.mockClear();
  handlers.onLogWorkingSet.mockClear();
});

describe('LiveCtaButton', () => {
  it('rest + not-last set → "Next set"', () => {
    const screen = renderCta(
      <LiveCtaButton phase="rest" setIndex={0} isAmrap={false} isTmTest={false} {...handlers} />,
    );
    expect(screen.getByText('Next set')).toBeTruthy();
    fireEvent.press(screen.getByTestId('cta-advance-rest'));
    expect(handlers.onAdvanceFromRest).toHaveBeenCalledTimes(1);
  });

  it('rest + final set ahead → "Final set" (the prior "Complete session" copy was a UX bug  -  pressing it advances to set 3, not the receipt)', () => {
    const screen = renderCta(
      <LiveCtaButton phase="rest" setIndex={2} isAmrap={false} isTmTest={false} {...handlers} />,
    );
    expect(screen.getByText('Final set')).toBeTruthy();
    expect(screen.queryByText('Complete session')).toBeNull();
  });

  it('set + AMRAP → "Log AMRAP"', () => {
    const screen = renderCta(
      <LiveCtaButton phase="set" setIndex={2} isAmrap isTmTest={false} {...handlers} />,
    );
    expect(screen.getByText('Log AMRAP')).toBeTruthy();
    fireEvent.press(screen.getByTestId('cta-log-amrap'));
    expect(handlers.onOpenAmrapSheet).toHaveBeenCalledTimes(1);
  });

  it('set + working → "Set complete"', () => {
    const screen = renderCta(
      <LiveCtaButton phase="set" setIndex={0} isAmrap={false} isTmTest={false} {...handlers} />,
    );
    expect(screen.getByText('Set complete')).toBeTruthy();
    fireEvent.press(screen.getByTestId('cta-log-working'));
    expect(handlers.onLogWorkingSet).toHaveBeenCalledTimes(1);
  });

  it('set + TM test → "Log TM test"', () => {
    const screen = renderCta(
      <LiveCtaButton phase="set" setIndex={0} isAmrap={false} isTmTest {...handlers} />,
    );
    expect(screen.getByText('Log TM test')).toBeTruthy();
    fireEvent.press(screen.getByTestId('cta-log-tm-test'));
    expect(handlers.onOpenTmTestSheet).toHaveBeenCalledTimes(1);
  });

  it('tm-test-log phase still renders the TM-test CTA so a popped sheet does not erase the button', () => {
    const screen = renderCta(
      <LiveCtaButton phase="tm-test-log" setIndex={0} isAmrap={false} isTmTest {...handlers} />,
    );
    expect(screen.getByText('Log TM test')).toBeTruthy();
  });

  it('renders null on an unrecognised phase', () => {
    const screen = renderCta(
      <LiveCtaButton
        // @ts-expect-error  -  phase "bogus" is intentionally outside the union
        phase="bogus"
        setIndex={0}
        isAmrap={false}
        isTmTest={false}
        {...handlers}
      />,
    );
    expect(screen.queryByTestId('cta-log-working')).toBeNull();
    expect(screen.queryByTestId('cta-log-amrap')).toBeNull();
    expect(screen.queryByTestId('cta-log-tm-test')).toBeNull();
    expect(screen.queryByTestId('cta-advance-rest')).toBeNull();
  });
});
