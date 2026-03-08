export interface SubdomainMetadata {
  author?: string;
  tags?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  [key: string]: any;
}

import type { Block, ContentFormat } from '@/types/blocks';

export interface Subdomain {
  _id: string;
  subdomain: string;
  title: string;
  description: string;
  content: string;
  contentFormat?: ContentFormat;
  blocks?: Block[];
  customCss?: string;
  isActive: boolean;
  status?: 'draft' | 'published';
  version?: number;
  publishAt?: string | null;
  unpublishAt?: string | null;
  metadata?: SubdomainMetadata;
}

export interface SubdomainData {
  subdomain: string;
  title: string;
  description: string;
  content: string;
  customCss?: string;
  isActive: boolean;
  metadata?: SubdomainMetadata;
}

