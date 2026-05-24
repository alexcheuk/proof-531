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
    // The fragment renders four <View>s directly under the wrapping View.
    // testing-library's UNSAFE_root traversal makes this easy.
    const ticks = screen.UNSAFE_root.findAllByType(View);
    // 1 wrapper + 4 ticks = 5.
    expect(ticks.length).toBe(5);
    // Each corner tick is 10×10 with 1.5px borders in the supplied color.
    const corners = ticks.slice(1);
    for (const c of corners) {
      expect(c.props.style.width).toBe(10);
      expect(c.props.style.height).toBe(10);
      expect(c.props.style.borderColor).toBe('#abc');
    }
  });
});
