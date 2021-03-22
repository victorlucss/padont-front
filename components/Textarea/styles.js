import styled from 'styled-components';
import { colors, metrics } from 'styles';

const TextareaStyled = styled.textarea`
  width: 100%;
  height: 100%;
  font-family: 'Lato', sans-serif;
  box-sizing: border-box;
  background: ${colors.gray_dark};
  padding: 20px;
  border-radius: ${metrics.borderRadius}px;
  color: ${colors.almost_white};
  resize: none;

  padding-bottom: ${(props) => props.spaceBottom || 20}px;

  ::placeholder {
    color: ${colors.gray_light};
  }
  
`;

export { TextareaStyled }
