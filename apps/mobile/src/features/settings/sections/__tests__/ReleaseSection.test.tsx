/**
 * ReleaseSection  -  behavioral tests around the OTA visibility surface.
 *
 * Drives `useOtaStatus` directly so we exercise the four states a tester
 * cares about: embedded launch (hidden), OTA-launched (visible with id),
 * update available (tap → fetch), update pending (tap → reload).
 */
import { ThemeProvider } from '@/design/theme';
import type { OtaStatus } from '@/features/shared/useOtaStatus';
import { fireEvent, render } from '@testing-library/react-native';
import { ReleaseSection } from '../ReleaseSection';

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

jest.mock('@/features/shared/useOtaStatus', () => ({
  useOtaStatus: () => mockCurrentStatus,
}));

function renderSection() {
  return render(
    <ThemeProvider>
      <ReleaseSection />
    </ThemeProvider>,
  );
}

describe('ReleaseSection', () => {
  beforeEach(() => {
    mockCurrentStatus = mockDefaultStatus;
    mockCheckNow.mockClear();
    mockFetchNow.mockClear();
    mockApplyNow.mockClear();
  });

  it('renders nothing when launched from the embedded bundle with no channel', () => {
    const screen = renderSection();
    expect(screen.queryByText('Release')).toBeNull();
  });

  it('shows OTA source, short bundle id and channel hint when running an OTA bundle', () => {
    mockCurrentStatus = {
      ...mockDefaultStatus,
      isEmbeddedLaunch: false,
      channel: 'preview',
      updateId: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: new Date(),
    };
    const screen = renderSection();
    expect(screen.getByText('Release')).toBeTruthy();
    expect(screen.getByText('preview')).toBeTruthy();
    expect(screen.getByText('OTA')).toBeTruthy();
    expect(screen.getByText('550e8400')).toBeTruthy();
  });

  it('check row calls fetchNow when an update is available', () => {
    mockCurrentStatus = {
      ...mockDefaultStatus,
      isEmbeddedLaunch: false,
      channel: 'preview',
      updateId: 'abc12345-0000-0000-0000-000000000000',
      isUpdateAvailable: true,
    };
    const screen = renderSection();
    fireEvent.press(screen.getByTestId('release-check-row'));
    expect(mockFetchNow).toHaveBeenCalledTimes(1);
    expect(mockApplyNow).not.toHaveBeenCalled();
    expect(mockCheckNow).not.toHaveBeenCalled();
  });

  it('check row calls applyNow when an update is pending', () => {
    mockCurrentStatus = {
      ...mockDefaultStatus,
      isEmbeddedLaunch: false,
      channel: 'preview',
      updateId: 'abc12345-0000-0000-0000-000000000000',
      isUpdatePending: true,
    };
    const screen = renderSection();
    fireEvent.press(screen.getByTestId('release-check-row'));
    expect(mockApplyNow).toHaveBeenCalledTimes(1);
    expect(mockFetchNow).not.toHaveBeenCalled();
  });

  it('check row calls checkNow in the steady state (nothing pending or available)', () => {
    mockCurrentStatus = {
      ...mockDefaultStatus,
      isEmbeddedLaunch: false,
      channel: 'preview',
      updateId: 'abc12345-0000-0000-0000-000000000000',
    };
    const screen = renderSection();
    fireEvent.press(screen.getByTestId('release-check-row'));
    expect(mockCheckNow).toHaveBeenCalledTimes(1);
  });
});
