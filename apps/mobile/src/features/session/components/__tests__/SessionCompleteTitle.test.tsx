import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SessionCompleteTitle } from '../SessionCompleteTitle';

const renderTitle = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const BASE = {
  completedThisCycle: 2,
  eyebrowDate: 'FRI · MAY 24',
  weekday: 'FRI',
  dateLine: 'MAY 24',
  year: '2026',
  liftLower: 'squat',
  week: 1 as const,
};

describe('SessionCompleteTitle', () => {
  it('renders the Session N · date eyebrow', () => {
    const screen = renderTitle(<SessionCompleteTitle {...BASE} showCertificate={false} />);
    expect(screen.getByText('Session № 02 · FRI · MAY 24')).toBeTruthy();
  });

  it('renders the "In the book." headline + DateStamp', () => {
    const screen = renderTitle(<SessionCompleteTitle {...BASE} showCertificate={false} />);
    expect(screen.getByTestId('session-complete-title')).toBeTruthy();
    expect(screen.getByTestId('session-complete-stamp')).toBeTruthy();
  });

  it('renders the standard subtext on a non-PR session', () => {
    const screen = renderTitle(<SessionCompleteTitle {...BASE} showCertificate={false} />);
    expect(
      screen.getByText(/squat day, week 1\. work done, weight moved, page turned\./),
    ).toBeTruthy();
  });

  it('renders the PR subtext + applies the NEW RECORD arc when showCertificate', () => {
    const screen = renderTitle(<SessionCompleteTitle {...BASE} showCertificate />);
    expect(screen.getByText('★  NEW RECORD  ★')).toBeTruthy();
    expect(screen.getByText(/a new estimated 1RM on the squat/)).toBeTruthy();
  });

  it('zero-pads the session number in the eyebrow', () => {
    const screen = renderTitle(
      <SessionCompleteTitle {...BASE} completedThisCycle={11} showCertificate={false} />,
    );
    expect(screen.getByText(/Session № 11 ·/)).toBeTruthy();
  });
});
