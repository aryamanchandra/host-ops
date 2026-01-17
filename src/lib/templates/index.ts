/**
 * Template registry.
 *
 * Each template in `./data` is a `Template`:
 *   - id:          unique kebab-case identifier (used in URLs / provenance)
 *   - name:        display name
 *   - category:    one of TemplateCategory (landing | link-in-bio | …)
 *   - description: one-line summary shown on the card
 *   - tags:        string[] keywords
 *   - content:     HTML rendered on the public subdomain page
 *   - customCss:   optional CSS injected alongside the content
 *
 * Templates are bundled (no DB). To add one, append to TEMPLATES in ./data.
 */
import type { Template } from '@/types/template';
import { TEMPLATES } from './data';

export function getAllTemplates(): Template[] {
  return TEMPLATES;
}

export function getTemplateById(id: string): Template | null {
  return TEMPLATES.find((t) => t.id === id) || null;
}
