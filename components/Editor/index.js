import { useEffect, useMemo, useState } from 'react';
import { useEditor, EditorContent as TiptapContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { common, createLowlight } from 'lowlight';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

import {
  EditorContainer,
  Toolbar,
  ToolbarDivider,
  ToolbarButton,
  EditorContent,
  CollaboratorsBar,
  CollaboratorBadge,
} from './styles';

const lowlight = createLowlight(common);

// Generate random color for cursor
const getRandomColor = () => {
  const colors = [
    '#e4ff1a', // accent yellow
    '#ff6b6b', // coral
    '#4ecdc4', // teal
    '#45b7d1', // sky blue
    '#96ceb4', // sage
    '#ffeaa7', // cream
    '#dfe6e9', // silver
    '#a29bfe', // lavender
    '#fd79a8', // pink
    '#00b894', // mint
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate random name
const getRandomName = () => {
  const adjectives = ['Swift', 'Clever', 'Bold', 'Bright', 'Quick', 'Sharp', 'Calm', 'Keen'];
  const nouns = ['Writer', 'Editor', 'Author', 'Scribe', 'Poet', 'Creator', 'Maker', 'Thinker'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
};

// Icons
const icons = {
  bold: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  ),
  italic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  ),
  strike: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 3.6 3.9h.2" />
      <path d="M8.6 15c.6 1.8 3.3 4.2 8.2 3.1" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  h1: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <text x="2" y="17" fontSize="14" fontWeight="bold">H1</text>
    </svg>
  ),
  h2: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <text x="2" y="17" fontSize="14" fontWeight="bold">H2</text>
    </svg>
  ),
  h3: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <text x="2" y="17" fontSize="14" fontWeight="bold">H3</text>
    </svg>
  ),
  bulletList: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  ),
  orderedList: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <text x="3" y="8" fontSize="8" fill="currentColor" stroke="none">1</text>
      <text x="3" y="14" fontSize="8" fill="currentColor" stroke="none">2</text>
      <text x="3" y="20" fontSize="8" fill="currentColor" stroke="none">3</text>
    </svg>
  ),
  codeBlock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 10l-2 2 2 2" />
      <path d="M16 10l2 2-2 2" />
      <line x1="12" y1="8" x2="12" y2="16" />
    </svg>
  ),
  quote: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 8c-1.105 0-2 .672-2 1.5S8.895 11 10 11c1.104 0 2-.672 2-1.5 0-.188-.054-.363-.146-.52L14 6H11L9 9h1c0-.553.448-1 1-1zm6 0c-1.105 0-2 .672-2 1.5S14.895 11 16 11c1.104 0 2-.672 2-1.5 0-.188-.054-.363-.146-.52L20 6h-3l-2 3h1c0-.553.448-1 1-1z" />
    </svg>
  ),
  table: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  ),
  hr: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  ),
};

const Editor = ({ value, onChange, placeholder = 'Start writing...', roomName = 'default' }) => {
  const [collaborators, setCollaborators] = useState([]);
  
  // Create Yjs document and WebSocket provider
  const { ydoc, provider, user } = useMemo(() => {
    const doc = new Y.Doc();
    const userColor = getRandomColor();
    const userName = getRandomName();
    
    // WebSocket URL - use environment variable or default
    const wsUrl = typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_COLLAB_URL || `ws://${window.location.hostname}:1234`)
      : 'ws://localhost:1234';
    
    const wsProvider = new WebsocketProvider(wsUrl, roomName, doc);
    
    // Set user awareness
    wsProvider.awareness.setLocalStateField('user', {
      name: userName,
      color: userColor,
    });
    
    return {
      ydoc: doc,
      provider: wsProvider,
      user: { name: userName, color: userColor },
    };
  }, [roomName]);

  // Track collaborators
  useEffect(() => {
    const updateCollaborators = () => {
      const states = Array.from(provider.awareness.getStates().values());
      const users = states
        .filter(state => state.user)
        .map(state => state.user);
      setCollaborators(users);
    };

    provider.awareness.on('change', updateCollaborators);
    updateCollaborators();

    return () => {
      provider.awareness.off('change', updateCollaborators);
    };
  }, [provider]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [provider, ydoc]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        history: false, // Disable default history, Yjs handles this
      }),
      Placeholder.configure({
        placeholder,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider,
        user: user,
      }),
    ],
    editorProps: {
      attributes: {
        spellcheck: 'false',
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  if (!editor) {
    return null;
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <EditorContainer>
      <Toolbar>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          $active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          {icons.h1}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          $active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          {icons.h2}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          $active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          {icons.h3}
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          $active={editor.isActive('bold')}
          title="Bold"
        >
          {icons.bold}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          $active={editor.isActive('italic')}
          title="Italic"
        >
          {icons.italic}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          $active={editor.isActive('strike')}
          title="Strikethrough"
        >
          {icons.strike}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          $active={editor.isActive('code')}
          title="Inline Code"
        >
          {icons.code}
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          $active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          {icons.bulletList}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          $active={editor.isActive('orderedList')}
          title="Ordered List"
        >
          {icons.orderedList}
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          $active={editor.isActive('codeBlock')}
          title="Code Block"
        >
          {icons.codeBlock}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          $active={editor.isActive('blockquote')}
          title="Quote"
        >
          {icons.quote}
        </ToolbarButton>
        <ToolbarButton
          onClick={addTable}
          title="Insert Table"
        >
          {icons.table}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          {icons.hr}
        </ToolbarButton>

        {/* Collaborators indicator */}
        {collaborators.length > 1 && (
          <>
            <ToolbarDivider />
            <CollaboratorsBar>
              {collaborators.slice(0, 5).map((collab, i) => (
                <CollaboratorBadge 
                  key={i} 
                  $color={collab.color}
                  title={collab.name}
                >
                  {collab.name.charAt(0)}
                </CollaboratorBadge>
              ))}
              {collaborators.length > 5 && (
                <CollaboratorBadge $color="#666">
                  +{collaborators.length - 5}
                </CollaboratorBadge>
              )}
            </CollaboratorsBar>
          </>
        )}
      </Toolbar>

      <EditorContent>
        <TiptapContent editor={editor} />
      </EditorContent>
    </EditorContainer>
  );
};

export { Editor };
