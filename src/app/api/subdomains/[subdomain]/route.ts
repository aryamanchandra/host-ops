import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Subdomain } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { blocksToHtml } from '@/lib/blocks';
import { normalizeContentFormat } from '@/lib/markdown';
import { snapshotVersion } from '@/lib/versions';
import { validateWindow } from '@/lib/schedule';

// GET specific subdomain
export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const db = await getDb();
    const subdomain = await db
      .collection<Subdomain>('subdomains')
      .findOne({ subdomain: params.subdomain });

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ subdomain });
  } catch (error) {
    console.error('Error fetching subdomain:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subdomain' },
      { status: 500 }
    );
  }
}

// PUT update subdomain
export async function PUT(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    // Check authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, content, customCss, isActive, metadata, contentFormat, blocks } = body;

    const db = await getDb();

    const updateData: Partial<Subdomain> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (contentFormat !== undefined) updateData.contentFormat = normalizeContentFormat(contentFormat);
    if (blocks !== undefined) updateData.blocks = blocks;
    // Keep the server-derived HTML content in sync with the blocks.
    if (contentFormat === 'blocks' && Array.isArray(blocks)) {
      updateData.content = blocksToHtml(blocks);
    } else if (content !== undefined) {
      updateData.content = content;
    }
    if (customCss !== undefined) updateData.customCss = customCss;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (metadata !== undefined) updateData.metadata = metadata;

    if (body.publishAt !== undefined || body.unpublishAt !== undefined) {
      const windowError = validateWindow(body.publishAt, body.unpublishAt);
      if (windowError) {
        return NextResponse.json({ error: windowError }, { status: 400 });
      }
      if (body.publishAt !== undefined) {
        updateData.publishAt = body.publishAt ? new Date(body.publishAt) : null;
      }
      if (body.unpublishAt !== undefined) {
        updateData.unpublishAt = body.unpublishAt ? new Date(body.unpublishAt) : null;
      }
    }

    // Snapshot the current state into version history and mark the edit as a
    // draft (the published page keeps serving publishedContent until publish).
    const current = await db
      .collection<Subdomain>('subdomains')
      .findOne({ subdomain: params.subdomain, userId: decoded.userId });
    if (current) {
      const changed =
        (updateData.content !== undefined && updateData.content !== current.content) ||
        (updateData.title !== undefined && updateData.title !== current.title) ||
        (updateData.description !== undefined && updateData.description !== current.description) ||
        (updateData.customCss !== undefined && updateData.customCss !== current.customCss);
      if (changed) {
        await snapshotVersion(current, 'edit', {
          id: decoded.userId,
          name: decoded.username,
        });
        updateData.status = 'draft';
        updateData.version = (current.version || 1) + 1;
      }
    }

    const result = await db.collection('subdomains').findOneAndUpdate(
      { subdomain: params.subdomain, userId: decoded.userId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Subdomain not found or you do not have permission to update it' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subdomain: result,
    });
  } catch (error) {
    console.error('Error updating subdomain:', error);
    return NextResponse.json(
      { error: 'Failed to update subdomain' },
      { status: 500 }
    );
  }
}

// DELETE subdomain
export async function DELETE(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    // Check authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const result = await db
      .collection('subdomains')
      .deleteOne({ subdomain: params.subdomain, userId: decoded.userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Subdomain not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subdomain deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting subdomain:', error);
    return NextResponse.json(
      { error: 'Failed to delete subdomain' },
      { status: 500 }
    );
  }
}

