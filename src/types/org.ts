export type OrgRole = 'owner' | 'admin' | 'member';

export interface Org {
  _id: string;
  name: string;
  slug: string;
  isPersonal: boolean;
  role?: OrgRole; // current user's role in this org
}

export interface OrgMemberView {
  _id?: string;
  userId: string;
  email?: string;
  name?: string;
  role: OrgRole;
}

export interface OrgInviteView {
  _id: string;
  email: string;
  role: OrgRole;
  status: string;
  createdAt: string;
}
