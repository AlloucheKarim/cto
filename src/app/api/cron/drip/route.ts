import { processDripSequence } from '@/lib/drip';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Simple auth check (e.g., CRON_SECRET)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await processDripSequence();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in drip cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
