// Adapted from https://github.com/danscan/react-every-layout/blob/master/src/layouts/Center.tsx
import PropTypes from 'prop-types';
import styled from 'styled-components';

const CenterPropTypes = {
  andText: PropTypes.bool,
  gutters: PropTypes.string,
  intrinsic: PropTypes.bool,
  max: PropTypes.string,
}

const CenterDefaultProps = {
  andText: false,
  gutters: '0',
  intrinsic: false,
  max: 'var(--measure)',
};

const Center = styled.div`
  box-sizing: content-box;
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: ${props => props.max};
  ${props => props.intrinsic ? `
    align-items: center;
    display: flex;
    flex-direction: column;`
    : ''}
  ${({ gutters }) => gutters ? `
    padding-left: ${gutters};
    padding-right: ${gutters};`
    : ''}
  ${props => props.andText ? `text-align: center;` : ''}
`;

Center.propTypes = CenterPropTypes;
Center.defaultProps = CenterDefaultProps;

export { Center };