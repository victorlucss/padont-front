import { cleanup, render, screen, fireEvent } from '@testing-library/react';

import Input from '..';

const defaultProps = {
  placeholder: "Input placeholder",
  onPressEnter: () => false
};

describe('<Input />', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render', () => {
    render(<Input />);

    const input = screen.getByRole("input");

    expect(input).toBeVisible();
  });

  it('should display the placeholder', () => {
    render(<Input {...defaultProps} />);

    const input = screen.getByPlaceholderText(defaultProps.placeholder);

    expect(input).toBeVisible();
  });

  it('should change value when types text', () => {
    const testingText = "Lorem ipsum";

    render(<Input {...defaultProps} />);

    const input = screen.getByRole("input");

    fireEvent.change(input, { target: { value: testingText } })

    expect(input.value).toBe(testingText);
  });

  it('should be visible when enter keydown', () => {
    render(<Input {...defaultProps} />);

    const input = screen.getByRole("input");

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(input).toBeVisible();
  });
});
