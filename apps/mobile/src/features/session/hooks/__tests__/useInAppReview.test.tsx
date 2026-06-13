import { act, renderHook } from '@testing-library/react-native';
import { useInAppReview } from '../useInAppReview';

const mockMutate = jest.fn();
const mockIsAvailableAsync = jest.fn();
const mockRequestReview = jest.fn();

jest.mock('@/data/queries/useSettings', () => ({
  useSettings: jest.fn(),
}));

jest.mock('@/data/queries/useMarkReviewPrompted', () => ({
  useMarkReviewPrompted: () => ({ mutate: mockMutate }),
}));

jest.mock('expo-store-review', () => ({
  isAvailableAsync: (...args: unknown[]) => mockIsAvailableAsync(...args),
  requestReview: (...args: unknown[]) => mockRequestReview(...args),
}));

import { useSettings } from '@/data/queries/useSettings';
const mockUseSettings = useSettings as jest.Mock;

function settingsStub(reviewPromptedAt?: number) {
  return {
    isLoading: false,
    isError: false,
    data: { reviewPromptedAt },
  };
}

describe('useInAppReview', () => {
  beforeEach(() => {
    mockMutate.mockClear();
    mockIsAvailableAsync.mockClear();
    mockRequestReview.mockClear();
    mockIsAvailableAsync.mockResolvedValue(true);
    mockRequestReview.mockResolvedValue(undefined);
  });

  it('does nothing when cycle < 2', async () => {
    mockUseSettings.mockReturnValue(settingsStub());
    renderHook(() => useInAppReview({ isCycleComplete: true, cycle: 1, origin: 'live' }));
    await act(async () => {});
    expect(mockIsAvailableAsync).not.toHaveBeenCalled();
  });

  it('does nothing when cycle is complete is false', async () => {
    mockUseSettings.mockReturnValue(settingsStub());
    renderHook(() => useInAppReview({ isCycleComplete: false, cycle: 3, origin: 'live' }));
    await act(async () => {});
    expect(mockIsAvailableAsync).not.toHaveBeenCalled();
  });

  it('does nothing when already prompted (reviewPromptedAt set)', async () => {
    mockUseSettings.mockReturnValue(settingsStub(1700000000000));
    renderHook(() => useInAppReview({ isCycleComplete: true, cycle: 2, origin: 'live' }));
    await act(async () => {});
    expect(mockIsAvailableAsync).not.toHaveBeenCalled();
  });

  it('does nothing while settings are loading', async () => {
    mockUseSettings.mockReturnValue({ isLoading: true, isError: false, data: undefined });
    renderHook(() => useInAppReview({ isCycleComplete: true, cycle: 2, origin: 'live' }));
    await act(async () => {});
    expect(mockIsAvailableAsync).not.toHaveBeenCalled();
  });

  it('does nothing when origin is history (browsing past sessions)', async () => {
    mockUseSettings.mockReturnValue(settingsStub());
    renderHook(() => useInAppReview({ isCycleComplete: true, cycle: 2, origin: 'history' }));
    await act(async () => {});
    expect(mockIsAvailableAsync).not.toHaveBeenCalled();
  });

  it('requests review and marks prompted on live flow when cycle >= 2 and never prompted', async () => {
    mockUseSettings.mockReturnValue(settingsStub());
    renderHook(() => useInAppReview({ isCycleComplete: true, cycle: 2, origin: 'live' }));
    await act(async () => {});
    expect(mockIsAvailableAsync).toHaveBeenCalledTimes(1);
    expect(mockRequestReview).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('marks prompted even when review is unavailable', async () => {
    mockIsAvailableAsync.mockResolvedValue(false);
    mockUseSettings.mockReturnValue(settingsStub());
    renderHook(() => useInAppReview({ isCycleComplete: true, cycle: 3, origin: 'live' }));
    await act(async () => {});
    expect(mockIsAvailableAsync).toHaveBeenCalledTimes(1);
    expect(mockRequestReview).not.toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('fires only once even when re-rendered', async () => {
    mockUseSettings.mockReturnValue(settingsStub());
    const { rerender } = renderHook(() =>
      useInAppReview({ isCycleComplete: true, cycle: 2, origin: 'live' }),
    );
    await act(async () => {});
    rerender({});
    await act(async () => {});
    expect(mockIsAvailableAsync).toHaveBeenCalledTimes(1);
  });
});
