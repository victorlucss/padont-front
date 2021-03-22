import PropTypes from 'prop-types';

import { TextareaWrapper, TextareaStyled, TextareaInfo } from './styles';

const Textarea = ({ placeholder, onChange, value = '' }) => {

  return (
    <TextareaWrapper>
      <TextareaStyled value={value} onChange={({ target }) => onChange(target.value)} placeholder={placeholder} />
      <TextareaInfo />
    </TextareaWrapper>
  )
};

Textarea.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  color: PropTypes.string,
  onChange: PropTypes.func
}


export { Textarea }