import { db } from '@/db';
import { leads, communications } from '@/db/schema';
import { scoreLead, generateAutoResponse } from '@/lib/ai';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    } else {
      return new Response(null, { status: 403 });
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic structure for Meta Messenger/Instagram webhook
    if (body.object === 'page' || body.object === 'instagram') {
      for (const entry of body.entry) {
        const messaging = entry.messaging || entry.changes;
        for (const messageEvent of messaging) {
          if (messageEvent.message && !messageEvent.message.is_echo) {
            const senderId = messageEvent.sender.id;
            const text = messageEvent.message.text;

            // 1. Check if lead already exists or create a new one
            // (In a real app, we'd use senderId to look up the user via Meta Graph API)
            const [newLead] = await db.insert(leads).values({
              name: `Meta User ${senderId}`, // Placeholder
              contactInfo: senderId,
              source: body.object,
              status: 'new',
            }).returning();

            // 2. Score and Respond
            const scoring = await scoreLead({ message: text });
            await db.update(leads).set({ score: scoring.score }).where({ id: newLead.id });

            const autoResponse = await generateAutoResponse({ 
              name: 'there', 
              styleInterest: 'a tattoo' 
            });

            // 3. Send response back via Meta API (Mocking the call)
            console.log(`Sending Meta response to ${senderId}: ${autoResponse}`);
            
            // Log communication
            await db.insert(communications).values({
              type: body.object === 'page' ? 'facebook_msg' : 'instagram_dm',
              direction: 'outbound',
              contactId: newLead.id,
              content: autoResponse,
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling Meta webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
