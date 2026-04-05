import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';
import { FormSubmission } from './models';
import type { FormSchema } from '@/types/form';

let indexesEnsured = false;

export async function ensureFormIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const db = await getDb();
  await db
    .collection('form_submissions')
    .createIndex({ subdomain: 1, ownerId: 1, createdAt: -1 });
  await db.collection('form_submissions').createIndex({ ownerId: 1, isRead: 1 });
  await db
    .collection('form_submissions')
    .createIndex({ subdomain: 1, ip: 1, createdAt: -1 });
  indexesEnsured = true;
}

/** Validate submitted data against a form schema. Returns an error or null. */
export function validateSubmission(
  schema: FormSchema,
  data: Record<string, any>
): string | null {
  for (const f of schema.fields) {
    const v = data[f.key];
    if (f.required && (v === undefined || v === null || v === '')) {
      return `${f.label} is required`;
    }
    if (f.type === 'email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v))) {
      return `${f.label} must be a valid email`;
    }
  }
  return null;
}

export async function createSubmission(sub: FormSubmission): Promise<string> {
  const db = await getDb();
  await ensureFormIndexes();
  const res = await db.collection('form_submissions').insertOne(sub as any);
  return res.insertedId.toString();
}

export async function listSubmissions(subdomain: string, ownerId: string) {
  const db = await getDb();
  const rows = await db
    .collection('form_submissions')
    .find({ subdomain, ownerId })
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();
  return rows.map((r: any) => ({
    ...r,
    _id: r._id.toString(),
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  }));
}

export async function recentSubmissionCount(
  subdomain: string,
  ip: string,
  windowMs: number
): Promise<number> {
  const db = await getDb();
  return db.collection('form_submissions').countDocuments({
    subdomain,
    ip,
    createdAt: { $gte: new Date(Date.now() - windowMs) },
  });
}

export async function markRead(id: string, ownerId: string): Promise<void> {
  const db = await getDb();
  try {
    await db
      .collection('form_submissions')
      .updateOne({ _id: new ObjectId(id), ownerId }, { $set: { isRead: true } });
  } catch {
    // invalid id — ignore
  }
}

function csvCell(v: any): string {
  const s = Array.isArray(v) ? v.join('; ') : String(v ?? '');
  return `"${s.replace(/"/g, '""')}"`;
}

/** Render submissions to CSV (columns taken from the first row's data). */
export function toCsv(rows: Array<{ data: Record<string, any>; createdAt: string }>): string {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0].data);
  const lines = [['createdAt', ...cols].join(',')];
  for (const r of rows) {
    lines.push([r.createdAt, ...cols.map((c) => csvCell(r.data[c]))].join(','));
  }
  return lines.join('\n');
}
