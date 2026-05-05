'use server';

import { refreshWeeklyContent } from '@/lib/content';
import { revalidatePath } from 'next/cache';

export async function generateWeeklyContentAction() {
  try {
    await refreshWeeklyContent();
    revalidatePath('/dashboard/content');
    return { success: true };
  } catch (error) {
    console.error('Failed to generate content:', error);
    return { success: false, error: 'Failed to generate content' };
  }
}
