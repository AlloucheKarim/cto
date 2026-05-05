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

export async function generateContentCalendar(context: {
  trendingStyles: string[];
  trendingHashtags: string[];
  shopName: string;
  adjustmentNote?: string;
}) {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      posts: z.array(z.object({
        platform: z.enum(['instagram', 'tiktok', 'facebook']),
        contentType: z.enum(['flash_sale', 'artist_spotlight', 'reveal', 'tips', 'testimonial']),
        title: z.string(),
        description: z.string(),
        suggestedHashtags: z.array(z.string()),
      })),
    }),
    prompt: `Create a weekly content calendar for a tattoo shop named ${context.shopName}.
    Trends: ${context.trendingStyles.join(', ')}
    Hashtags: ${context.trendingHashtags.join(', ')}
    ${context.adjustmentNote ? `Note: ${context.adjustmentNote}` : ''}
    
    Generate 5 engaging post ideas spread across Instagram, TikTok, and Facebook.
    Include a mix of flash sales, artist spotlights, before/after reveals, tattoo care tips, and client testimonials.`,
  });

  return object.posts;
}

export async function generatePostCaption(post: {
  platform: string;
  contentType: string;
  title: string;
  description: string;
}) {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `Write a social media caption for a ${post.platform} post.
    Type: ${post.contentType}
    Title: ${post.title}
    Description: ${post.description}
    
    The tone should be friendly, casual, and match a tattoo shop vibe. Use emojis where appropriate. Keep it concise for Instagram/TikTok.`,
  });

  return text;
}

export async function getTrendingTattooData() {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      trendingStyles: z.array(z.string()),
      trendingHashtags: z.array(z.string()),
    }),
    prompt: `Provide a list of 5 currently trending tattoo styles and 10 popular tattoo-related hashtags for social media engagement.`,
  });

  return object;
}
