import type { Block } from '@/types/blocks';
import styles from '@/styles/BlockEditor.module.css';

export default function BlockInspector({
  block,
  onChange,
}: {
  block: Block;
  onChange: (patch: Partial<Block>) => void;
}) {
  const field = (label: string, node: React.ReactNode) => (
    <label className={styles.field}>
      <span>{label}</span>
      {node}
    </label>
  );

  switch (block.type) {
    case 'hero':
      return (
        <div className={styles.inspector}>
          {field(
            'Heading',
            <input
              value={block.heading}
              onChange={(e) => onChange({ heading: e.target.value } as Partial<Block>)}
            />
          )}
          {field(
            'Subheading',
            <input
              value={block.subheading || ''}
              onChange={(e) => onChange({ subheading: e.target.value } as Partial<Block>)}
            />
          )}
        </div>
      );
    case 'text':
    case 'embed':
      return (
        <div className={styles.inspector}>
          {field(
            block.type === 'text' ? 'HTML' : 'Embed HTML',
            <textarea
              rows={5}
              value={block.html}
              onChange={(e) => onChange({ html: e.target.value } as Partial<Block>)}
            />
          )}
        </div>
      );
    case 'image':
      return (
        <div className={styles.inspector}>
          {field(
            'Image URL',
            <input
              value={block.src}
              onChange={(e) => onChange({ src: e.target.value } as Partial<Block>)}
            />
          )}
          {field(
            'Alt text',
            <input
              value={block.alt || ''}
              onChange={(e) => onChange({ alt: e.target.value } as Partial<Block>)}
            />
          )}
        </div>
      );
    case 'button':
      return (
        <div className={styles.inspector}>
          {field(
            'Label',
            <input
              value={block.label}
              onChange={(e) => onChange({ label: e.target.value } as Partial<Block>)}
            />
          )}
          {field(
            'Link URL',
            <input
              value={block.href}
              onChange={(e) => onChange({ href: e.target.value } as Partial<Block>)}
            />
          )}
        </div>
      );
    case 'divider':
      return <p className={styles.inspectorNote}>A horizontal divider. Nothing to configure.</p>;
    default:
      return null;
  }
}
