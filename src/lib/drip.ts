import { db } from '@/db';
import { leads, communications } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { sendSMS } from '@/lib/twilio';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function processDripSequence() {
  const now = new Date();
  
  // Find leads that need follow-up
  // Step 0: Initial capture (Handled in POST /api/leads)
  // Step 1: Day 1 (24 hours after)
  // Step 2: Day 3 (72 hours after)
  // Step 3: Day 7 (168 hours after)

  const leadsToFollowUp = await db.select().from(leads).where(
    and(
      eq(leads.status, 'new'),
      sql`${leads.lastFollowUpAt} IS NULL OR ${leads.lastFollowUpAt} < ${new Date(now.getTime() - 24 * 60 * 60 * 1000)}`
    )
  );

  for (const lead of leadsToFollowUp) {
    let nextStep = (lead.followUpStep || 0) + 1;
    let shouldSend = false;
    let waitHours = 0;

    if (nextStep === 1) {
      waitHours = 24;
    } else if (nextStep === 2) {
      waitHours = 48; // 3 days total
    } else if (nextStep === 3) {
      waitHours = 96; // 7 days total
    } else {
      continue; // Drip finished
    }

    const lastEngagement = lead.lastFollowUpAt || lead.createdAt || now;
    if (now.getTime() - lastEngagement.getTime() >= waitHours * 60 * 60 * 1000) {
      shouldSend = true;
    }

    if (shouldSend) {
      const message = await generateDripMessage(lead.name, nextStep);
      
      if (lead.contactInfo.match(/^\+?[1-9]\d{1,14}$/)) {
        await sendSMS(lead.contactInfo, message);
        
        await db.insert(communications).values({
          type: 'sms',
          direction: 'outbound',
          contactId: lead.id,
          content: message,
        });

        await db.update(leads).set({
          followUpStep: nextStep,
          lastFollowUpAt: now,
        }).where(eq(leads.id, lead.id));
      }
    }
  }
}

async function generateDripMessage(name: string, step: number) {
  let prompt = '';
  if (step === 1) {
    prompt = `Generate a short follow-up message for a tattoo lead named ${name}. It's been 24 hours since they inquired. Just checking in to see if they're still interested and if they have any questions. Keep it very chill and low pressure.`;
  } else if (step === 2) {
    prompt = `Generate a short follow-up message for a tattoo lead named ${name}. It's been 3 days since they inquired. Mention that our artists are filling up fast but we'd love to make their tattoo happen. Friendly and encouraging.`;
  } else if (step === 3) {
    prompt = `Generate a short follow-up message for a tattoo lead named ${name}. It's been a week. Final check-in. Ask if they're still planning on getting that piece done or if they've changed their mind. Still stay friendly!`;
  }

  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt,
  });

  return text;
}
