// Adapted from https://github.com/danscan/react-every-layout/blob/master/src/layouts/Content.tsx
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { colors } from 'styles'

const ContentPropTypes = {
  gutters: PropTypes.string,
  max: PropTypes.string,
}

const ContentDefaultProps = {
  max: '100%',
  height: 'auto',
  direction: '',
  items: '',
  justify: '',
  padding: '20px'
};

const Content = styled.div`
  flex-direction: ${(props) => props.direction};
  align-items: ${(props) => props.items};
  justify-content: ${(props) => props.justify};

  margin-left: auto;
  margin-right: auto;

  max-width: ${(props) => props.max};
  height: ${(props) => props.height};
  padding: ${(props) => props.padding};

  h1, h2, h3 {
    font-weight: bold;
    margin: .5em 0;

    &:first-child {
      margin-top: 0;
    }
  }
  
  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  h3 {
    font-size: 1.2rem;
  }

  strong, b {
    font-weight: bold;
  }

  em, i {
    font-style: italic;
  }

  blockquote {
    background: ${colors.dark_blue};
    border-left: 10px solid ${colors.blue};
    margin: 1.5em 0;
    padding: 0.5em 10px;
  }

  ul, ol {
    margin-left: 20px;
  }

  ol li {
    list-style-type: decimal;
  }

  ul li {
    list-style-type: circle;
  }

  code {
    font-family: 'Courier Prime', monospace;
    background: ${colors.dark_green};
    color: ${colors.green};
    padding: 0 .5em;
  }

  a, a:hover, a:visited {
    color: ${colors.white};
    text-decoration: none;
    border-bottom: 1px dashed ${colors.almost_white};
  }

  img {
    max-width: 400px;
  }
`;

Content.propTypes = ContentPropTypes;
Content.defaultProps = ContentDefaultProps;

export { Content };