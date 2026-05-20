import { fireEvent, render } from '@testing-library/react-native';
import { NumberStepper } from '../NumberStepper';

describe('NumberStepper', () => {
  it('exposes role=adjustable with accessibilityValue {min,max,now}', () => {
    const { getByRole } = render(
      <NumberStepper value={20} min={0} max={100} step={5} onChange={() => {}} />,
    );
    expect(getByRole('adjustable').props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 20,
    });
  });

  it('renders the current value', () => {
    const { getByText } = render(
      <NumberStepper value={45} min={0} max={100} step={5} onChange={() => {}} />,
    );
    expect(getByText('45')).toBeTruthy();
  });

  it('increment steps by step', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <NumberStepper value={20} min={0} max={100} step={5} onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('Increment'));
    expect(onChange).toHaveBeenLastCalledWith(25);
  });

  it('decrement steps by step', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <NumberStepper value={20} min={0} max={100} step={5} onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('Decrement'));
    expect(onChange).toHaveBeenLastCalledWith(15);
  });

  it('clamps decrement at min', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <NumberStepper value={2} min={0} max={100} step={5} onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('Decrement'));
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('clamps increment at max', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <NumberStepper value={98} min={0} max={100} step={5} onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('Increment'));
    expect(onChange).toHaveBeenLastCalledWith(100);
  });

  it('renders ± buttons with role=button', () => {
    const { getAllByRole } = render(
      <NumberStepper value={10} min={0} max={50} step={1} onChange={() => {}} />,
    );
    expect(getAllByRole('button')).toHaveLength(2);
  });
});
