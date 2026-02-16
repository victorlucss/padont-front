import styled from 'styled-components';
import { colors } from 'styles';

export const EditorToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid #444;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  align-items: center;

  button {
    background: #2a2a2a;
    color: #fff;
    border: 1px solid #444;
    padding: 6px 10px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      background: #333;
      border-color: #555;
    }

    &.active {
      background: #0066cc;
      border-color: #0066cc;
      color: #fff;
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.3);
    }
  }

  .separator {
    width: 1px;
    height: 20px;
    background: #444;
    margin: 0 4px;
  }
`;

export const EditorContentStyled = styled.div`
  .ProseMirror {
    outline: none;
    padding: 16px;
    min-height: 400px;
    background: #1a1a1a;
    border: 1px solid #444;
    border-top: none;
    border-radius: 0 0 4px 4px;
    color: #d4d4d4;
    font-family: 'Courier Prime', monospace;
    line-height: 1.5;

    h1 {
      font-size: 2em;
      font-weight: bold;
      margin: 0.5em 0;
    }

    h2 {
      font-size: 1.5em;
      font-weight: bold;
      margin: 0.5em 0;
    }

    h3 {
      font-size: 1.2em;
      font-weight: bold;
      margin: 0.5em 0;
    }

    p {
      margin: 0.5em 0;
    }

    code {
      background: #2a2a2a;
      color: #4ec9b0;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.9em;
    }

    pre {
      background: #1e1e1e;
      border: 1px solid #444;
      border-radius: 4px;
      padding: 12px;
      overflow-x: auto;
      margin: 1em 0;

      code {
        background: transparent;
        color: #d4d4d4;
        padding: 0;
      }
    }

    strong {
      font-weight: bold;
    }

    em {
      font-style: italic;
    }

    del {
      text-decoration: line-through;
      opacity: 0.6;
    }

    ul, ol {
      margin-left: 20px;
      margin: 0.5em 0;

      li {
        margin: 0.25em 0;
      }
    }

    blockquote {
      border-left: 4px solid #0066cc;
      padding-left: 12px;
      margin: 1em 0;
      opacity: 0.8;
      font-style: italic;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;

      th, td {
        border: 1px solid #444;
        padding: 8px 12px;
        text-align: left;
      }

      th {
        background: #2a2a2a;
        font-weight: bold;
      }

      tr:nth-child(even) {
        background: #1e1e1e;
      }
    }

    a {
      color: #4a9eff;
      text-decoration: none;
      border-bottom: 1px dashed #4a9eff;

      &:hover {
        color: #6bb3ff;
      }
    }
  }
`;
