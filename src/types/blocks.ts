export type BlockType = 'hero' | 'text' | 'image' | 'button' | 'divider' | 'embed';

export type ContentFormat = 'html' | 'blocks' | 'markdown';

interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeroBlock extends BaseBlock {
  type: 'hero';
  heading: string;
  subheading?: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  html: string;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt?: string;
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  label: string;
  href: string;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
}

export interface EmbedBlock extends BaseBlock {
  type: 'embed';
  html: string;
}

export type Block =
  | HeroBlock
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | DividerBlock
  | EmbedBlock;

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: 'Hero',
  text: 'Text',
  image: 'Image',
  button: 'Button',
  divider: 'Divider',
  embed: 'Embed',
};
