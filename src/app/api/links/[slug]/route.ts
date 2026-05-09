import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hashPassword } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ShortLink } from '@/lib/models';

// GET single short link
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await getDb();
    const link = await db
      .collection<ShortLink>('short_links')
      .findOne(
        { slug: params.slug, userId: decoded.userId },
        { projection: { passwordHash: 0 } }
      );

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ link });
  } catch (error) {
    console.error('Error fetching short link:', error);
    return NextResponse.json({ error: 'Failed to fetch link' }, { status: 500 });
  }
}

// PUT update short link
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { targetUrl, isActive, title, description, expiresAt, password } =
      await request.json();

    if (!targetUrl) {
      return NextResponse.json({ error: 'Target URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid target URL' }, { status: 400 });
    }

    const db = await getDb();

    const set: Record<string, any> = {
      targetUrl,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date(),
      'metadata.title': title,
      'metadata.description': description,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    };
    // Only (re)set the password when a new one is provided.
    if (password) set.passwordHash = await hashPassword(password);

    const result = await db.collection<ShortLink>('short_links').findOneAndUpdate(
      { slug: params.slug, userId: decoded.userId },
      { $set: set },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    const { passwordHash, ...safe } = result as any;
    return NextResponse.json({ link: safe });
  } catch (error) {
    console.error('Error updating short link:', error);
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
  }
}

// DELETE short link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await getDb();

    const result = await db
      .collection<ShortLink>('short_links')
      .deleteOne({ slug: params.slug, userId: decoded.userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting short link:', error);
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}

