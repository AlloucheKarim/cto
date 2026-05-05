import { NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, artists, clients } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.stripePaymentId, sessionId),
      with: {
        client: true,
        artist: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({
      clientName: appointment.client.name,
      artistName: appointment.artist.name,
      dateTime: appointment.dateTime.toLocaleString(),
      style: appointment.style,
      size: appointment.size,
      placement: appointment.placement,
      depositAmount: appointment.depositAmount,
    });
  } catch (error) {
    console.error('Fetch Appointment Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
