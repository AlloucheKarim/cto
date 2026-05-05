import { db } from '@/db';
import { leads, communications } from '@/db/schema';
import { scoreLead, generateAutoResponse } from '@/lib/ai';
import { sendSMS } from '@/lib/twilio';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, contactInfo, source, styleInterest, budgetRange, timeline, message } = body;

    if (!name || !contactInfo) {
      return NextResponse.json({ error: 'Name and contact info are required' }, { status: 400 });
    }

    // 1. Create the lead
    const [newLead] = await db.insert(leads).values({
      name,
      contactInfo,
      source,
      styleInterest,
      budgetRange,
      timeline,
      status: 'new',
    }).returning();

    // 2. Score the lead (AI)
    const scoring = await scoreLead({ styleInterest, budgetRange, timeline, message });
    
    await db.update(leads)
      .set({ score: scoring.score })
      .where({ id: newLead.id });

    // 3. Generate personalized auto-response (AI)
    const autoResponse = await generateAutoResponse({ name, styleInterest });

    // 4. Send the response (Assuming contactInfo is a phone number for simplicity in this example)
    // In a real app, you'd check the source and use the appropriate channel (SMS, DM, etc.)
    if (contactInfo.match(/^\+?[1-9]\d{1,14}$/)) {
      await sendSMS(contactInfo, autoResponse);
      
      // Log the communication
      await db.insert(communications).values({
        type: 'sms',
        direction: 'outbound',
        contactId: newLead.id,
        content: autoResponse,
      });
    }

    return NextResponse.json({ success: true, leadId: newLead.id, score: scoring.score });
  } catch (error) {
    console.error('Error capturing lead:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
