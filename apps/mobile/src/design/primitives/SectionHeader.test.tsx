import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../theme';
import { SectionHeader } from './SectionHeader';

function renderWithTheme(node: React.ReactNode) {
  return render(<ThemeProvider>{node}</ThemeProvider>);
}

describe('SectionHeader', () => {
  it('renders eyebrow + title', () => {
    const { getByText } = renderWithTheme(<SectionHeader eyebrow="THE RECORD" title="Receipt" />);
    expect(getByText('THE RECORD')).toBeTruthy();
    expect(getByText('Receipt')).toBeTruthy();
  });

  it('omits eyebrow when not provided', () => {
    const { queryByText, getByText } = renderWithTheme(<SectionHeader title="Lone title" />);
    expect(getByText('Lone title')).toBeTruthy();
    expect(queryByText('THE RECORD')).toBeNull();
  });

  it('renders all three variants without crashing', () => {
    const { rerender, getByText } = renderWithTheme(
      <SectionHeader eyebrow="A" title="band" variant="band" />,
    );
    expect(getByText('band')).toBeTruthy();
    rerender(
      <ThemeProvider>
        <SectionHeader eyebrow="A" title="hero" variant="hero" />
      </ThemeProvider>,
    );
    expect(getByText('hero')).toBeTruthy();
    rerender(
      <ThemeProvider>
        <SectionHeader eyebrow="A" title="display" variant="display" />
      </ThemeProvider>,
    );
    expect(getByText('display')).toBeTruthy();
  });
});
