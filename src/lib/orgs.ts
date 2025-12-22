import { ObjectId } from 'mongodb';
import { randomBytes } from 'crypto';
import { getDb } from './mongodb';
import {
  Organization,
  OrgMember,
  OrgInvite,
  OrgRole,
} from './models';

let indexesEnsured = false;

export async function ensureOrgIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const db = await getDb();
  await db.collection('organizations').createIndex({ slug: 1 }, { unique: true });
  await db.collection('org_members').createIndex({ orgId: 1, userId: 1 }, { unique: true });
  await db.collection('org_members').createIndex({ userId: 1 });
  await db.collection('org_invites').createIndex({ token: 1 }, { unique: true });
  await db.collection('org_invites').createIndex({ orgId: 1, status: 1 });
  indexesEnsured = true;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'org'
  );
}

export async function createOrganization(
  name: string,
  ownerId: string,
  isPersonal = false
): Promise<Organization & { _id: string }> {
  const db = await getDb();
  await ensureOrgIndexes();

  const base = slugify(name);
  let slug = base;
  let n = 1;
  while (await db.collection('organizations').findOne({ slug })) {
    slug = `${base}-${n++}`;
  }

  const now = new Date();
  const org = { name, slug, ownerId, isPersonal, createdAt: now, updatedAt: now };
  const res = await db.collection('organizations').insertOne(org as any);
  const orgId = res.insertedId.toString();

  await db.collection('org_members').insertOne({
    orgId,
    userId: ownerId,
    role: 'owner' as OrgRole,
    createdAt: now,
  } as any);

  return { ...org, _id: orgId };
}

export async function createPersonalOrg(user: {
  _id?: any;
  name?: string;
  username?: string;
  email?: string;
}): Promise<Organization & { _id: string }> {
  const ownerId = String(user._id);
  const label = user.name || user.username || user.email || 'Personal';
  return createOrganization(`${label}'s Workspace`, ownerId, true);
}

export async function getUserOrgs(
  userId: string
): Promise<Array<Organization & { _id: string; role: OrgRole }>> {
  const db = await getDb();
  const memberships = await db
    .collection<OrgMember>('org_members')
    .find({ userId })
    .toArray();
  if (memberships.length === 0) return [];

  const orgIds = memberships
    .map((m) => {
      try {
        return new ObjectId(m.orgId);
      } catch {
        return null;
      }
    })
    .filter(Boolean) as ObjectId[];

  const orgs = await db
    .collection('organizations')
    .find({ _id: { $in: orgIds } })
    .toArray();
  const roleByOrg = new Map(memberships.map((m) => [m.orgId, m.role]));

  return orgs.map((o: any) => ({
    ...o,
    _id: o._id.toString(),
    role: roleByOrg.get(o._id.toString()) || 'member',
  }));
}

export async function getMembership(
  orgId: string,
  userId: string
): Promise<OrgMember | null> {
  const db = await getDb();
  return db.collection<OrgMember>('org_members').findOne({ orgId, userId });
}

export async function getOrgMembers(orgId: string) {
  const db = await getDb();
  const members = await db
    .collection<OrgMember>('org_members')
    .find({ orgId })
    .toArray();

  const userIds = members
    .map((m) => {
      try {
        return new ObjectId(m.userId);
      } catch {
        return null;
      }
    })
    .filter(Boolean) as ObjectId[];

  const users = await db
    .collection('users')
    .find({ _id: { $in: userIds } })
    .toArray();
  const byId = new Map(users.map((u: any) => [u._id.toString(), u]));

  return members.map((m: any) => {
    const u = byId.get(m.userId);
    return {
      _id: m._id?.toString(),
      userId: m.userId,
      email: u?.email,
      name: u?.name || u?.username,
      role: m.role as OrgRole,
    };
  });
}

export async function countOwners(orgId: string): Promise<number> {
  const db = await getDb();
  return db.collection('org_members').countDocuments({ orgId, role: 'owner' });
}

export async function removeMember(orgId: string, userId: string): Promise<void> {
  const db = await getDb();
  await db.collection('org_members').deleteOne({ orgId, userId });
}

export async function setMemberRole(
  orgId: string,
  userId: string,
  role: OrgRole
): Promise<void> {
  const db = await getDb();
  await db.collection('org_members').updateOne({ orgId, userId }, { $set: { role } });
}

export async function createInvite(
  orgId: string,
  email: string,
  role: OrgRole,
  invitedBy: string
): Promise<OrgInvite & { _id: string }> {
  const db = await getDb();
  await ensureOrgIndexes();
  const token = randomBytes(24).toString('hex');
  const now = new Date();
  const invite = {
    orgId,
    email: email.toLowerCase(),
    role,
    token,
    invitedBy,
    status: 'pending' as const,
    createdAt: now,
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
  };
  const res = await db.collection('org_invites').insertOne(invite as any);
  return { ...invite, _id: res.insertedId.toString() };
}

export async function getOrgInvites(orgId: string) {
  const db = await getDb();
  return db
    .collection<OrgInvite>('org_invites')
    .find({ orgId, status: 'pending' })
    .toArray();
}

export async function getInviteByToken(token: string): Promise<OrgInvite | null> {
  const db = await getDb();
  return db.collection<OrgInvite>('org_invites').findOne({ token });
}

export async function acceptInvite(
  token: string,
  userId: string
): Promise<{ orgId: string } | null> {
  const db = await getDb();
  const invite = await db.collection<OrgInvite>('org_invites').findOne({ token });
  if (!invite || invite.status !== 'pending') return null;
  if (invite.expiresAt < new Date()) {
    await db.collection('org_invites').updateOne({ token }, { $set: { status: 'expired' } });
    return null;
  }

  await db.collection('org_members').updateOne(
    { orgId: invite.orgId, userId },
    { $setOnInsert: { orgId: invite.orgId, userId, role: invite.role, createdAt: new Date() } },
    { upsert: true }
  );
  await db.collection('org_invites').updateOne({ token }, { $set: { status: 'accepted' } });
  return { orgId: invite.orgId };
}
