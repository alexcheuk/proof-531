import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type React from 'react';
import { LibraryScreen } from '../LibraryScreen';
import { LIBRARY } from '../library-data';

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('LibraryScreen', () => {
  it('renders the Library title', () => {
    const { getByText } = wrap(<LibraryScreen />);
    expect(getByText('Library')).toBeTruthy();
  });

  it('renders all four category section headers in order', () => {
    const { getByTestId } = wrap(<LibraryScreen />);
    expect(getByTestId('library-section-push')).toBeTruthy();
    expect(getByTestId('library-section-pull')).toBeTruthy();
    expect(getByTestId('library-section-legs')).toBeTruthy();
    expect(getByTestId('library-section-core')).toBeTruthy();
  });

  it('renders at least one named item from each category', () => {
    const { getByText } = wrap(<LibraryScreen />);
    expect(getByText('Dips')).toBeTruthy();
    expect(getByText('Chin-ups')).toBeTruthy();
    expect(getByText('Lunges')).toBeTruthy();
    expect(getByText('Plank')).toBeTruthy();
  });

  it('renders one item testID for every LIBRARY entry', () => {
    const { getAllByTestId } = wrap(<LibraryScreen />);
    expect(getAllByTestId(/^library-item-/)).toHaveLength(LIBRARY.length);
  });
});
