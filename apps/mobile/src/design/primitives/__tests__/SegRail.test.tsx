import { fireEvent, render } from '@testing-library/react-native';
import type React from 'react';
import { ThemeProvider } from '../../theme';
import { colors } from '../../tokens';
import { SegRail } from '../SegRail';

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);
const flatten = (s: unknown): Record<string, unknown> =>
  (Array.isArray(s) ? Object.assign({}, ...s) : s) as Record<string, unknown>;

describe('SegRail', () => {
  it('renders one button per option', () => {
    const { getAllByRole } = wrap(
      <SegRail
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
          { value: 'c', label: 'C' },
        ]}
        value="a"
        onChange={() => {}}
      />,
    );
    expect(getAllByRole('button')).toHaveLength(3);
  });

  it('marks active item selected with hot label and ink2 for inactive', () => {
    const { getByText } = wrap(
      <SegRail
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
        value="b"
        onChange={() => {}}
      />,
    );
    expect(flatten(getByText('B').props.style)).toEqual(
      expect.objectContaining({ color: colors.hot }),
    );
    expect(flatten(getByText('A').props.style)).toEqual(
      expect.objectContaining({ color: colors.ink2 }),
    );
  });

  it('fires onChange with option value', () => {
    const onChange = jest.fn();
    const { getByText } = wrap(
      <SegRail
        options={[
          { value: 'lbs', label: 'LBS' },
          { value: 'kg', label: 'KG' },
        ]}
        value="lbs"
        onChange={onChange}
      />,
    );
    fireEvent.press(getByText('KG'));
    expect(onChange).toHaveBeenCalledWith('kg');
  });

  it('accepts plain-string options', () => {
    const onChange = jest.fn();
    const { getByText } = wrap(<SegRail options={['lbs', 'kg']} value="lbs" onChange={onChange} />);
    fireEvent.press(getByText('kg'));
    expect(onChange).toHaveBeenCalledWith('kg');
  });
});
