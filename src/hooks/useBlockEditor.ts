import { useReducer, useCallback } from 'react';
import type { Block, BlockType } from '@/types/blocks';

type Action =
  | { type: 'set'; blocks: Block[] }
  | { type: 'add'; block: Block }
  | { type: 'update'; id: string; patch: Partial<Block> }
  | { type: 'remove'; id: string }
  | { type: 'move'; from: number; to: number };

function reducer(state: Block[], action: Action): Block[] {
  switch (action.type) {
    case 'set':
      return action.blocks;
    case 'add':
      return [...state, action.block];
    case 'update':
      return state.map((b) =>
        b.id === action.id ? ({ ...b, ...action.patch } as Block) : b
      );
    case 'remove':
      return state.filter((b) => b.id !== action.id);
    case 'move': {
      const arr = [...state];
      const [moved] = arr.splice(action.from, 1);
      if (moved) arr.splice(action.to, 0, moved);
      return arr;
    }
    default:
      return state;
  }
}

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `b-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function newBlock(type: BlockType): Block {
  const id = genId();
  switch (type) {
    case 'hero':
      return { id, type, heading: 'Heading', subheading: '' };
    case 'text':
      return { id, type, html: '<p>Your text…</p>' };
    case 'image':
      return { id, type, src: '', alt: '' };
    case 'button':
      return { id, type, label: 'Click me', href: '' };
    case 'divider':
      return { id, type };
    case 'embed':
      return { id, type, html: '' };
    default:
      return { id, type: 'divider' };
  }
}

export function useBlockEditor(initial: Block[]) {
  const [blocks, dispatch] = useReducer(reducer, initial);

  const addBlock = useCallback(
    (type: BlockType) => dispatch({ type: 'add', block: newBlock(type) }),
    []
  );
  const updateBlock = useCallback(
    (id: string, patch: Partial<Block>) => dispatch({ type: 'update', id, patch }),
    []
  );
  const removeBlock = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const moveBlock = useCallback(
    (from: number, to: number) => dispatch({ type: 'move', from, to }),
    []
  );
  const setBlocks = useCallback((b: Block[]) => dispatch({ type: 'set', blocks: b }), []);

  return { blocks, addBlock, updateBlock, removeBlock, moveBlock, setBlocks };
}
