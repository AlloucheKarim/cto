import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { appointments, clients, artists } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendSMS } from '@/lib/twilio';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  if (event.type === 'checkout.session.completed') {
    const appointmentId = session.metadata?.appointmentId;

    if (!appointmentId) {
      return new NextResponse('No appointment ID found in metadata', { status: 400 });
    }

    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, appointmentId),
      with: {
        client: true,
        artist: true,
      },
    });

    if (appointment) {
      await db.update(appointments)
        .set({ 
          depositStatus: 'paid',
          status: 'confirmed'
        })
        .where(eq(appointments.id, appointmentId));
        
      // Send SMS confirmation
      const dateStr = appointment.dateTime.toLocaleDateString();
      const timeStr = appointment.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      await sendSMS(
        appointment.client.phone,
        `Hi ${appointment.client.name}! Your tattoo appointment with ${appointment.artist.name} is confirmed for ${dateStr} at ${timeStr}. We're excited to see you!`
      );
    }
  }

  return new NextResponse(null, { status: 200 });
}
