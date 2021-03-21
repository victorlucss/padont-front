import styled from 'styled-components';
import { colors, metrics } from 'styles';

const TextareaWrapper = styled.div``;

const TextareaInfo = styled.div``;

const TextareaStyled = styled.textarea`
  width: 100%;
  height: 100vh;
  font-family: 'Lato', sans-serif;
  box-sizing: border-box;
  background: ${colors.gray_dark};
  padding: 20px;
  border-radius: ${metrics.borderRadius}px;
  color: ${colors.almost_white};
  resize: none;

  ::placeholder {
    color: ${colors.gray_light};
  }
  
`;

export { TextareaWrapper, TextareaStyled, TextareaInfo }
