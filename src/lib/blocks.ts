import type { Block } from '@/types/blocks';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Serialize a single block to HTML. */
export function blockToHtml(b: Block): string {
  switch (b.type) {
    case 'hero':
      return `<header class="block-hero"><h1>${esc(b.heading)}</h1>${
        b.subheading ? `<p>${esc(b.subheading)}</p>` : ''
      }</header>`;
    case 'text':
      return `<div class="block-text">${b.html}</div>`;
    case 'image':
      return `<img class="block-image" src="${esc(b.src)}" alt="${esc(b.alt || '')}" />`;
    case 'button':
      return `<p class="block-button"><a href="${esc(b.href)}">${esc(b.label)}</a></p>`;
    case 'divider':
      return `<hr class="block-divider" />`;
    case 'embed':
      return `<div class="block-embed">${b.html}</div>`;
    default:
      return '';
  }
}

/** Serialize an ordered list of blocks into the page HTML. Isomorphic. */
export function blocksToHtml(blocks: Block[]): string {
  return blocks.map(blockToHtml).join('\n');
}

/** Wrap legacy raw-HTML content as a single embed block. */
export function legacyHtmlToBlocks(html: string): Block[] {
  return [{ id: 'legacy', type: 'embed', html }];
}
