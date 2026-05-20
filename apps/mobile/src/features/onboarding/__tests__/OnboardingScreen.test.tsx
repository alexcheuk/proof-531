import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type React from 'react';
import { type OnboardingResult, OnboardingScreen } from '../OnboardingScreen';

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('OnboardingScreen', () => {
  it('walks intro → select → 4 entries → review → done with all lifts enabled', () => {
    const onFinish = jest.fn<void, [OnboardingResult]>();
    const { getByTestId, getByText, getAllByRole } = wrap(<OnboardingScreen onFinish={onFinish} />);

    // Intro
    const introHeader = getByTestId('intro-header');
    expect(introHeader.props.accessibilityRole).toBe('header');
    fireEvent.press(getByTestId('intro-begin'));

    // Select
    const selectHeader = getByTestId('select-header');
    expect(selectHeader.props.accessibilityRole).toBe('header');
    expect(getByTestId('lift-toggle-squat')).toBeTruthy();
    expect(getByTestId('lift-toggle-bench')).toBeTruthy();
    expect(getByTestId('lift-toggle-deadlift')).toBeTruthy();
    expect(getByTestId('lift-toggle-press')).toBeTruthy();
    fireEvent.press(getByTestId('select-next'));

    // Entry 1 of 4 — squat
    expect(getByTestId('entry-counter').props.children).toBe('step 1 of 4');
    const squatHeader = getByText('Squat');
    expect(squatHeader.props.accessibilityRole).toBe('header');
    fireEvent.press(getByTestId('entry-next'));

    // Entry 2 of 4 — bench
    expect(getByTestId('entry-counter').props.children).toBe('step 2 of 4');
    fireEvent.press(getByTestId('entry-next'));

    // Entry 3 of 4 — deadlift
    expect(getByTestId('entry-counter').props.children).toBe('step 3 of 4');
    fireEvent.press(getByTestId('entry-next'));

    // Entry 4 of 4 — press
    expect(getByTestId('entry-counter').props.children).toBe('step 4 of 4');
    fireEvent.press(getByTestId('entry-next'));

    // Review
    const reviewHeader = getByText('Looks good?');
    expect(reviewHeader.props.accessibilityRole).toBe('header');
    expect(getByTestId('review-row-squat')).toBeTruthy();
    expect(getByTestId('review-row-bench')).toBeTruthy();
    expect(getByTestId('review-row-deadlift')).toBeTruthy();
    expect(getByTestId('review-row-press')).toBeTruthy();
    // there should be exactly one header on the review step
    expect(getAllByRole('header').length).toBeGreaterThanOrEqual(1);

    // Done
    fireEvent.press(getByTestId('review-done'));
    expect(onFinish).toHaveBeenCalledTimes(1);
    const result = onFinish.mock.calls[0]?.[0] as OnboardingResult;
    expect(result.unit).toBe('lbs');
    expect(result.lifts).toHaveLength(4);
    // squat default 225x5 → epley = round(225 * (1 + 5/30)) = round(262.5) = 263
    //   → TM = round(263 * 0.9 / 5) * 5 = round(47.34) * 5 = 235
    const squat = result.lifts.find((l) => l.id === 'squat');
    expect(squat).toBeDefined();
    expect(squat?.trainingMax).toBe(235);
    expect(squat?.enabled).toBe(true);
    // every lift enabled
    expect(result.lifts.every((l) => l.enabled)).toBe(true);
  });

  it('toggling bench off skips bench in entry sequence but keeps it in result with enabled:false', () => {
    const onFinish = jest.fn<void, [OnboardingResult]>();
    const { getByTestId } = wrap(<OnboardingScreen onFinish={onFinish} />);

    fireEvent.press(getByTestId('intro-begin'));
    fireEvent.press(getByTestId('lift-toggle-bench')); // disable bench
    fireEvent.press(getByTestId('select-next'));

    // only 3 entries — squat, deadlift, press
    expect(getByTestId('entry-counter').props.children).toBe('step 1 of 3');
    fireEvent.press(getByTestId('entry-next'));
    expect(getByTestId('entry-counter').props.children).toBe('step 2 of 3');
    fireEvent.press(getByTestId('entry-next'));
    expect(getByTestId('entry-counter').props.children).toBe('step 3 of 3');
    fireEvent.press(getByTestId('entry-next'));

    // review
    expect(getByTestId('review-row-squat')).toBeTruthy();
    expect(getByTestId('review-row-deadlift')).toBeTruthy();
    expect(getByTestId('review-row-press')).toBeTruthy();

    fireEvent.press(getByTestId('review-done'));
    const result = onFinish.mock.calls[0]?.[0] as OnboardingResult;
    expect(result.lifts).toHaveLength(4);
    const bench = result.lifts.find((l) => l.id === 'bench');
    expect(bench).toBeDefined();
    expect(bench?.enabled).toBe(false);
    const squat = result.lifts.find((l) => l.id === 'squat');
    expect(squat?.enabled).toBe(true);
  });
});
