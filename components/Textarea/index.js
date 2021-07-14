import PropTypes from "prop-types";

import { TextareaStyled } from "./styles";

const Textarea = ({ placeholder, onChange, value = "", spaceBottom }) => {
  return (
    <TextareaStyled
      role="textbox"
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
  onChange: PropTypes.func,
  spaceBottom: PropTypes.number
};

export { Textarea };
export default Textarea;