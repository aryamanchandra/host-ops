import { defaultSchema } from 'rehype-sanitize';
import type { ContentFormat } from '@/types/blocks';

/**
 * rehype-sanitize allowlist for markdown output. Starts from the safe
 * default schema (which already drops <script> and event handlers) and is
 * kept here so the rule set is centralized and tunable.
 */
export const markdownSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || [])],
  attributes: {
    ...defaultSchema.attributes,
  },
};

export function isMarkdown(format?: ContentFormat | string): boolean {
  return format === 'markdown';
}

/** Normalize an unknown content-format value to a supported one. */
export function normalizeContentFormat(value?: string): ContentFormat {
  if (value === 'blocks' || value === 'markdown') return value;
  return 'html';
}
