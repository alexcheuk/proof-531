import { render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { ThemeProvider } from '../theme';
import { LedgerSection } from './LedgerSection';

const wrap = (ui: React.ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('LedgerSection', () => {
  it('renders title and children', () => {
    const { getByText } = wrap(
      <LedgerSection title="ASSIST">
        <Text>row</Text>
      </LedgerSection>,
    );
    expect(getByText('ASSIST')).toBeTruthy();
    expect(getByText('row')).toBeTruthy();
  });

  it('renders hint when provided', () => {
    const { getByText } = wrap(
      <LedgerSection title="ASSIST" hint="WEEK 3">
        <Text>row</Text>
      </LedgerSection>,
    );
    expect(getByText('WEEK 3')).toBeTruthy();
  });

  it('does not render hint when omitted', () => {
    const { queryByText } = wrap(
      <LedgerSection title="ASSIST">
        <Text>row</Text>
      </LedgerSection>,
    );
    expect(queryByText('WEEK 3')).toBeNull();
  });

  it('container has paddingTop 24 and paddingHorizontal 24', () => {
    const { getByTestId } = wrap(
      <LedgerSection testID="sec" title="ASSIST">
        <Text>row</Text>
      </LedgerSection>,
    );
    const style = StyleSheet.flatten(getByTestId('sec').props.style);
    expect(style.paddingTop).toBe(24);
    expect(style.paddingHorizontal).toBe(24);
  });
});
