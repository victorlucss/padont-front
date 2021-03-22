import styled from 'styled-components';
import { colors, metrics } from 'styles';

const TextareaWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: ${colors.gray_dark};
`;

const Title = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;

  a, a:link, a:visited {
    border-bottom: none;
  }

  .icon {
    background: ${colors.green};
    padding: 10px 5px;
    border-radius: ${metrics.borderRadius}px;
    box-shadow: 0px 1px 5px -1px ${colors.green}55;
  }
`;

const Info = styled.div`
  position: absolute;
  bottom: 0;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  background: ${colors.dark_green};
  color: ${colors.green};
  border-radius: 0 0px 5px  5px;
  display: flex;
  align-items: center;

  span {
    padding-left: 5px;
  }
`;

const TextareaStyled = styled.textarea`
  width: 100%;
  height: 100vh;
  font-family: 'Lato', sans-serif;
  box-sizing: border-box;
  
  padding: 20px;
  border-radius: ${metrics.borderRadius}px;
  color: ${colors.almost_white};
  resize: none;

  ::placeholder {
    color: ${colors.gray_light};
  }
  
`;

export { TextareaWrapper, TextareaStyled, Info, Title }
