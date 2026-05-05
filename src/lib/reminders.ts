import { db } from '@/db';
import { appointments, clients, artists, communications } from '@/db/schema';
import { eq, and, lte, gte, isNull, sql } from 'drizzle-orm';
import { sendSMS } from './twilio';
import { addHours, addDays, isBefore, isAfter } from 'date-fns';

export async function processReminders() {
  const now = new Date();

  // 1. 48h Reminders
  // Look for confirmed appointments in ~48 hours that haven't received a 48h reminder
  const fortyEightHoursFromNow = addDays(now, 2);
  const startTime48h = addHours(fortyEightHoursFromNow, -1);
  const endTime48h = addHours(fortyEightHoursFromNow, 1);

  const appointments48h = await db.query.appointments.findMany({
    where: and(
      eq(appointments.status, 'confirmed'),
      eq(appointments.reminder48hSent, false),
      gte(appointments.dateTime, startTime48h),
      lte(appointments.dateTime, endTime48h)
    ),
    with: {
      client: true,
      artist: true,
    },
  });

  for (const appt of appointments48h) {
    const message = `Hey ${appt.client.name}! This is a reminder for your tattoo appointment with ${appt.artist.name} in 2 days (${appt.dateTime.toLocaleString()}). Reply CONFIRM to let us know you're coming, or RESCHEDULE if you need to change the time.`;
    
    await sendSMS(appt.client.phone, message);
    
    await db.update(appointments)
      .set({ reminder48hSent: true })
      .where(eq(appointments.id, appt.id));

    await db.insert(communications).values({
      type: 'sms',
      direction: 'outbound',
      contactId: appt.clientId,
      content: message,
    });
  }

  // 2. 2h Reminders
  const twoHoursFromNow = addHours(now, 2);
  const startTime2h = addHours(twoHoursFromNow, -0.5);
  const endTime2h = addHours(twoHoursFromNow, 0.5);

  const appointments2h = await db.query.appointments.findMany({
    where: and(
      eq(appointments.status, 'confirmed'),
      eq(appointments.reminder2hSent, false),
      gte(appointments.dateTime, startTime2h),
      lte(appointments.dateTime, endTime2h)
    ),
    with: {
      client: true,
      artist: true,
    },
  });

  for (const appt of appointments2h) {
    const message = `Hey ${appt.client.name}! See you in 2 hours for your tattoo with ${appt.artist.name}! We're getting the station ready for you.`;
    
    await sendSMS(appt.client.phone, message);
    
    await db.update(appointments)
      .set({ reminder2hSent: true })
      .where(eq(appointments.id, appt.id));

    await db.insert(communications).values({
      type: 'sms',
      direction: 'outbound',
      contactId: appt.clientId,
      content: message,
    });
  }

  // 3. Aftercare Instructions
  // Send 1 hour after the appointment ends
  const oneHourAgo = addHours(now, -1);
  const startTimeAftercare = addHours(oneHourAgo, -1);
  const endTimeAftercare = oneHourAgo;

  const finishedAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.status, 'confirmed'), // Should probably be 'completed' if we have a way to mark it
      eq(appointments.aftercareSent, false),
      lte(appointments.dateTime, endTimeAftercare),
      gte(appointments.dateTime, startTimeAftercare)
    ),
    with: {
      client: true,
    },
  });

  for (const appt of finishedAppointments) {
    const message = `Thanks for coming in today, ${appt.client.name}! Your new tattoo looks great. Here are your aftercare instructions: Keep it clean, use unscented soap, apply a thin layer of ointment, and no swimming for 2 weeks! Check your email for a full PDF guide.`;
    
    await sendSMS(appt.client.phone, message);
    
    await db.update(appointments)
      .set({ aftercareSent: true, status: 'completed' })
      .where(eq(appointments.id, appt.id));

    await db.insert(communications).values({
      type: 'sms',
      direction: 'outbound',
      contactId: appt.clientId,
      content: message,
    });
  }

  // 4. Birthday SMS
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const year = today.getFullYear();

  // Drizzle doesn't have a direct date part extractor for all DBs, 
  // so we'll use a raw SQL for PostgreSQL to find birthdays today
  // where birthday_sent_year != current year
  const clientsWithBirthday = await db.query.clients.findMany({
    where: and(
      sql`EXTRACT(MONTH FROM ${clients.birthday}) = ${month}`,
      sql`EXTRACT(DAY FROM ${clients.birthday}) = ${day}`,
      sql`(${clients.birthdaySentYear} IS NULL OR ${clients.birthdaySentYear} < ${year})`
    ),
  });

  for (const client of clientsWithBirthday) {
    const message = `Happy Birthday, ${client.name}! 🎂 To celebrate, we're offering you 15% off your next tattoo. Use code BDAY15 when booking or reply to this message!`;
    
    await sendSMS(client.phone, message);
    
    await db.update(clients)
      .set({ birthdaySentYear: year })
      .where(eq(clients.id, client.id));

    await db.insert(communications).values({
      type: 'sms',
      direction: 'outbound',
      contactId: client.id,
      content: message,
    });
  }
}
