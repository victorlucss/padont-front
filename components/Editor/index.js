import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

import { EditorToolbar, EditorContentStyled } from './styles';

const lowlight = createLowlight(common);

const Editor = ({ value, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: placeholder || 'Write something good here and share with anyone you like',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();
  const toggleCode = () => editor.chain().focus().toggleCode().run();
  const toggleCodeBlock = () => editor.chain().focus().toggleCodeBlock().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleHeading1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
  const toggleHeading2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleHeading3 = () => editor.chain().focus().toggleHeading({ level: 3 }).run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();

  return (
    <div>
      <EditorToolbar>
        <button
          onClick={toggleHeading1}
          className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={toggleHeading2}
          className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={toggleHeading3}
          className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}
          title="Heading 3"
        >
          H3
        </button>
        <div className="separator" />
        <button
          onClick={toggleBold}
          className={editor.isActive('bold') ? 'active' : ''}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={toggleItalic}
          className={editor.isActive('italic') ? 'active' : ''}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          onClick={toggleStrike}
          className={editor.isActive('strike') ? 'active' : ''}
          title="Strikethrough"
        >
          <del>S</del>
        </button>
        <button
          onClick={toggleCode}
          className={editor.isActive('code') ? 'active' : ''}
          title="Inline Code"
        >
          {'<>'}
        </button>
        <div className="separator" />
        <button
          onClick={toggleBulletList}
          className={editor.isActive('bulletList') ? 'active' : ''}
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={toggleOrderedList}
          className={editor.isActive('orderedList') ? 'active' : ''}
          title="Ordered List"
        >
          1.
        </button>
        <div className="separator" />
        <button
          onClick={toggleCodeBlock}
          className={editor.isActive('codeBlock') ? 'active' : ''}
          title="Code Block"
        >
          {'{ }'}
        </button>
        <button
          onClick={toggleBlockquote}
          className={editor.isActive('blockquote') ? 'active' : ''}
          title="Blockquote"
        >
          &quot;
        </button>
        <button
          onClick={addTable}
          title="Insert Table"
        >
          ▦
        </button>
      </EditorToolbar>
      <EditorContentStyled>
        <EditorContent editor={editor} />
      </EditorContentStyled>
    </div>
  );
};

export { Editor };
export default Editor;
