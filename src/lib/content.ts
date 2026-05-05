import { db } from '@/db';
import { contentPosts } from '@/db/schema';
import { generateContentCalendar, generatePostCaption, getTrendingTattooData } from '@/lib/ai';
import { desc, gt } from 'drizzle-orm';

export async function refreshWeeklyContent() {
  const shopName = process.env.SHOP_NAME || 'Our Tattoo Shop';
  
  // 1. Get trending data
  const trends = await getTrendingTattooData();

  // 2. Get past high-engagement posts for context
  const highEngagementPosts = await db.query.contentPosts.findMany({
    where: gt(contentPosts.engagementLikes, 10), // Example threshold
    orderBy: [desc(contentPosts.engagementLikes)],
    limit: 5,
  });

  const successfulThemes = highEngagementPosts.map(p => p.contentType).join(', ');
  
  // 3. Generate calendar with adjustment context
  const ideas = await generateContentCalendar({
    trendingStyles: trends.trendingStyles,
    trendingHashtags: trends.trendingHashtags,
    shopName,
    // Add context about what worked before if available
    adjustmentNote: successfulThemes ? `Previously, posts about ${successfulThemes} got high engagement. Try to lean into similar themes.` : undefined,
  });
  
  // 3. Save to database
  const postsToSave = await Promise.all(ideas.map(async (idea) => {
    const caption = await generatePostCaption({
      platform: idea.platform,
      contentType: idea.contentType,
      title: idea.title,
      description: idea.description,
    });
    
    return {
      platform: idea.platform,
      contentType: idea.contentType,
      caption,
      hashtags: idea.suggestedHashtags,
      status: 'draft' as const,
      aiGenerated: true,
      scheduledDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Randomly within next 7 days
    };
  }));
  
  await db.insert(contentPosts).values(postsToSave);
  
  return postsToSave;
}
