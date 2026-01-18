import { Plus } from 'lucide-react';
import type { BlockType } from '@/types/blocks';
import { BLOCK_LABELS } from '@/types/blocks';
import styles from '@/styles/BlockEditor.module.css';

const TYPES: BlockType[] = ['hero', 'text', 'image', 'button', 'divider', 'embed'];

export default function BlockPalette({ onAdd }: { onAdd: (type: BlockType) => void }) {
  return (
    <div className={styles.palette}>
      {TYPES.map((t) => (
        <button key={t} type="button" className={styles.paletteBtn} onClick={() => onAdd(t)}>
          <Plus size={13} /> {BLOCK_LABELS[t]}
        </button>
      ))}
    </div>
  );
}
