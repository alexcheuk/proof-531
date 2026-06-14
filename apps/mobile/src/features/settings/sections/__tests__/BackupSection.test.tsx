import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { BackupSection } from '../BackupSection';

const renderSection = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('BackupSection', () => {
  it('renders the section title and both rows', () => {
    const screen = renderSection(<BackupSection onExport={() => {}} onOpenRestore={() => {}} />);
    expect(screen.getByText('Backup & Restore')).toBeTruthy();
    expect(screen.getByText('Export backup')).toBeTruthy();
    expect(screen.getByText('Restore backup')).toBeTruthy();
  });

  it('fires onExport when the export row is pressed', () => {
    const onExport = jest.fn();
    const screen = renderSection(<BackupSection onExport={onExport} onOpenRestore={() => {}} />);
    fireEvent.press(screen.getByTestId('export-backup-button'));
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('fires onOpenRestore when the restore row is pressed', () => {
    const onOpenRestore = jest.fn();
    const screen = renderSection(
      <BackupSection onExport={() => {}} onOpenRestore={onOpenRestore} />,
    );
    fireEvent.press(screen.getByTestId('restore-backup-button'));
    expect(onOpenRestore).toHaveBeenCalledTimes(1);
  });
});
