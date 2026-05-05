import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { missedCalls } from '@/db/schema';
import { sendSMS } from '@/lib/twilio';

/**
 * Handle Twilio Voice Webhook
 * Twilio sends a POST request when a call is completed or if no one answers.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const callStatus = formData.get('CallStatus') as string;
    const fromNumber = formData.get('From') as string;
    const callSid = formData.get('CallSid') as string;

    console.log(`Received call webhook: ${callSid} status: ${callStatus} from: ${fromNumber}`);

    // Call statuses that indicate a missed call
    const missedStatuses = ['no-answer', 'busy', 'failed', 'canceled'];

    if (missedStatuses.includes(callStatus)) {
      // 1. Log the missed call in the database
      await db.insert(missedCalls).values({
        phoneNumber: fromNumber,
        status: 'new',
        followUpSent: true, // We are sending it now
      });

      // 2. Send automatic SMS within 60 seconds (immediately here)
      const shopName = process.env.SHOP_NAME || 'Our Tattoo Shop';
      const bookingLink = process.env.NEXT_PUBLIC_APP_URL || 'https://tattoo-booking.com';
      
      const messageBody = `Hey! Sorry we missed you at ${shopName}. Reply here and we'll get back to you ASAP — or book online at ${bookingLink}.`;
      
      await sendSMS(fromNumber, messageBody);

      // 3. Alert staff via SMS (optional: send to a designated staff number)
      const staffNumber = process.env.STAFF_NOTIFICATION_PHONE;
      if (staffNumber) {
        await sendSMS(
          staffNumber,
          `Alert: Missed call from ${fromNumber}. Automated follow-up sent.`
        );
      }
    }

    // Twilio expects a TwiML response even if empty
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  } catch (error) {
    console.error('Error handling Twilio webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
