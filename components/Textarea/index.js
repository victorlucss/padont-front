import PropTypes from "prop-types";

import { TextareaStyled } from "./styles";

const Textarea = ({ placeholder, onChange, value = "", spaceBottom }) => {
  return (
    <TextareaStyled
      value={value}
      onChange={({ target }) => onChange(target.value)}
      placeholder={placeholder}
      spaceBottom={spaceBottom}
    />
  );
};

Textarea.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  color: PropTypes.string,
  onChange: PropTypes.func,
  spaceBottom: PropTypes.number
};

export { Textarea };
