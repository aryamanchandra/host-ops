'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Trash2, GripVertical } from 'lucide-react';
import type { Block } from '@/types/blocks';
import { BLOCK_LABELS } from '@/types/blocks';
import { useBlockEditor } from '@/hooks/useBlockEditor';
import { blocksToHtml } from '@/lib/blocks';
import BlockPalette from './BlockPalette';
import BlockInspector from './BlockInspector';
import styles from '@/styles/BlockEditor.module.css';

export default function BlockEditor({
  initialBlocks,
  onChange,
}: {
  initialBlocks: Block[];
  onChange: (blocks: Block[]) => void;
}) {
  const { blocks, addBlock, updateBlock, removeBlock, moveBlock } =
    useBlockEditor(initialBlocks);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialBlocks[0]?.id ?? null
  );

  // Stable callback ref so parent doesn't need to memoize onChange.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  useEffect(() => {
    onChangeRef.current(blocks);
  }, [blocks]);

  const selected = blocks.find((b) => b.id === selectedId) || null;
  const preview = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:720px;margin:0 auto;padding:32px 20px;line-height:1.6;color:#333}.block-hero h1{font-size:32px;margin:0 0 8px}.block-button a{display:inline-block;background:#000;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none}img{max-width:100%}hr{border:none;border-top:1px solid #eaeaea;margin:24px 0}</style></head><body>${blocksToHtml(
    blocks
  )}</body></html>`;

  return (
    <div className={styles.editor}>
      <div className={styles.left}>
        <BlockPalette onAdd={addBlock} />
        <div className={styles.list}>
          {blocks.length === 0 ? (
            <p className={styles.empty}>Add a block to start building.</p>
          ) : (
            blocks.map((b, i) => (
              <div
                key={b.id}
                className={`${styles.row} ${b.id === selectedId ? styles.rowActive : ''}`}
                onClick={() => setSelectedId(b.id)}
              >
                <GripVertical size={14} className={styles.grip} />
                <span className={styles.rowLabel}>{BLOCK_LABELS[b.type]}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBlock(i, Math.max(0, i - 1));
                  }}
                  disabled={i === 0}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBlock(i, Math.min(blocks.length - 1, i + 1));
                  }}
                  disabled={i === blocks.length - 1}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBlock(b.id);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
        {selected && (
          <BlockInspector
            block={selected}
            onChange={(patch) => updateBlock(selected.id, patch)}
          />
        )}
      </div>
      <div className={styles.right}>
        <div className={styles.previewLabel}>Live preview</div>
        <iframe className={styles.preview} sandbox="" srcDoc={preview} title="Block preview" />
      </div>
    </div>
  );
}
