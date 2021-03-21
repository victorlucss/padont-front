import styled from 'styled-components';
import { colors, metrics } from 'styles';

const InputStyled = styled.input`
  width: 100%;
  box-sizing: border-box;
  background: ${colors.gray_dark};
  padding: 20px;
  border-radius: ${metrics.borderRadius}px;
  color: ${colors.almost_white};

  ::placeholder {
    color: ${colors.gray_light};
  }
  
`;

export { InputStyled }
