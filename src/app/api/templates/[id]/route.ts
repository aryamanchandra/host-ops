import { NextResponse } from 'next/server';
import { getTemplateById } from '@/lib/templates';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const template = getTemplateById(params.id);
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }
  return NextResponse.json({ template });
}
