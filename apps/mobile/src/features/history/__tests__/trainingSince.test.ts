import { formatTrainingSince } from '../trainingSince';

describe('formatTrainingSince', () => {
  it('formats January correctly', () => {
    expect(formatTrainingSince(new Date(2026, 0, 1))).toBe('Jan 2026');
  });

  it('formats December correctly', () => {
    expect(formatTrainingSince(new Date(2025, 11, 31))).toBe('Dec 2025');
  });

  it('formats mid-year month correctly', () => {
    expect(formatTrainingSince(new Date(2024, 5, 15))).toBe('Jun 2024');
  });

  it('includes the full 4-digit year', () => {
    expect(formatTrainingSince(new Date(2030, 2, 1))).toBe('Mar 2030');
  });

  it('covers all 12 months', () => {
    const expected = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    expected.forEach((mon, i) => {
      expect(formatTrainingSince(new Date(2026, i, 1))).toBe(`${mon} 2026`);
    });
  });
});
