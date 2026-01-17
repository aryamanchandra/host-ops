import type { Block, ContentFormat } from '@/types/blocks';

export interface Subdomain {
  _id?: string;
  subdomain: string; // e.g., "blog", "shop", "docs"
  title: string;
  description: string;
  content: string; // HTML content (source of truth for the public page)
  contentFormat?: ContentFormat; // how `content` was authored
  blocks?: Block[]; // structured blocks when contentFormat === 'blocks'
  customCss?: string;
  userId: string; // User who created this subdomain (attribution)
  orgId?: string; // Owning organization (multi-tenant scoping)
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  metadata?: {
    author?: string;
    tags?: string[];
    ogImage?: string; // social share image URL
    canonicalUrl?: string; // override canonical URL
    noindex?: boolean; // ask crawlers not to index
    [key: string]: any;
  };
}

export interface User {
  _id?: string;
  username: string;
  email?: string;
  name?: string;
  picture?: string;
  googleId?: string;
  password: string; // hashed (optional for OAuth users)
  role: 'admin' | 'user';
  defaultOrgId?: string; // org selected by default after login
  createdAt: Date;
}

// --- Multi-tenant scaffolding (populated by the team/multi-tenant feature) ---

export type OrgRole = 'owner' | 'admin' | 'member';

export interface Organization {
  _id?: string;
  name: string;
  slug: string; // unique, used in URLs
  ownerId: string;
  isPersonal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgMember {
  _id?: string;
  orgId: string;
  userId: string;
  role: OrgRole;
  createdAt: Date;
}

export type OrgInviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export interface OrgInvite {
  _id?: string;
  orgId: string;
  email: string; // lowercased
  role: OrgRole;
  token: string;
  invitedBy: string;
  status: OrgInviteStatus;
  createdAt: Date;
  expiresAt: Date;
}

export interface ShortLink {
  _id?: string;
  slug: string; // e.g., "test", "promo"
  targetUrl: string; // Full URL to redirect to
  userId: string; // User who created this link (attribution)
  orgId?: string; // Owning organization (multi-tenant scoping)
  clicks: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  metadata?: {
    title?: string;
    description?: string;
    [key: string]: any;
  };
}
