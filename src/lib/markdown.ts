import { defaultSchema } from 'rehype-sanitize';
import type { ContentFormat } from '@/types/blocks';

/**
 * rehype-sanitize allowlist for markdown output. Starts from the safe
 * default schema (which already drops <script> and event handlers) and is
 * kept here so the rule set is centralized and tunable.
 */
export const markdownSanitizeSchema = {
  ...defaultSchema,
  // Never allow <script> in rendered markdown.
  tagNames: (defaultSchema.tagNames || []).filter((t) => t !== 'script'),
  attributes: {
    ...defaultSchema.attributes,
  },
  // Strip inline event-handler attributes (onclick, onerror, …) and
  // javascript: URLs via the default protocol allowlist.
  clobber: [],
  clobberPrefix: 'user-content-',
};

// Defensive secondary pass: drop any on* attribute that slips through.
export function stripEventHandlers(html: string): string {
  return html.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

export function isMarkdown(format?: ContentFormat | string): boolean {
  return format === 'markdown';
}

/** Normalize an unknown content-format value to a supported one. */
export function normalizeContentFormat(value?: string): ContentFormat {
  if (value === 'blocks' || value === 'markdown') return value;
  return 'html';
}
