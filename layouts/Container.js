// Adapted from https://github.com/danscan/react-every-layout/blob/master/src/layouts/Container.tsx
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ContainerPropTypes = {
  gutters: PropTypes.string,
  max: PropTypes.string,
}

const ContainerDefaultProps = {
  max: '100%',
  height: 'auto',
  direction: '',
  items: '',
  justify: '',
  padding: '0'
};

const Container = styled.div`
  display: flex;
  flex-direction: ${(props) => props.direction};
  align-items: ${(props) => props.items};
  justify-content: ${(props) => props.justify};

  margin-left: auto;
  margin-right: auto;

  max-width: ${(props) => props.max};
  height: ${(props) => props.height};
  padding: ${(props) => props.padding};
`;

Container.propTypes = ContainerPropTypes;
Container.defaultProps = ContainerDefaultProps;

export { Container };