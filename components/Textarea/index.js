import PropTypes from 'prop-types';

import { TextareaWrapper, TextareaStyled, TextareaInfo } from './styles';

const Textarea = ({ placeholder, onChange, color }) => {

  return (
    <TextareaWrapper>
      <TextareaStyled onChange={({ target }) => onChange(target.value)} placeholder={placeholder} />
      <TextareaInfo />
    </TextareaWrapper>
  )
};

Textarea.propTypes = {
  placeholder: PropTypes.string,
  color: PropTypes.string,
  onChange: PropTypes.func
}


export { Textarea }