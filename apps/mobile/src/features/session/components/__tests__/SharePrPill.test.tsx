/**
 * Unit tests for SharePrPill + buildPrShareMessage.
 *
 * The visual pill itself is dumb — we mostly assert the message builder
 * (pure function) and that pressing the pill calls React Native's Share
 * API with the message we passed in.
 */
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import { Share } from 'react-native';
import { SharePrPill, buildPrShareMessage } from '../SharePrPill';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
}));

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
});

describe('SharePrPill', () => {
  beforeEach(() => {
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' } as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls Share.share with the supplied message on press', () => {
    const screen = render(
      <ThemeProvider>
        <SharePrPill message="hello" />
      </ThemeProvider>,
    );
    fireEvent.press(screen.getByTestId('session-complete-share-pr'));
    expect(Share.share).toHaveBeenCalledWith({ message: 'hello' });
  });
});
