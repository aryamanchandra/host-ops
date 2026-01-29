import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { markdownSanitizeSchema } from '@/lib/markdown';

/**
 * Render markdown to sanitized HTML with GitHub-flavored markdown support.
 * Server- and client-safe (used on the public page and in the editor preview).
 */
export default function MarkdownRenderer({ source }: { source: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, markdownSanitizeSchema]]}
      >
        {source || ''}
      </ReactMarkdown>
    </div>
  );
}
