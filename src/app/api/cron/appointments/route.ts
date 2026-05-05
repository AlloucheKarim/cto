import { NextResponse } from 'next/server';
import { processReminders } from '@/lib/reminders';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Simple auth check if needed
  // const authHeader = req.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    await processReminders();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reminder Cron Error:', error);
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
  }
}
