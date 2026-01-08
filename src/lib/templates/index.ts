import type { Template } from '@/types/template';
import { TEMPLATES } from './data';

export function getAllTemplates(): Template[] {
  return TEMPLATES;
}

export function getTemplateById(id: string): Template | null {
  return TEMPLATES.find((t) => t.id === id) || null;
}
