export interface Utm {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface ShortLink {
  _id: string;
  slug: string;
  targetUrl: string;
  clicks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  metadata?: {
    title?: string;
    description?: string;
    utm?: Utm;
  };
}

export interface LinkFormData {
  slug: string;
  targetUrl: string;
  title: string;
  description: string;
  expiresAt?: string;
  password?: string;
  utm?: Utm;
}

