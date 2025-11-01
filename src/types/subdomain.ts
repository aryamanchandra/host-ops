export interface SubdomainMetadata {
  author?: string;
  tags?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  [key: string]: any;
}

export interface Subdomain {
  _id: string;
  subdomain: string;
  title: string;
  description: string;
  content: string;
  customCss?: string;
  isActive: boolean;
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

