import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

export async function scoreLead(leadData: {
  styleInterest?: string | null;
  budgetRange?: string | null;
  timeline?: string | null;
  message?: string | null;
}) {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      score: z.enum(['hot', 'warm', 'cold']),
      reason: z.string(),
    }),
    prompt: `Analyze the following tattoo lead data and categorize it as hot, warm, or cold based on budget, timeline, and clarity of intent.
    Style: ${leadData.styleInterest || 'Not specified'}
    Budget: ${leadData.budgetRange || 'Not specified'}
    Timeline: ${leadData.timeline || 'Not specified'}
    Message: ${leadData.message || 'None'}
    
    Hot: Clear idea, ready to book soon, reasonable/flexible budget.
    Warm: Interested but still exploring, vague timeline.
    Cold: Unrealistic budget, very far out timeline, or spam/unclear intent.`,
  });

  return object;
}

export async function generateAutoResponse(leadData: {
  name: string;
  styleInterest?: string | null;
}) {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `You are a friendly, casual assistant for a tattoo shop. Generate a short, personalized auto-response (max 2-3 sentences) for a new lead named ${leadData.name} who is interested in ${leadData.styleInterest || 'a tattoo'}. 
    Acknowledge their interest and mention that an artist will get back to them soon to discuss details. Keep it chill and welcoming.`,
  });

  return text;
}
