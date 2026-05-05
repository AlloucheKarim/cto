import { NextResponse } from 'next/server';
import { db } from '@/db';
import { artists } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allArtists = await db.query.artists.findMany({
      where: eq(artists.isActive, true),
    });
    return NextResponse.json(allArtists);
  } catch (error) {
    console.error('Artists API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
