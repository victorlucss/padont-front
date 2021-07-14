import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import 'jest-styled-components'

import Textarea from '../';

const defaultProps = {
  placeholder: "Textarea placeholder",
  value: ""
};

describe('<Textarea />', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render', () => {
    render(<Textarea />);

    const textarea = screen.getByRole("textbox");

    expect(textarea).toBeVisible();
  });

  it('should display the placeholder', () => {
    render(<Textarea {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(defaultProps.placeholder);

    expect(textarea).toBeVisible();
  });

  it('should call change function', () => {
    const onChangeFn = jest.fn();

    render(<Textarea {...defaultProps} onChange={onChangeFn} />);

    const textarea = screen.getByRole("textbox"); 
    fireEvent.change(textarea, { target: { value: "Testing text" } })

    expect(onChangeFn).toBeCalled();
  });

  it('should call change function', () => {
    const onChangeFn = jest.fn();

    render(<Textarea {...defaultProps} onChange={onChangeFn} />);

    const textarea = screen.getByRole("textbox"); 
    fireEvent.change(textarea, { target: { value: "Testing text" } })

    expect(onChangeFn).toBeCalledTimes(1);
  });

  it('should  have space bottom', () => {
    render(<Textarea {...defaultProps} spaceBottom={50} />);

    const textarea = screen.getByRole("textbox");

    expect(textarea).toHaveStyleRule('padding-bottom', '50px');
  });
});
