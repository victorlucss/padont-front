import PropTypes from 'prop-types';

import { InputStyled } from './styles';

const Input = ({ placeholder }) => {

  return <InputStyled placeholder={placeholder} />
};

Input.propTypes = {
  placeholder: PropTypes.string
};

export { Input }