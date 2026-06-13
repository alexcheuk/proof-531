/**
 * Cross-unit rendering integration test for LiftPage.
 *
 * Asserts the PWA-canonical pattern (`snapWeight(tm * pct, storageUnit)` →
 * `displayWeight(stored, storage, display)`) when storage and display
 * disagree. A TM written in lbs, with `displayUnit='kg'`, must render the
 * top-set weight on the kg plate grid  -  never the raw storage value with
 * a kg glyph.
 */
import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View: RN.View, Text: RN.Text, ScrollView: RN.ScrollView },
    LinearTransition: { duration: () => ({}) },
    FadeIn: { duration: () => ({}) },
    FadeOut: { duration: () => ({}) },
  };
});

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('@/data/queries/useLastCompletedSessionForLift', () => ({
  useLastCompletedSessionForLift: () => ({ startedAt: null, isLoading: false }),
}));

import { LiftPage } from '../components/LiftPage/LiftPage';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

type RequiredProps = Parameters<typeof LiftPage>[0];

describe('LiftPage (cross-unit rendering)', () => {
  it('renders kg-snapped top-set weight when TM is in lbs but displayUnit is kg', () => {
    // Week 1 top set is 85 % TM (see prescription(1)  -  see domain/schemes).
    // tm = 250 lb. snapWeight(250 * 0.85, 'lbs') = snapWeight(212.5, 'lbs')
    //   = Math.round(212.5/5)*5 = 43*5 = 215 lb.
    // displayWeight(215, 'lbs', 'kg') = convertAndSnap(215, 'lbs', 'kg')
    //   = round(215 * 0.45359237 / 2.5) * 2.5
    //   = round(39.009) * 2.5 = 39 * 2.5 = 97.5 kg.
    const props: RequiredProps = {
      lift: 'squat',
      week: 1,
      cycle: 2,
      storageUnit: 'lbs',
      displayUnit: 'kg',
      plateSet: 'standard',
      tm: 250,
      bestE1RM: null,
      isInProgress: false,
      onBegin: () => {},
      onResume: () => {},
    };
    const screen = wrap(<LiftPage {...props} />);

    // The TopSetBlock primitive renders the weight as text. The exact
    // marker we depend on: a `97.5` plus a `kg` glyph (displayUnit('kg')
    // === 'kg'). The unit glyph appears once for the top set and once
    // for the TM caption (`TM <tmDisplay> kg`).
    expect(screen.getByText('97.5')).toBeTruthy();
    // displayUnit('kg') === 'kg'  -  assert the glyph is present.
    const kgGlyphs = screen.getAllByText('kg');
    expect(kgGlyphs.length).toBeGreaterThanOrEqual(1);
    // TM caption  -  convertAndSnap(250 lb → kg) = round(113.398 / 2.5) * 2.5
    //   = round(45.359) * 2.5 = 45 * 2.5 = 112.5 kg.
    expect(screen.getByText(/TM\s+112\.5\s+kg/)).toBeTruthy();
    // Ensure the raw storage number 215 is not rendered as a weight  -  i.e.
    // the storage-side value never leaks to the surface (storage-snapped
    // 215 lb is the underlying snap step but should not appear in display).
    // Conservative check: no text exactly equal to '215'.
    expect(screen.queryByText('215')).toBeNull();
  });
});
