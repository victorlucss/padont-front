import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from 'styles';

const ContentPropTypes = {
  max: PropTypes.string,
  height: PropTypes.string,
  padding: PropTypes.string,
};

const ContentDefaultProps = {
  max: '100%',
  height: 'auto',
  padding: '24px',
};

const Content = styled.div`
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
  max-width: ${(props) => props.max};
  height: ${(props) => props.height};
  padding: ${(props) => props.padding};

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Instrument Serif', Georgia, serif;
    font-weight: 400;
    color: ${colors.white};
    margin: 1.5em 0 0.75em;
    line-height: 1.3;

    &:first-child {
      margin-top: 0;
    }
  }

  h1 { font-size: 2.5rem; letter-spacing: -0.02em; }
  h2 { font-size: 1.75rem; }
  h3 { font-size: 1.25rem; }
  h4 { font-size: 1rem; }

  strong, b {
    font-weight: 600;
    color: ${colors.white};
  }

  em, i {
    font-style: italic;
  }

  /* Links */
  a, a:visited {
    color: ${colors.accent};
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: color 0.2s;
  }

  a:hover {
    color: ${colors.white};
  }

  /* Blockquote */
  blockquote {
    border-left: 2px solid ${colors.accent};
    background: ${colors.gray_900};
    margin: 1.5em 0;
    padding: 1em 1.5em;
    color: ${colors.gray_300};
    font-style: italic;
  }

  /* Lists */
  ul, ol {
    margin-left: 1.5em;
    margin-bottom: 1em;
  }

  ul {
    list-style: none;

    li::before {
      content: '—';
      color: ${colors.accent};
      display: inline-block;
      width: 1.5em;
      margin-left: -1.5em;
    }
  }

  ol li {
    list-style-type: decimal;

    &::marker {
      color: ${colors.accent};
    }
  }

  li {
    margin-bottom: 0.25em;
  }

  /* Code */
  code {
    font-family: 'JetBrains Mono', monospace;
    background: ${colors.gray_800};
    color: ${colors.accent};
    padding: 0.2em 0.4em;
  }

  pre {
    background: ${colors.gray_900};
    border: 1px solid ${colors.gray_800};
    padding: 1em;
    overflow-x: auto;
    margin: 1.5em 0;

    code {
      background: none;
      padding: 0;
      color: ${colors.gray_200};
    }
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5em 0;
    font-size: 0.875rem;
  }

  th, td {
    border: 1px solid ${colors.gray_700};
    padding: 0.75em 1em;
    text-align: left;
  }

  th {
    background: ${colors.gray_900};
    font-weight: 600;
    color: ${colors.accent};
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }

  tr:hover td {
    background: ${colors.gray_900};
  }

  /* Strikethrough */
  del, s {
    text-decoration: line-through;
    color: ${colors.gray_500};
  }

  /* Images */
  img {
    max-width: 100%;
    height: auto;
    border: 1px solid ${colors.gray_800};
  }

  /* Horizontal rule */
  hr {
    border: none;
    border-top: 1px solid ${colors.gray_700};
    margin: 2em 0;
  }
`;

Content.propTypes = ContentPropTypes;
Content.defaultProps = ContentDefaultProps;

export { Content };
