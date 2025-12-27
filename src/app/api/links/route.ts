import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, resolveOrgId } from '@/lib/api-auth';
import { getDb } from '@/lib/mongodb';
import { ShortLink } from '@/lib/models';

// GET all short links for authenticated user
export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const orgId = await resolveOrgId(request, auth.userId);
    const filter = orgId ? { orgId } : { userId: auth.userId };

    const db = await getDb();
    const links = await db
      .collection<ShortLink>('short_links')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching short links:', error);
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}

// POST create new short link
export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const orgId = await resolveOrgId(request, auth.userId);

    const { slug, targetUrl, title, description } = await request.json();

    if (!slug || !targetUrl) {
      return NextResponse.json(
        { error: 'Slug and target URL are required' },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric, hyphens, underscores)
    if (!/^[a-z0-9-_]+$/i.test(slug)) {
      return NextResponse.json(
        { error: 'Slug can only contain letters, numbers, hyphens, and underscores' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid target URL' }, { status: 400 });
    }

    const db = await getDb();

    // Check if slug already exists
    const existing = await db
      .collection<ShortLink>('short_links')
      .findOne({ slug: slug.toLowerCase() });

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const newLink: ShortLink = {
      slug: slug.toLowerCase(),
      targetUrl,
      userId: auth.userId,
      orgId: orgId || undefined,
      clicks: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        title,
        description,
      },
    };

    const result = await db.collection<ShortLink>('short_links').insertOne(newLink);

    return NextResponse.json({
      link: { ...newLink, _id: result.insertedId.toString() },
    });
  } catch (error) {
    console.error('Error creating short link:', error);
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
}

