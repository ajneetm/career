import { readFile } from 'fs/promises';
import path from 'path';

import { NextResponse } from 'next/server';

import { fallbackNavigationItems, type NavigationItemDTO } from '@/lib/navigation-fallback';

function isValidNavPayload(data: unknown): data is NavigationItemDTO[] {
  if (!Array.isArray(data) || data.length === 0) return false;
  return data.every(
    (row) =>
      row &&
      typeof row === 'object' &&
      typeof (row as NavigationItemDTO).href === 'string' &&
      typeof (row as NavigationItemDTO).labelEn === 'string' &&
      typeof (row as NavigationItemDTO).labelAr === 'string',
  );
}

/** يقرأ `data/navigation.json` إن وُجد (مخرجات لوحة التحكم)، وإلا يرجع الروابط الافتراضية */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'navigation.json');
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (isValidNavPayload(parsed)) {
      return NextResponse.json(
        [...parsed].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
      );
    }
  } catch {
    /* ملف غير موجود أو JSON غير صالح */
  }
  return NextResponse.json(fallbackNavigationItems);
}
