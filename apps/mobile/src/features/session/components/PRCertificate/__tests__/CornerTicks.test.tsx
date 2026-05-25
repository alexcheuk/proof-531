import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { CornerTicks } from '../CornerTicks';

describe('CornerTicks', () => {
  it('renders four corner bracket views with the supplied color', () => {
    const screen = render(
      <View>
        <CornerTicks color="#abc" />
      </View>,
    );
    const ticks = screen.UNSAFE_root.findAllByType(View);
    // 1 wrapper + 4 ticks = 5.
    expect(ticks.length).toBe(5);
    const corners = ticks.slice(1);
    for (const c of corners) {
      // Loop-018 defaults: 14×14 squares, 2px borders.
      expect(c.props.style.width).toBe(14);
      expect(c.props.style.height).toBe(14);
      expect(c.props.style.borderColor).toBe('#abc');
    }
  });

  it('honors a custom size + thickness (loop-018)', () => {
    const screen = render(
      <View>
        <CornerTicks color="#000" size={28} thickness={3} />
      </View>,
    );
    const corners = screen.UNSAFE_root.findAllByType(View).slice(1);
    expect(corners.length).toBe(4);
    for (const c of corners) {
      expect(c.props.style.width).toBe(28);
      expect(c.props.style.height).toBe(28);
    }
    // Each corner uses two of the four borderXxxWidth keys; whichever
    // are present should equal `thickness`.
    for (const c of corners) {
      const s = c.props.style;
      const widths = [
        s.borderTopWidth,
        s.borderRightWidth,
        s.borderBottomWidth,
        s.borderLeftWidth,
      ].filter((v) => v !== undefined);
      expect(widths.length).toBe(2);
      for (const w of widths) expect(w).toBe(3);
    }
  });
});
