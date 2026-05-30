import { ThemeProvider } from '@/design/theme';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Share } from 'react-native';
import { SharePrPill, buildPrShareMessage } from '../SharePrPill';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

import * as Sharing from 'expo-sharing';

describe('buildPrShareMessage', () => {
  it('formats lift / e1RM / delta into a single multi-line string', () => {
    const msg = buildPrShareMessage({
      liftLabel: 'squat',
      e1RM: 247,
      delta: 12,
      unit: 'lb',
    });
    expect(msg).toContain('★ NEW RECORD ★');
    expect(msg).toContain('squat · 247 lb estimated 1RM');
    expect(msg).toContain('+12 lb stronger');
    expect(msg).toContain('531 Strength');
  });

  it('uses the kg glyph when unit is kg', () => {
    const msg = buildPrShareMessage({
      liftLabel: 'press',
      e1RM: 100,
      delta: 5,
      unit: 'kg',
    });
    expect(msg).toContain('press · 100 kg estimated 1RM');
    expect(msg).toContain('+5 kg stronger');
  });

  it('omits the stronger line when delta is 0', () => {
    const msg = buildPrShareMessage({
      liftLabel: 'bench',
      e1RM: 280,
      delta: 0,
      unit: 'lb',
    });
    expect(msg).toContain('★ NEW RECORD ★');
    expect(msg).toContain('bench · 280 lb estimated 1RM');
    expect(msg).not.toContain('stronger');
    expect(msg).toContain('531 Strength');
  });
});

describe('SharePrPill', () => {
  beforeEach(() => {
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' } as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('falls back to Share.share (text) when no capture callback is provided', async () => {
    const screen = render(
      <ThemeProvider>
        <SharePrPill message="hello" />
      </ThemeProvider>,
    );
    fireEvent.press(screen.getByTestId('session-complete-share-pr'));
    await waitFor(() => {
      expect(Share.share).toHaveBeenCalledWith({ message: 'hello' });
    });
  });

  it('calls expo-sharing with the captured URI when capture succeeds', async () => {
    const captureUri = 'file:///tmp/cert.png';
    const onCaptureCertificate = jest.fn().mockResolvedValue(captureUri);

    const screen = render(
      <ThemeProvider>
        <SharePrPill message="hello" onCaptureCertificate={onCaptureCertificate} />
      </ThemeProvider>,
    );
    fireEvent.press(screen.getByTestId('session-complete-share-pr'));
    await waitFor(() => {
      expect(onCaptureCertificate).toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        captureUri,
        expect.objectContaining({ dialogTitle: expect.any(String) }),
      );
      expect(Share.share).not.toHaveBeenCalled();
    });
  });

  it('falls back to Share.share when capture returns null', async () => {
    const onCaptureCertificate = jest.fn().mockResolvedValue(null);

    const screen = render(
      <ThemeProvider>
        <SharePrPill message="fallback text" onCaptureCertificate={onCaptureCertificate} />
      </ThemeProvider>,
    );
    fireEvent.press(screen.getByTestId('session-complete-share-pr'));
    await waitFor(() => {
      expect(Share.share).toHaveBeenCalledWith({ message: 'fallback text' });
    });
  });

  it('falls back to Share.share when expo-sharing is unavailable', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);
    const onCaptureCertificate = jest.fn().mockResolvedValue('file:///tmp/cert.png');

    const screen = render(
      <ThemeProvider>
        <SharePrPill message="fallback" onCaptureCertificate={onCaptureCertificate} />
      </ThemeProvider>,
    );
    fireEvent.press(screen.getByTestId('session-complete-share-pr'));
    await waitFor(() => {
      expect(Share.share).toHaveBeenCalledWith({ message: 'fallback' });
    });
  });
});
