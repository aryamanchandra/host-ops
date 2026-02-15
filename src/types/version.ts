import type { Block, ContentFormat } from './blocks';

export type VersionReason = 'create' | 'edit' | 'restore' | 'publish';

export interface SubdomainVersion {
  _id?: string;
  subdomain: string;
  userId: string; // owner (attribution)
  version: number;
  title: string;
  description: string;
  content: string;
  customCss?: string;
  contentFormat?: ContentFormat;
  blocks?: Block[];
  status: 'draft' | 'published';
  authorId: string;
  authorName?: string;
  reason: VersionReason;
  createdAt: string | Date;
}

export interface VersionView extends Omit<SubdomainVersion, '_id' | 'createdAt'> {
  _id: string;
  createdAt: string;
}
