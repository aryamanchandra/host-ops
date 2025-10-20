import DOMPurify from 'isomorphic-dompurify';

export interface SanitizeOptions {
  /** Override the default allowed tag list. */
  allowedTags?: string[];
  /** Override the default allowed attribute list. */
  allowedAttrs?: string[];
}

/**
 * Sanitize untrusted HTML for safe rendering on both server and client.
 * Used wherever author- or visitor-supplied content reaches the DOM
 * (subdomain pages, page-builder blocks, markdown output, form fields).
 *
 * Defaults strip <script>, event handlers, and javascript: URIs while
 * keeping common formatting/structure tags.
 */
export function sanitizeHtml(dirty: string, options?: SanitizeOptions): string {
  if (!dirty) return '';

  const config: Record<string, unknown> = {
    USE_PROFILES: { html: true },
    // Block inline event handlers and javascript:/data: vectors explicitly.
    FORBID_ATTR: ['style'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  };

  if (options?.allowedTags) config.ALLOWED_TAGS = options.allowedTags;
  if (options?.allowedAttrs) config.ALLOWED_ATTR = options.allowedAttrs;

  return DOMPurify.sanitize(dirty, config) as unknown as string;
}

/** Strip ALL HTML, returning plain text only. */
export function sanitizeToText(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) as unknown as string;
}
