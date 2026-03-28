import { useState } from 'react';
import { X } from 'lucide-react';
import styles from '@/styles/page.module.css';
import editorStyles from '@/styles/BlockEditor.module.css';
import type { Subdomain } from '@/types';
import type { Block, ContentFormat } from '@/types/blocks';
import { legacyHtmlToBlocks } from '@/lib/blocks';
import BlockEditor from '@/components/subdomains/BlockEditor';
import MarkdownEditor from '@/components/subdomains/MarkdownEditor';
import ScheduleFields from '@/components/subdomains/ScheduleFields';

interface FormData {
  subdomain: string;
  title: string;
  description: string;
  content: string;
  customCss: string;
  contentFormat?: ContentFormat;
  blocks?: Block[];
  publishAt?: string | null;
  unpublishAt?: string | null;
  type?: 'page' | 'redirect';
  redirectUrl?: string;
  redirectType?: 301 | 302;
}

// Convert a stored ISO/UTC timestamp to a local `datetime-local` value
// (and back on submit) without timezone drift.
const toLocalInput = (v?: string | null) => {
  if (!v) return '';
  const d = new Date(v);
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
};

const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

interface Props {
  editingSubdomain: Subdomain | null;
  initialData: FormData;
  onSubmit: (data: FormData) => Promise<void>;
  onClose: () => void;
  error: string;
  loading: boolean;
}

export default function SubdomainForm({ 
  editingSubdomain, 
  initialData, 
  onSubmit, 
  onClose, 
  error,
  loading 
}: Props) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [mode, setMode] = useState<'html' | 'blocks' | 'markdown'>(
    editingSubdomain?.contentFormat &&
      ['html', 'blocks', 'markdown'].includes(editingSubdomain.contentFormat)
      ? (editingSubdomain.contentFormat as 'html' | 'blocks' | 'markdown')
      : 'html'
  );
  const [blocks, setBlocks] = useState<Block[]>(
    (editingSubdomain?.blocks as Block[]) || []
  );
  const [publishAt, setPublishAt] = useState(toLocalInput(editingSubdomain?.publishAt));
  const [unpublishAt, setUnpublishAt] = useState(
    toLocalInput(editingSubdomain?.unpublishAt)
  );
  const [pageType, setPageType] = useState<'page' | 'redirect'>(
    editingSubdomain?.type === 'redirect' ? 'redirect' : 'page'
  );
  const [redirectUrl, setRedirectUrl] = useState(editingSubdomain?.redirectUrl || '');
  const [redirectType, setRedirectType] = useState<301 | 302>(
    (editingSubdomain?.redirectType as 301 | 302) || 302
  );

  const switchToBlocks = () => {
    // Legacy convert: seed from existing HTML content if there are no blocks.
    if (blocks.length === 0 && formData.content.trim()) {
      setBlocks(legacyHtmlToBlocks(formData.content));
    }
    setMode('blocks');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      contentFormat: mode,
      blocks: mode === 'blocks' ? blocks : [],
      publishAt: fromLocalInput(publishAt),
      unpublishAt: fromLocalInput(unpublishAt),
      type: pageType,
      redirectUrl: pageType === 'redirect' ? redirectUrl : undefined,
      redirectType,
    });
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{editingSubdomain ? 'Edit Subdomain' : 'Create New Subdomain'}</h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && (
            <div className={styles.errorAlert}>
              <X size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="subdomain">Subdomain *</label>
            <input
              id="subdomain"
              type="text"
              placeholder="mysite"
              value={formData.subdomain}
              onChange={(e) =>
                setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })
              }
              disabled={!!editingSubdomain}
              className={styles.input}
              required
            />
            <span className={styles.hint}>Only lowercase letters, numbers, and hyphens</span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              placeholder="My Awesome Site"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              placeholder="A brief description of your subdomain"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={editorStyles.modeToggle}>
              <label>Type</label>
              <div className={editorStyles.segmented}>
                <button
                  type="button"
                  className={pageType === 'page' ? editorStyles.segActive : editorStyles.seg}
                  onClick={() => setPageType('page')}
                >
                  Page
                </button>
                <button
                  type="button"
                  className={pageType === 'redirect' ? editorStyles.segActive : editorStyles.seg}
                  onClick={() => setPageType('redirect')}
                >
                  Redirect
                </button>
              </div>
            </div>
          </div>

          {pageType === 'redirect' && (
            <div className={styles.formGroup}>
              <label htmlFor="redirectUrl">Destination URL *</label>
              <input
                id="redirectUrl"
                type="url"
                placeholder="https://example.com"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                className={styles.input}
                required
              />
              <select
                value={redirectType}
                onChange={(e) => setRedirectType(Number(e.target.value) as 301 | 302)}
                className={styles.input}
              >
                <option value={302}>302 — Temporary</option>
                <option value={301}>301 — Permanent</option>
              </select>
            </div>
          )}

          {pageType === 'page' && (
          <div className={styles.formGroup}>
            <div className={editorStyles.modeToggle}>
              <label>Content</label>
              <div className={editorStyles.segmented}>
                <button
                  type="button"
                  className={mode === 'html' ? editorStyles.segActive : editorStyles.seg}
                  onClick={() => setMode('html')}
                >
                  HTML
                </button>
                <button
                  type="button"
                  className={mode === 'markdown' ? editorStyles.segActive : editorStyles.seg}
                  onClick={() => setMode('markdown')}
                >
                  Markdown
                </button>
                <button
                  type="button"
                  className={mode === 'blocks' ? editorStyles.segActive : editorStyles.seg}
                  onClick={switchToBlocks}
                >
                  Blocks
                </button>
              </div>
            </div>
            {mode === 'html' && (
              <textarea
                id="content"
                placeholder="<h1>Welcome!</h1><p>Your content here...</p>"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className={styles.textarea}
              />
            )}
            {mode === 'markdown' && (
              <MarkdownEditor
                value={formData.content}
                onChange={(v) => setFormData({ ...formData, content: v })}
              />
            )}
            {mode === 'blocks' && (
              <BlockEditor initialBlocks={blocks} onChange={setBlocks} />
            )}
          </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="customCss">Custom CSS (Optional)</label>
            <textarea
              id="customCss"
              placeholder="body { background: #f0f0f0; }"
              value={formData.customCss}
              onChange={(e) => setFormData({ ...formData, customCss: e.target.value })}
              rows={6}
              className={styles.textarea}
            />
          </div>

          <ScheduleFields
            publishAt={publishAt}
            unpublishAt={unpublishAt}
            onChange={(patch) => {
              if (patch.publishAt !== undefined) setPublishAt(patch.publishAt);
              if (patch.unpublishAt !== undefined) setUnpublishAt(patch.unpublishAt);
            }}
          />

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Saving...' : editingSubdomain ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

