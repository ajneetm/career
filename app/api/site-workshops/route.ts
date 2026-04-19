import { readFile } from 'fs/promises';
import path from 'path';

import { NextResponse } from 'next/server';

import type { SiteWorkshopDTO } from '@/lib/site-workshop';

function isValidWorkshopPayload(data: unknown): data is SiteWorkshopDTO[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (row) =>
      row &&
      typeof row === 'object' &&
      typeof (row as SiteWorkshopDTO).id === 'string' &&
      typeof (row as SiteWorkshopDTO).titleEn === 'string' &&
      typeof (row as SiteWorkshopDTO).category === 'string',
  );
}

/** يقرأ `data/site-workshops.json` إن وُجد؛ وإلا مصفوفة فارغة (تُستخدم البيانات الثابتة في الواجهة). */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'site-workshops.json');
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (isValidWorkshopPayload(parsed)) {
      const sorted = [...parsed].sort((a, b) => {
        const da = a.dayOfWeek ?? 99;
        const db = b.dayOfWeek ?? 99;
        if (da !== db) return da - db;
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.titleEn.localeCompare(b.titleEn);
      });
      return NextResponse.json(sorted);
    }
  } catch {
    /* */
  }
  return NextResponse.json([]);
}
