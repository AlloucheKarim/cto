import { NextResponse } from 'next/server';
import { db } from '@/db';
import { clients, appointments } from '@/db/schema';
import { stripe } from '@/lib/stripe';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, style, size, placement, artistId, date, time, description } = body;

    // 1. Find or create client
    let client = await db.query.clients.findFirst({
      where: eq(clients.phone, phone),
    });

    if (!client) {
      const [newClient] = await db.insert(clients).values({
        name,
        email,
        phone,
      }).returning();
      client = newClient;
    }

    // 2. Create pending appointment
    const dateTime = new Date(`${date}T${time}`);
    const [appointment] = await db.insert(appointments).values({
      clientId: client.id,
      artistId,
      dateTime,
      style,
      size,
      placement,
      description,
      status: 'pending',
      depositAmount: 5000, // $50.00
      depositStatus: 'unpaid',
    }).returning();

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Tattoo Deposit',
              description: `Deposit for tattoo appointment with ${style} style.`,
            },
            unit_amount: 5000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book`,
      metadata: {
        appointmentId: appointment.id,
      },
    });

    // 4. Update appointment with Stripe ID
    await db.update(appointments)
      .set({ stripePaymentId: session.id })
      .where(eq(appointments.id, appointment.id));

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Booking API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
