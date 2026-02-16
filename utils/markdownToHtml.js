import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

// This is a wrapper component to render markdown
// The component should be used directly instead of calling this function
export const MarkdownRenderer = ({ children }) => {
  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
    >
      {children}
    </ReactMarkdown>
  );
};

// Keep this for backwards compatibility if needed
export default async function markdownToHtml(markdown) {
  // This function is now deprecated - use MarkdownRenderer component instead
  // For now, return the markdown as-is (will be rendered by component)
  return markdown;
}
