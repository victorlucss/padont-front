import styled from 'styled-components';
import { colors } from 'styles';

export const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${colors.black};
  overflow: hidden;
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 24px;
  background: ${colors.gray_900};
  border-bottom: 1px solid ${colors.gray_800};
  flex-wrap: wrap;
`;

export const ToolbarDivider = styled.div`
  width: 1px;
  height: 24px;
  background: ${colors.gray_700};
  margin: 0 8px;
`;

export const ToolbarButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: ${props => props.$active ? colors.accent : colors.gray_400};
  background: ${props => props.$active ? colors.accent_glow : 'transparent'};
  border: 1px solid ${props => props.$active ? colors.accent : 'transparent'};
  transition: all 0.15s;

  &:hover {
    color: ${colors.white};
    background: ${colors.gray_800};
    border-color: ${colors.gray_700};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const EditorContent = styled.div`
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  
  .ProseMirror {
    min-height: 100%;
    outline: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9375rem;
    line-height: 1.75;
    color: ${colors.white};

    > * + * {
      margin-top: 0.75em;
    }

    /* Placeholder */
    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: ${colors.gray_600};
      pointer-events: none;
      height: 0;
    }

    /* Headings */
    h1, h2, h3 {
      font-family: 'Instrument Serif', Georgia, serif;
      font-weight: 400;
      line-height: 1.2;
      color: ${colors.white};
    }

    h1 {
      font-size: 2.5rem;
      margin-top: 1.5em;
      letter-spacing: -0.02em;
    }

    h2 {
      font-size: 1.75rem;
      margin-top: 1.25em;
    }

    h3 {
      font-size: 1.25rem;
      margin-top: 1em;
    }

    /* Inline formatting */
    strong {
      font-weight: 600;
      color: ${colors.white};
    }

    em {
      font-style: italic;
    }

    s {
      text-decoration: line-through;
      color: ${colors.gray_500};
    }

    code {
      font-family: inherit;
      background: ${colors.gray_800};
      color: ${colors.accent};
      padding: 0.2em 0.4em;
      border-radius: 0;
    }

    /* Links */
    a {
      color: ${colors.accent};
      text-decoration: underline;
      text-underline-offset: 2px;
      
      &:hover {
        color: ${colors.white};
      }
    }

    /* Lists */
    ul, ol {
      padding-left: 1.5em;
    }

    ul {
      list-style-type: none;
      
      li::before {
        content: '—';
        color: ${colors.accent};
        display: inline-block;
        width: 1.5em;
        margin-left: -1.5em;
      }
    }

    ol {
      list-style-type: decimal;
      
      li::marker {
        color: ${colors.accent};
      }
    }

    li {
      margin-top: 0.25em;
    }

    /* Blockquote */
    blockquote {
      border-left: 2px solid ${colors.accent};
      padding-left: 1.5em;
      margin-left: 0;
      color: ${colors.gray_300};
      font-style: italic;
    }

    /* Code blocks */
    pre {
      background: ${colors.gray_900};
      border: 1px solid ${colors.gray_800};
      padding: 1em 1.25em;
      overflow-x: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      line-height: 1.6;

      code {
        background: none;
        padding: 0;
        color: ${colors.gray_200};
      }

      /* Syntax highlighting */
      .hljs-keyword,
      .hljs-selector-tag,
      .hljs-built_in {
        color: ${colors.accent};
      }

      .hljs-string,
      .hljs-attr {
        color: #a8e6cf;
      }

      .hljs-number,
      .hljs-literal {
        color: #ffb4a2;
      }

      .hljs-comment {
        color: ${colors.gray_500};
        font-style: italic;
      }

      .hljs-function,
      .hljs-title {
        color: #ffd3b6;
      }

      .hljs-variable,
      .hljs-template-variable {
        color: #dcedc1;
      }
    }

    /* Horizontal rule */
    hr {
      border: none;
      border-top: 1px solid ${colors.gray_700};
      margin: 2em 0;
    }

    /* Tables */
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
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

    td {
      background: ${colors.black};
    }

    tr:hover td {
      background: ${colors.gray_900};
    }

    /* Task lists */
    ul[data-type="taskList"] {
      list-style: none;
      padding-left: 0;

      li {
        display: flex;
        align-items: flex-start;
        gap: 0.5em;

        &::before {
          display: none;
        }

        > label {
          flex-shrink: 0;
          margin-top: 0.25em;

          input[type="checkbox"] {
            appearance: none;
            width: 16px;
            height: 16px;
            border: 1px solid ${colors.gray_600};
            background: ${colors.black};
            cursor: pointer;
            position: relative;

            &:checked {
              background: ${colors.accent};
              border-color: ${colors.accent};

              &::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 10px;
                color: ${colors.black};
              }
            }

            &:hover {
              border-color: ${colors.accent};
            }
          }
        }

        > div {
          flex: 1;
        }
      }
    }
  }
`;
