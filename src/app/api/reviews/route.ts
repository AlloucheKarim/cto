import { processReview } from '@/lib/reviews';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { appointmentId, rating, feedback } = await req.json();

    if (!appointmentId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await processReview(appointmentId, rating, feedback);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
