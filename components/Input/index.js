import { useState } from "react";
import PropTypes from "prop-types";

import { InputStyled } from "./styles";

const Input = ({ placeholder, onPressEnter }) => {
  const [value, setValue] = useState("");

  return (
    <InputStyled
      value={value}
      onChange={({ target }) => setValue(target.value)}
      onKeyDown={(event) => event.key === "Enter" && onPressEnter(value)}
      placeholder={placeholder}
    />
  );
};

Input.propTypes = {
  placeholder: PropTypes.string,
  onPressEnter: PropTypes.func
};

export { Input };
