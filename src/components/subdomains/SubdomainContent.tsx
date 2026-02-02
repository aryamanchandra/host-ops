import { Subdomain } from '@/lib/models';
import { sanitizeHtml } from '@/lib/sanitize';
import { blocksToHtml } from '@/lib/blocks';
import MarkdownRenderer from './MarkdownRenderer';

/**
 * Server-rendered presentational markup for a public subdomain page:
 * gradient header, 900px content column, footer, plus the content
 * typography styles and any author-provided customCss. Author HTML is
 * sanitized before injection.
 */
export default function SubdomainContent({ doc }: { doc: Subdomain }) {
  // Legacy subdomains predate contentFormat — treat them as raw HTML.
  const format = doc.contentFormat || 'html';
  const isMarkdown = format === 'markdown';
  // Prefer rendering from structured blocks; fall back to raw HTML content.
  const rawHtml =
    format === 'blocks' && doc.blocks?.length
      ? blocksToHtml(doc.blocks)
      : doc.content || '';
  const safeContent = sanitizeHtml(rawHtml);

  return (
    <>
      {doc.customCss && (
        <style dangerouslySetInnerHTML={{ __html: doc.customCss }} />
      )}
      <div className="subdomain-container">
        <header
          style={{
            padding: '60px 20px',
            background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
            borderBottom: '1px solid #eaeaea',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '48px',
                fontWeight: 700,
                color: '#000',
                letterSpacing: '-0.02em',
                lineHeight: '1.1',
              }}
            >
              {doc.title}
            </h1>
            {doc.description && (
              <p
                style={{
                  margin: '20px 0 0',
                  fontSize: '20px',
                  color: '#666',
                  lineHeight: '1.6',
                }}
              >
                {doc.description}
              </p>
            )}
          </div>
        </header>

        <main
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '60px 20px',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            lineHeight: '1.7',
            color: '#333',
          }}
        >
          {isMarkdown ? (
            <div className="subdomain-content">
              <MarkdownRenderer source={doc.content || ''} />
            </div>
          ) : (
            <div
              className="subdomain-content"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />
          )}
        </main>

        <footer
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            borderTop: '1px solid #eaeaea',
            background: '#fafafa',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', color: '#999' }}>
            Powered by Domainbase
          </p>
        </footer>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .subdomain-content h2 { font-size: 32px; font-weight: 600; color: #000; margin: 40px 0 16px; letter-spacing: -0.01em; }
        .subdomain-content h3 { font-size: 24px; font-weight: 600; color: #000; margin: 32px 0 12px; letter-spacing: -0.01em; }
        .subdomain-content p { margin: 16px 0; font-size: 16px; line-height: 1.7; color: #333; }
        .subdomain-content a { color: #0070f3; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s ease; }
        .subdomain-content a:hover { border-bottom-color: #0070f3; }
        .subdomain-content ul, .subdomain-content ol { margin: 16px 0; padding-left: 24px; }
        .subdomain-content li { margin: 8px 0; line-height: 1.7; }
        .subdomain-content code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace; font-size: 0.9em; color: #e11d48; }
        .subdomain-content pre { background: #000; color: #fff; padding: 20px; border-radius: 8px; overflow-x: auto; margin: 24px 0; }
        .subdomain-content pre code { background: none; color: inherit; padding: 0; }
        .subdomain-content blockquote { border-left: 3px solid #eaeaea; padding-left: 20px; margin: 24px 0; color: #666; font-style: italic; }
        .subdomain-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 24px 0; }
      `,
        }}
      />
    </>
  );
}
