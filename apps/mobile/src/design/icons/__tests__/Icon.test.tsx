import { render } from '@testing-library/react-native';
import { ICONS, ICON_NAMES, Icon, type IconName } from '../index';

const REQUIRED: IconName[] = [
  'home',
  'dumbbell',
  'calendar',
  'history',
  'settings',
  'arrow-right',
  'plus',
  'minus',
  'check',
  'x',
];

describe('Icon registry', () => {
  it.each(REQUIRED)('contains required icon %s', (name) => {
    expect(ICONS[name]).toBeDefined();
  });

  it('exports at least 10 icons', () => {
    expect(ICON_NAMES.length).toBeGreaterThanOrEqual(10);
  });

  it.each(ICON_NAMES)('renders <Icon name="%s" /> without crashing', (name) => {
    const { toJSON } = render(<Icon name={name} />);
    expect(toJSON()).not.toBeNull();
  });
});
