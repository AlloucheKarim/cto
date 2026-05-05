import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { appointments } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    await db.update(appointments)
      .set({ 
        depositStatus: 'paid',
        status: 'confirmed'
      })
      .where(eq(appointments.id, appointmentId));
      
    // TODO: Send SMS confirmation via Twilio (Module 3)
  }

  return new NextResponse(null, { status: 200 });
}
