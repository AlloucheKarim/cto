import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, clients, communications } from '@/db/schema';
import { eq, and, desc, gte } from 'drizzle-orm';
import { sendSMS } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const from = formData.get('From') as string;
  const body = formData.get('Body') as string;

  if (!from || !body) {
    return new Response('Missing From or Body', { status: 400 });
  }

  // 1. Find client
  const client = await db.query.clients.findFirst({
    where: eq(clients.phone, from),
  });

  if (!client) {
    // If not a client, maybe check leads?
    // For now, just log and ignore or send a generic message
    return new Response('OK', { status: 200 });
  }

  // Log inbound communication
  await db.insert(communications).values({
    type: 'sms',
    direction: 'inbound',
    contactId: client.id,
    content: body,
  });

  const normalizedBody = body.trim().toUpperCase();

  // 2. Find most recent upcoming appointment
  const now = new Date();
  const latestAppointment = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.clientId, client.id),
      gte(appointments.dateTime, now),
      eq(appointments.status, 'confirmed')
    ),
    orderBy: [desc(appointments.dateTime)],
    with: {
      artist: true,
    },
  });

  if (!latestAppointment) {
    // No upcoming appointment found
    await sendSMS(from, "Hey! We couldn't find an upcoming appointment for you. If you want to book a new one, visit our website!");
    return new Response('OK', { status: 200 });
  }

  // 3. Handle commands
  if (normalizedBody === 'CONFIRM') {
    await db.update(appointments)
      .set({ status: 'confirmed' }) // already confirmed, but let's be sure
      .where(eq(appointments.id, latestAppointment.id));

    await sendSMS(from, `Awesome, ${client.name}! Your appointment with ${latestAppointment.artist.name} is all set for ${latestAppointment.dateTime.toLocaleString()}. See you then!`);
  } 
  else if (normalizedBody === 'RESCHEDULE') {
    // Offer some slots
    // In a real app, this would be dynamic. Here we'll offer some slots for the next few days.
    const message = `No problem! ${latestAppointment.artist.name} has these slots available:\n1. Tomorrow at 10 AM\n2. Tomorrow at 2 PM\n3. Wednesday at 11 AM\nReply with the number to pick one, or call us to find another time.`;
    
    await sendSMS(from, message);
  }
  else if (['1', '2', '3'].includes(normalizedBody)) {
    // Handle slot selection (simplified)
    let newDate = new Date();
    if (normalizedBody === '1') {
      newDate.setDate(newDate.getDate() + 1);
      newDate.setHours(10, 0, 0, 0);
    } else if (normalizedBody === '2') {
      newDate.setDate(newDate.getDate() + 1);
      newDate.setHours(14, 0, 0, 0);
    } else {
      newDate.setDate(newDate.getDate() + 2);
      newDate.setHours(11, 0, 0, 0);
    }

    await db.update(appointments)
      .set({ dateTime: newDate })
      .where(eq(appointments.id, latestAppointment.id));

    await sendSMS(from, `Great! We've moved your appointment with ${latestAppointment.artist.name} to ${newDate.toLocaleString()}. See you then!`);
  }
  else {
    // Default response - could be AI powered
    await sendSMS(from, `Hey ${client.name}! Thanks for the message. A member of our team will get back to you ASAP. If you need to confirm or reschedule, reply with those words!`);
  }

  return new Response('OK', { status: 200 });
}
