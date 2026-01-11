import { NextResponse } from 'next/server';
import { getAllTemplates } from '@/lib/templates';

// Public catalog of starter templates (static, bundled).
export async function GET() {
  return NextResponse.json({ templates: getAllTemplates() });
}
