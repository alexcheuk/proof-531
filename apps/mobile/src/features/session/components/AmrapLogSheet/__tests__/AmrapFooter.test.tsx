import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { AmrapFooter } from '../AmrapFooter';

const renderFooter = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('AmrapFooter', () => {
  it('renders Cancel + Save buttons', () => {
    const screen = renderFooter(
      <AmrapFooter pending={false} onCancel={() => {}} onSave={() => {}} />,
    );
    expect(screen.getByTestId('amrap-cancel')).toBeTruthy();
    expect(screen.getByTestId('amrap-save')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('fires onCancel when the cancel button is pressed', () => {
    const onCancel = jest.fn();
    const screen = renderFooter(
      <AmrapFooter pending={false} onCancel={onCancel} onSave={() => {}} />,
    );
    fireEvent.press(screen.getByTestId('amrap-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('fires onSave when the save button is pressed', () => {
    const onSave = jest.fn();
    const screen = renderFooter(
      <AmrapFooter pending={false} onCancel={() => {}} onSave={onSave} />,
    );
    fireEvent.press(screen.getByTestId('amrap-save'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons while pending', () => {
    const onCancel = jest.fn();
    const onSave = jest.fn();
    const screen = renderFooter(<AmrapFooter pending onCancel={onCancel} onSave={onSave} />);
    fireEvent.press(screen.getByTestId('amrap-cancel'));
    fireEvent.press(screen.getByTestId('amrap-save'));
    expect(onCancel).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });
});
