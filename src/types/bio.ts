export interface BioLink {
  label: string;
  url: string;
  order: number;
}

export interface BioProfile {
  _id?: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  accentColor?: string;
  links: BioLink[];
  isPublic: boolean;
}
