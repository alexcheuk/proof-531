/**
 * Behavioral tests for the PRCertificate composition shell.
 *
 * Sub-rows (HeroNumberRow, ComparisonRow, SignOffRow) have their own
 * tests — here we cover the shell: panel chrome, eyebrow, hero word,
 * a11y label, and prop flow-through to each row.
 */
import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

// Reanimated's FadeInDown entrance — stub for jest.
jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View: RN.View, Text: RN.Text },
    FadeInDown: { duration: () => ({ springify: () => ({ damping: () => ({}) }) }) },
  };
});

import { PRCertificate } from '../PRCertificate';

const renderCert = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('PRCertificate', () => {
  it('renders the eyebrow + Stronger headline', () => {
    const screen = renderCert(
      <PRCertificate e1RM={300} prevE1RM={285} delta={15} unit="lb" liftLabel="squat" />,
    );
    expect(screen.getByText('★  A new record  ★')).toBeTruthy();
    // "Stronger by" appears in ComparisonRow too; assert at least one match.
    expect(screen.queryAllByText(/Stronger/).length).toBeGreaterThanOrEqual(1);
  });

  it('exposes a composed a11y label including the lift, e1RM, unit, and delta', () => {
    const screen = renderCert(
      <PRCertificate
        e1RM={300}
        prevE1RM={285}
        delta={15}
        unit="lb"
        liftLabel="squat"
        testID="cert"
      />,
    );
    const panel = screen.getByTestId('cert');
    expect(panel.props.accessibilityLabel).toBe(
      'A new record on the squat: 300 lb estimated 1RM, stronger by 15.',
    );
  });

  it('flows props through to HeroNumberRow + ComparisonRow + SignOffRow', () => {
    const screen = renderCert(
      <PRCertificate
        e1RM={142}
        prevE1RM={138}
        delta={4}
        unit="kg"
        liftLabel="bench"
        testID="cert"
      />,
    );
    // HeroNumberRow renders e1RM + unit + "est. 1rm" caption.
    expect(screen.getByText('142')).toBeTruthy();
    expect(screen.getByText('est. 1rm')).toBeTruthy();
    // ComparisonRow renders previous best + delta hero with sign.
    expect(screen.getByText('Previous best')).toBeTruthy();
    expect(screen.getByText(/138/)).toBeTruthy();
    expect(screen.getByTestId('cert-delta').props.children).toBe('+4');
    // SignOffRow renders the lift label.
    expect(screen.getByText('On the bench')).toBeTruthy();
  });

  it('renders the testID-suffixed sub-targets when testID is given', () => {
    const screen = renderCert(
      <PRCertificate
        e1RM={200}
        prevE1RM={190}
        delta={10}
        unit="lb"
        liftLabel="press"
        testID="cert"
      />,
    );
    expect(screen.getByTestId('cert-e1rm')).toBeTruthy();
    expect(screen.getByTestId('cert-delta')).toBeTruthy();
  });
});
