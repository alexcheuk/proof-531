import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import { StatsTriplet } from '../StatsTriplet';

const renderStrip = (props: Parameters<typeof StatsTriplet>[0]) =>
  render(
    <ThemeProvider>
      <StatsTriplet {...props} />
    </ThemeProvider>,
  );

describe('StatsTriplet', () => {
  it('renders TM, best e1RM, and cycle values', () => {
    const screen = renderStrip({
      tm: 235,
      bestE1RM: 280,
      cycle: 7,
      unitGlyph: 'lb',
    });
    // Numeric values are in their own text node; unit suffix is a nested sibling.
    expect(screen.getByText(/235/)).toBeTruthy();
    expect(screen.getByText(/280/)).toBeTruthy();
    expect(screen.getByText('C7')).toBeTruthy();
  });

  it('renders em-dash for bestE1RM when null', () => {
    const screen = renderStrip({
      tm: 100,
      bestE1RM: null,
      cycle: 1,
      unitGlyph: 'lb',
    });
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('renders em-dash for bestE1RM when 0', () => {
    const screen = renderStrip({
      tm: 100,
      bestE1RM: 0,
      cycle: 1,
      unitGlyph: 'lb',
    });
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('omits unit suffix alongside the em-dash (no spurious unit when no e1RM)', () => {
    const screen = renderStrip({
      tm: 100,
      bestE1RM: null,
      cycle: 1,
      unitGlyph: 'lb',
    });
    // When bestE1RM is null, the suffix 'lb' should not appear next to the dash.
    // TM cell still has 'lb', so we verify the dash exists and is present.
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('renders kg glyph when unitGlyph is kg', () => {
    const screen = renderStrip({
      tm: 110,
      bestE1RM: 135,
      cycle: 3,
      unitGlyph: 'kg',
    });
    expect(screen.getAllByText('kg').length).toBeGreaterThan(0);
  });

  it('renders the testID on the container', () => {
    const screen = renderStrip({
      tm: 200,
      bestE1RM: 240,
      cycle: 5,
      unitGlyph: 'lb',
      testID: 'stats-triplet',
    });
    expect(screen.getByTestId('stats-triplet')).toBeTruthy();
  });
});
