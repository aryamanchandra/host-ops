import type { Block } from '@/types/blocks';
import { sanitizeHtml } from '@/lib/sanitize';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Allow only safe URL schemes (http/https/mailto/tel) or site-relative paths.
 * Returns an empty string for anything else (e.g. javascript: URIs).
 */
function safeUrl(url: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (/^\/[^/]/.test(trimmed) || trimmed.startsWith('/')) return trimmed;
  if (/^[a-z]+:/i.test(trimmed)) return ''; // reject other schemes
  return trimmed;
}

/** Serialize a single block to HTML. */
export function blockToHtml(b: Block): string {
  switch (b.type) {
    case 'hero':
      return `<header class="block-hero"><h1>${esc(b.heading)}</h1>${
        b.subheading ? `<p>${esc(b.subheading)}</p>` : ''
      }</header>`;
    case 'text':
      return `<div class="block-text">${sanitizeHtml(b.html)}</div>`;
    case 'image': {
      const src = safeUrl(b.src);
      return src
        ? `<img class="block-image" src="${esc(src)}" alt="${esc(b.alt || '')}" />`
        : '';
    }
    case 'button':
      return `<p class="block-button"><a href="${esc(safeUrl(b.href) || '#')}">${esc(
        b.label
      )}</a></p>`;
    case 'divider':
      return `<hr class="block-divider" />`;
    case 'embed':
      return `<div class="block-embed">${sanitizeHtml(b.html)}</div>`;
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
