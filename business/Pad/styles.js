
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

  h2 {
    a:hover {
      color: ${colors.orange};
    }
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


const Subpads = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: 75px;
  min-width: 200px;
  `;

const Subpad = styled.div`
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
  background: ${colors.dark_blue};
  border: 1px solid transparent;
  border-left: 3px solid ${colors.blue};
  border-radius: ${metrics.borderRadius}px;
  display: flex;
  align-items: center;
  padding: 20px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  box-shadow: 0 2px 15px -2px transparent;

  &:hover {
    border-color: ${colors.blue};
    box-shadow: 0 2px 15px -2px ${colors.blue}55;
  }

  &:not(:first-child) {
    margin-top: 10px;
  }
`;

export { TextareaWrapper, Info, Title, Subpads, Subpad}
