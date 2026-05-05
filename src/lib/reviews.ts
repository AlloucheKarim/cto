import { db } from '@/db';
import { appointments, clients, reviews, communications } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { sendSMS } from '@/lib/twilio';

export async function sendReviewRequests() {
  const now = new Date();
  
  // Find completed appointments where review request hasn't been sent
  // and the appointment was at least 2 hours ago (so they are home)
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  const completedAppointments = await db.select({
    appointment: appointments,
    client: clients,
  })
  .from(appointments)
  .innerJoin(clients, eq(appointments.clientId, clients.id))
  .where(
    and(
      eq(appointments.status, 'completed'),
      eq(appointments.reviewRequestSent, false),
      sql`${appointments.dateTime} < ${twoHoursAgo}`
    )
  );

  for (const { appointment, client } of completedAppointments) {
    const reviewLink = `${process.env.NEXT_PUBLIC_APP_URL}/review/${appointment.id}`;
    const message = `Hey ${client.name}! Thanks for coming in today. We hope you love your new tattoo! Would you mind leaving us a quick review? It helps us out a lot: ${reviewLink}`;
    
    try {
      if (client.phone) {
        await sendSMS(client.phone, message);
        
        // Log communication
        await db.insert(communications).values({
          type: 'sms',
          direction: 'outbound',
          contactId: client.id,
          content: message,
        });

        // Update appointment
        await db.update(appointments)
          .set({ reviewRequestSent: true })
          .where(eq(appointments.id, appointment.id));
      }
    } catch (error) {
      console.error(`Failed to send review request to ${client.phone}:`, error);
    }
  }
}

export async function processReview(appointmentId: string, rating: number, feedback: string) {
  // 1. Save the review
  await db.insert(reviews).values({
    appointmentId,
    rating,
    feedback,
    isPublic: rating >= 4, // Auto-public if 4 or 5 stars
  });

  // 2. Alert owner if < 4 stars
  if (rating < 4) {
    const staffNumber = process.env.STAFF_NOTIFICATION_PHONE;
    if (staffNumber) {
      await sendSMS(
        staffNumber,
        `Alert: New ${rating}-star review received. Feedback: "${feedback}". Please check the dashboard.`
      );
    }
  }
}
