import { useState } from 'react';
import { X } from 'lucide-react';
import styles from '@/styles/page.module.css';
import editorStyles from '@/styles/BlockEditor.module.css';
import type { Subdomain } from '@/types';
import type { Block, ContentFormat } from '@/types/blocks';
import { legacyHtmlToBlocks } from '@/lib/blocks';
import BlockEditor from '@/components/subdomains/BlockEditor';

interface FormData {
  subdomain: string;
  title: string;
  description: string;
  content: string;
  customCss: string;
  contentFormat?: ContentFormat;
  blocks?: Block[];
}

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
  const [mode, setMode] = useState<'html' | 'blocks'>(
    (editingSubdomain?.contentFormat as ContentFormat) === 'blocks' ? 'blocks' : 'html'
  );
  const [blocks, setBlocks] = useState<Block[]>(
    (editingSubdomain?.blocks as Block[]) || []
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
                  className={mode === 'blocks' ? editorStyles.segActive : editorStyles.seg}
                  onClick={switchToBlocks}
                >
                  Blocks
                </button>
              </div>
            </div>
            {mode === 'html' ? (
              <textarea
                id="content"
                placeholder="<h1>Welcome!</h1><p>Your content here...</p>"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className={styles.textarea}
              />
            ) : (
              <BlockEditor initialBlocks={blocks} onChange={setBlocks} />
            )}
          </div>

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

