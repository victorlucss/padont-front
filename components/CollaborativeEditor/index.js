import { useEffect, useState } from 'react';
import { useEditor, EditorContent as TiptapContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Collaboration from '@tiptap/extension-collaboration';
import { common, createLowlight } from 'lowlight';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { yCursorPlugin } from 'y-prosemirror';
import { Extension } from '@tiptap/core';

import {
  EditorContainer,
  Toolbar,
  ToolbarDivider,
  ToolbarButton,
  EditorContent,
  CollabStatus,
  CollabDot,
  CollabUsers,
  UserBadge,
} from './styles';

const lowlight = createLowlight(common);

const getRandomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#E4FF1A', '#FF69B4', '#00CED1', '#FF8C00', '#9370DB'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getRandomName = () => {
  const adjectives = ['Swift', 'Clever', 'Bold', 'Quiet', 'Bright', 'Wild', 'Cosmic', 'Lucky', 'Mystic', 'Noble'];
  const nouns = ['Fox', 'Owl', 'Bear', 'Wolf', 'Hawk', 'Tiger', 'Dragon', 'Phoenix', 'Raven', 'Lynx'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
};

// Custom cursor extension using y-prosemirror directly
const createCursorExtension = (provider, user) => {
  return Extension.create({
    name: 'collaborationCursor',
    
    addProseMirrorPlugins() {
      const awareness = provider.awareness;
      
      // Set user info in awareness
      awareness.setLocalStateField('user', user);
      
      return [
        yCursorPlugin(awareness, {
          cursorBuilder: (cursorUser) => {
            const cursor = document.createElement('span');
            cursor.classList.add('collaboration-cursor__caret');
            cursor.style.borderColor = cursorUser.color;
            
            const label = document.createElement('div');
            label.classList.add('collaboration-cursor__label');
            label.style.backgroundColor = cursorUser.color;
            label.textContent = cursorUser.name;
            cursor.appendChild(label);
            
            return cursor;
          },
        }),
      ];
    },
  });
};

const icons = {
  bold: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>,
  italic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>,
  strike: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 3.6 3.9h.2" /><path d="M8.6 15c.6 1.8 3.3 4.2 8.2 3.1" /><line x1="4" y1="12" x2="20" y2="12" /></svg>,
  code: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
  h1: <svg viewBox="0 0 24 24" fill="currentColor"><text x="2" y="17" fontSize="14" fontWeight="bold">H1</text></svg>,
  h2: <svg viewBox="0 0 24 24" fill="currentColor"><text x="2" y="17" fontSize="14" fontWeight="bold">H2</text></svg>,
  h3: <svg viewBox="0 0 24 24" fill="currentColor"><text x="2" y="17" fontSize="14" fontWeight="bold">H3</text></svg>,
  bulletList: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" /></svg>,
  orderedList: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><text x="3" y="8" fontSize="8" fill="currentColor" stroke="none">1</text><text x="3" y="14" fontSize="8" fill="currentColor" stroke="none">2</text><text x="3" y="20" fontSize="8" fill="currentColor" stroke="none">3</text></svg>,
  codeBlock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10l-2 2 2 2" /><path d="M16 10l2 2-2 2" /></svg>,
  quote: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 8c-1.105 0-2 .672-2 1.5S8.895 11 10 11c1.104 0 2-.672 2-1.5 0-.188-.054-.363-.146-.52L14 6H11L9 9h1c0-.553.448-1 1-1zm6 0c-1.105 0-2 .672-2 1.5S14.895 11 16 11c1.104 0 2-.672 2-1.5 0-.188-.054-.363-.146-.52L20 6h-3l-2 3h1c0-.553.448-1 1-1z" /></svg>,
  table: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>,
  hr: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="2" y1="12" x2="22" y2="12" /></svg>,
};

// Inner component - only mounted when collab is ready
function TiptapEditor({ collab, placeholder }) {
  const [status, setStatus] = useState('connecting');
  const [users, setUsers] = useState([]);
  
  const { ydoc, provider, user } = collab;

  // Setup event listeners
  useEffect(() => {
    const handleStatus = ({ status: s }) => {
      console.log('[Collab] Status:', s);
      setStatus(s);
    };

    const handleAwareness = () => {
      const states = provider.awareness.getStates();
      const list = [];
      states.forEach((state, clientId) => {
        if (state.user && clientId !== ydoc.clientID) list.push(state.user);
      });
      setUsers(list);
    };

    provider.on('status', handleStatus);
    provider.awareness.on('change', handleAwareness);
    
    // Initial check
    handleAwareness();

    return () => {
      provider.off('status', handleStatus);
      provider.awareness.off('change', handleAwareness);
    };
  }, [provider, ydoc]);

  // Create extensions array once
  const extensions = [
    StarterKit.configure({ codeBlock: false, history: false }),
    Placeholder.configure({ placeholder }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    CodeBlockLowlight.configure({ lowlight }),
    Collaboration.configure({ document: ydoc }),
    // Skip cursor for now - debug
  ];

  const editor = useEditor({
    extensions,
    editorProps: { attributes: { spellcheck: 'false' } },
  });

  if (!editor) return <div style={{ padding: 24, color: '#666' }}>Loading editor...</div>;

  const addTable = () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  const statusText = { connecting: 'Connecting...', connected: 'Live', disconnected: 'Offline' };

  return (
    <>
      <Toolbar>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} $active={editor.isActive('heading', { level: 1 })} title="H1">{icons.h1}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} $active={editor.isActive('heading', { level: 2 })} title="H2">{icons.h2}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} $active={editor.isActive('heading', { level: 3 })} title="H3">{icons.h3}</ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} $active={editor.isActive('bold')} title="Bold">{icons.bold}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} $active={editor.isActive('italic')} title="Italic">{icons.italic}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} $active={editor.isActive('strike')} title="Strike">{icons.strike}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} $active={editor.isActive('code')} title="Code">{icons.code}</ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} $active={editor.isActive('bulletList')} title="Bullets">{icons.bulletList}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} $active={editor.isActive('orderedList')} title="Numbers">{icons.orderedList}</ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} $active={editor.isActive('codeBlock')} title="Code Block">{icons.codeBlock}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} $active={editor.isActive('blockquote')} title="Quote">{icons.quote}</ToolbarButton>
        <ToolbarButton onClick={addTable} title="Table">{icons.table}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="HR">{icons.hr}</ToolbarButton>
        
        <div style={{ flex: 1 }} />
        
        <CollabStatus>
          <CollabDot $status={status} />
          <span>{statusText[status]}</span>
        </CollabStatus>
        
        {users.length > 0 && (
          <CollabUsers>
            {users.slice(0, 3).map((u, i) => (
              <UserBadge key={i} $color={u.color} title={u.name}>{u.name.charAt(0)}</UserBadge>
            ))}
            {users.length > 3 && <UserBadge $color="#666">+{users.length - 3}</UserBadge>}
          </CollabUsers>
        )}
      </Toolbar>
      
      <EditorContent>
        <TiptapContent editor={editor} />
      </EditorContent>
    </>
  );
}

// Main component - handles provider lifecycle
const CollaborativeEditor = ({ roomName, placeholder = 'Start writing...', collabUrl }) => {
  const [collab, setCollab] = useState(null);

  useEffect(() => {
    if (!collabUrl || !roomName) return;

    const user = { name: getRandomName(), color: getRandomColor() };
    const ydoc = new Y.Doc();
    const wsUrl = collabUrl.replace(/^http/, 'ws') + '/collab';
    
    console.log('[Collab] Creating:', wsUrl, roomName);
    
    const provider = new WebsocketProvider(wsUrl, roomName, ydoc, {
      connect: true,
      maxBackoffTime: 5000,
    });

    provider.awareness.setLocalStateField('user', user);

    setCollab({ ydoc, provider, user });

    return () => {
      console.log('[Collab] Cleanup');
      setCollab(null);
      provider.disconnect();
      provider.destroy();
      ydoc.destroy();
    };
  }, [collabUrl, roomName]);

  return (
    <EditorContainer>
      {collab ? (
        <TiptapEditor collab={collab} placeholder={placeholder} />
      ) : (
        <div style={{ padding: 24, color: '#666', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CollabDot $status="connecting" />
          <span>Connecting...</span>
        </div>
      )}
    </EditorContainer>
  );
};

export { CollaborativeEditor };
