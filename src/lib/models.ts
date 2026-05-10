import type { Block, ContentFormat } from '@/types/blocks';
import type { FormSchema } from '@/types/form';

export interface Subdomain {
  _id?: string;
  subdomain: string; // e.g., "blog", "shop", "docs"
  title: string;
  description: string;
  content: string; // HTML content (source of truth for the public page)
  contentFormat?: ContentFormat; // how `content` was authored
  blocks?: Block[]; // structured blocks when contentFormat === 'blocks'
  customCss?: string;
  status?: 'draft' | 'published'; // editing lifecycle
  version?: number; // increments on each saved edit
  publishedContent?: {
    title: string;
    description: string;
    content: string;
    customCss?: string;
    contentFormat?: ContentFormat;
    blocks?: Block[];
    publishedAt: Date;
  };
  userId: string; // User who created this subdomain (attribution)
  orgId?: string; // Owning organization (multi-tenant scoping)
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  type?: 'page' | 'redirect'; // page hosts content; redirect bounces elsewhere
  redirectUrl?: string; // destination when type === 'redirect'
  redirectType?: 301 | 302; // permanent or temporary
  publishAt?: Date | null; // go live at this time
  unpublishAt?: Date | null; // take down at this time
  lastScheduledFlipAt?: Date; // when the scheduler last flipped isActive
  form?: FormSchema; // optional embedded contact form
  metadata?: {
    author?: string;
    tags?: string[];
    ogImage?: string; // social share image URL
    canonicalUrl?: string; // override canonical URL
    noindex?: boolean; // ask crawlers not to index
    [key: string]: any;
  };
}

export type MonitorStatus = 'up' | 'down' | 'degraded' | 'unknown';

export interface SslInfo {
  issuer?: string;
  validTo?: Date | string;
  daysLeft?: number;
  valid?: boolean;
}

export interface Monitor {
  _id?: string;
  userId: string;
  subdomain?: string; // optional link to a subdomain
  host: string; // FQDN probed
  targetUrl: string;
  intervalMinutes: number;
  certWarnDays: number;
  isActive: boolean;
  lastStatus: MonitorStatus;
  lastCheckedAt?: Date;
  lastResponseMs?: number;
  lastSsl?: SslInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonitorCheck {
  _id?: string;
  monitorId: string;
  host: string;
  statusCode?: number;
  responseTimeMs?: number;
  status: MonitorStatus;
  ssl?: SslInfo | null;
  error?: string;
  checkedAt: Date;
}

export interface MonitorAlert {
  _id?: string;
  monitorId: string;
  userId: string;
  type: 'down' | 'cert-expiring' | 'recovered';
  message: string;
  certDaysLeft?: number;
  createdAt: Date;
  notifiedVia: 'email' | 'log' | 'none';
}

export interface FormSubmission {
  _id?: string;
  subdomain: string;
  ownerId: string; // subdomain.userId
  data: Record<string, string | string[]>;
  ip?: string;
  userAgent?: string;
  referer?: string;
  isRead: boolean;
  createdAt: Date;
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
  expiresAt?: Date | null;
  passwordHash?: string; // bcrypt; never returned to clients
  metadata?: {
    title?: string;
    description?: string;
    utm?: {
      source?: string;
      medium?: string;
      campaign?: string;
      term?: string;
      content?: string;
    };
    [key: string]: any;
  };
}

export interface BioProfile {
  _id?: string;
  userId: string;
  username: string; // lowercased; used in the public URL
  displayName: string;
  avatar?: string;
  bio?: string;
  accentColor?: string;
  links: Array<{ label: string; url: string; order: number }>;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
