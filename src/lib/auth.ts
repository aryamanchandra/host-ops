import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from './mongodb';
import { User } from './models';
import { createPersonalOrg } from './orgs';

const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required but not set');
  }
  return secret;
})();

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: {
  userId?: string;
  username: string;
  orgId?: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getUser(username: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.collection<User>('users').findOne({ username });
  return user;
}

export async function createUser(
  username: string, 
  password: string, 
  role: 'admin' | 'user' = 'user',
  oauthData?: {
    email?: string;
    name?: string;
    picture?: string;
    googleId?: string;
  }
): Promise<User> {
  const db = await getDb();
  const hashedPassword = password ? await hashPassword(password) : '';
  
  const user: any = {
    username,
    password: hashedPassword,
    role,
    createdAt: new Date(),
    ...oauthData,
  };

  const result = await db.collection('users').insertOne(user as any);
  const userId = result.insertedId.toString();

  // Bootstrap a personal organization so the user always has a workspace.
  const org = await createPersonalOrg({
    _id: userId,
    name: user.name,
    username,
    email: user.email,
  });
  await db
    .collection('users')
    .updateOne({ _id: result.insertedId }, { $set: { defaultOrgId: org._id } });
  user._id = userId;
  user.defaultOrgId = org._id;

  return user;
}

export async function findOrCreateOAuthUser(
  email: string,
  userData: {
    name?: string;
    picture?: string;
    googleId: string;
  }
): Promise<User> {
  const db = await getDb();
  
  // Try to find user by googleId first
  let user = await db.collection<User>('users').findOne({ googleId: userData.googleId });
  
  if (!user) {
    // Try to find by email
    user = await db.collection<User>('users').findOne({ email });
    
    if (!user) {
      // Create new user
      const newUser: any = {
        username: email,
        email,
        name: userData.name,
        picture: userData.picture,
        googleId: userData.googleId,
        password: '', // No password for OAuth users
        role: 'user' as const,
        createdAt: new Date(),
      };

      const inserted = await db.collection('users').insertOne(newUser as any);
      const newId = inserted.insertedId.toString();
      const org = await createPersonalOrg({
        _id: newId,
        name: userData.name,
        username: email,
        email,
      });
      await db
        .collection('users')
        .updateOne({ _id: inserted.insertedId }, { $set: { defaultOrgId: org._id } });
      newUser._id = newId;
      newUser.defaultOrgId = org._id;
      return newUser as User;
    } else {
      // Update existing user with Google ID
      await db.collection('users').updateOne(
        { email },
        { 
          $set: { 
            googleId: userData.googleId,
            picture: userData.picture,
            name: userData.name || user.name,
          }
        }
      );
      user.googleId = userData.googleId;
    }
  }
  
  return user;
}

