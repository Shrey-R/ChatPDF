//cron job to let superbase to not expire

import { NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET() {
  try {
    const data = await db.file.findFirst();

    return NextResponse.json({ message: 'Cron job executed successfully', data });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching data'}, { status: 500 });
  }
}
