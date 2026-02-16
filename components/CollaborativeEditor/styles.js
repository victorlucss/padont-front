import styled, { css, keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

export const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  overflow: hidden;
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px 12px;
  background: #0f0f0f;
  border-bottom: 1px solid #1a1a1a;
  flex-wrap: wrap;
`;

export const ToolbarDivider = styled.div`
  width: 1px;
  height: 20px;
  background: #2a2a2a;
  margin: 0 6px;
`;

export const ToolbarButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  
  svg {
    width: 16px;
    height: 16px;
    color: #666;
    transition: color 0.15s ease;
  }
  
  &:hover {
    background: #1a1a1a;
    
    svg {
      color: #e4ff1a;
    }
  }
  
  ${({ $active }) => $active && css`
    background: #1a1a1a;
    
    svg {
      color: #e4ff1a;
    }
  `}
`;

export const EditorContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  
  .tiptap {
    outline: none;
    min-height: 100%;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    line-height: 1.7;
    color: #e0e0e0;
    
    > * + * {
      margin-top: 0.75em;
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Instrument Serif', Georgia, serif;
      font-weight: 400;
      color: #fff;
      line-height: 1.3;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      
      &:first-child {
        margin-top: 0;
      }
    }
    
    h1 { font-size: 2.5em; }
    h2 { font-size: 2em; }
    h3 { font-size: 1.5em; }
    
    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      color: #444;
      float: left;
      height: 0;
      pointer-events: none;
    }
    
    strong {
      color: #fff;
      font-weight: 600;
    }
    
    em {
      font-style: italic;
    }
    
    s {
      text-decoration: line-through;
      color: #666;
    }
    
    code {
      background: #1a1a1a;
      color: #e4ff1a;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 0.9em;
    }
    
    pre {
      background: #0f0f0f;
      border: 1px solid #1a1a1a;
      border-radius: 4px;
      padding: 16px;
      overflow-x: auto;
      
      code {
        background: transparent;
        padding: 0;
        color: #e0e0e0;
      }
    }
    
    blockquote {
      border-left: 3px solid #e4ff1a;
      padding-left: 16px;
      margin-left: 0;
      font-style: italic;
      color: #888;
    }
    
    ul, ol {
      padding-left: 24px;
    }
    
    li {
      margin: 0.25em 0;
      
      &::marker {
        color: #e4ff1a;
      }
    }
    
    hr {
      border: none;
      border-top: 1px solid #2a2a2a;
      margin: 2em 0;
    }
    
    a {
      color: #e4ff1a;
      text-decoration: underline;
      
      &:hover {
        text-decoration: none;
      }
    }
    
    /* Tables */
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
      
      th, td {
        border: 1px solid #2a2a2a;
        padding: 8px 12px;
        text-align: left;
      }
      
      th {
        background: #1a1a1a;
        color: #e4ff1a;
        font-weight: 500;
      }
      
      td {
        background: #0f0f0f;
      }
      
      .selectedCell {
        background: #1a1a0a;
      }
    }
    
    /* Collaboration cursors */
    .collaboration-cursor__caret {
      position: relative;
      margin-left: -1px;
      margin-right: -1px;
      border-left: 1px solid;
      border-right: 1px solid;
      word-break: normal;
      pointer-events: none;
    }
    
    .collaboration-cursor__label {
      position: absolute;
      top: -1.4em;
      left: -1px;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-style: normal;
      font-weight: 500;
      line-height: 1;
      padding: 2px 4px;
      border-radius: 3px 3px 3px 0;
      white-space: nowrap;
      user-select: none;
      pointer-events: none;
      color: #000;
    }
  }
`;

export const CollabStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #1a1a1a;
  border-radius: 12px;
  font-size: 11px;
  color: #888;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const CollabDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $status }) => {
    switch ($status) {
      case 'connected': return '#4ade80';
      case 'connecting': return '#facc15';
      case 'disconnected': return '#ef4444';
      default: return '#666';
    }
  }};
  
  ${({ $status }) => $status === 'connecting' && css`
    animation: ${pulse} 1s ease-in-out infinite;
  `}
`;

export const CollabUsers = styled.div`
  display: flex;
  align-items: center;
  gap: -4px;
  margin-left: 8px;
`;

export const UserBadge = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ $color }) => $color || '#666'};
  color: #000;
  font-size: 11px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0f0f0f;
  margin-left: -6px;
  
  &:first-child {
    margin-left: 0;
  }
`;
