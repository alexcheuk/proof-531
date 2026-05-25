/**
 * Banner visibility + restart wiring. Mocks `useOtaStatus` directly — the
 * underlying expo-updates plumbing is tested by Expo itself.
 */
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import { OtaUpdateBanner } from '../OtaUpdateBanner';
import type { OtaStatus } from '../useOtaStatus';

// Names prefixed with `mock` so Jest's hoisted `jest.mock` factory can close
// over them without tripping the out-of-scope-variable guard.
const mockCheckNow = jest.fn(async () => {});
const mockFetchNow = jest.fn(async () => {});
const mockApplyNow = jest.fn(async () => {});

const mockDefaultStatus: OtaStatus = {
  updateId: null,
  createdAt: null,
  channel: null,
  runtimeVersion: null,
  isEmbeddedLaunch: true,
  isUpdateAvailable: false,
  isUpdatePending: false,
  isChecking: false,
  isDownloading: false,
  lastChecked: null,
  checkError: null,
  downloadError: null,
  checkNow: mockCheckNow,
  fetchNow: mockFetchNow,
  applyNow: mockApplyNow,
};

let mockCurrentStatus: OtaStatus = mockDefaultStatus;

jest.mock('../useOtaStatus', () => ({
  useOtaStatus: () => mockCurrentStatus,
}));

function renderBanner() {
  return render(
    <ThemeProvider>
      <OtaUpdateBanner />
    </ThemeProvider>,
  );
}

describe('OtaUpdateBanner', () => {
  beforeEach(() => {
    mockCurrentStatus = mockDefaultStatus;
    mockApplyNow.mockClear();
  });

  it('renders nothing in the steady state', () => {
    const screen = renderBanner();
    expect(screen.queryByTestId('ota-update-banner')).toBeNull();
  });

  it('shows the download label while a bundle is downloading', () => {
    mockCurrentStatus = { ...mockDefaultStatus, isDownloading: true };
    const screen = renderBanner();
    expect(screen.getByTestId('ota-update-banner')).toBeTruthy();
    expect(screen.getByText('DOWNLOADING UPDATE…')).toBeTruthy();
    expect(screen.queryByTestId('ota-update-banner-restart')).toBeNull();
  });

  it('shows the restart pill when an update is pending and calls reloadAsync on press', () => {
    mockCurrentStatus = { ...mockDefaultStatus, isUpdatePending: true };
    const screen = renderBanner();
    expect(screen.getByText('UPDATE READY')).toBeTruthy();
    fireEvent.press(screen.getByTestId('ota-update-banner-restart'));
    expect(mockApplyNow).toHaveBeenCalledTimes(1);
  });
});
