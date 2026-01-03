export type TemplateCategory =
  | 'landing'
  | 'link-in-bio'
  | 'coming-soon'
  | 'docs'
  | 'portfolio';

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  thumbnail?: string;
  tags: string[];
  content: string; // HTML
  customCss?: string;
}

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'landing', label: 'Landing' },
  { value: 'link-in-bio', label: 'Link in Bio' },
  { value: 'coming-soon', label: 'Coming Soon' },
  { value: 'docs', label: 'Docs' },
  { value: 'portfolio', label: 'Portfolio' },
];
