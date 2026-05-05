import React from 'react';
import { db } from '@/db';
import { contentPosts } from '@/db/schema';
import { desc } from 'drizzle-orm';
import RefreshContentButton from './RefreshButton';
import { Instagram, Facebook, Video, Calendar as CalendarIcon, Tag, Sparkles } from 'lucide-react';

export default async function ContentIdeasPage() {
  const posts = await db.query.contentPosts.findMany({
    orderBy: [desc(contentPosts.scheduledDate)],
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'tiktok': return <Video className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Content Ideas Engine</h2>
          <p className="text-gray-500">AI-generated content plan for your social media.</p>
        </div>
        <RefreshContentButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No content ideas generated yet.</p>
            <p className="text-sm text-gray-400 mt-1">Click the button above to get started!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border shadow-sm flex flex-col overflow-hidden">
              <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                    {getPlatformIcon(post.platform)}
                    <span>{post.platform}</span>
                  </span>
                  <span className="text-xs text-gray-400 flex items-center">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {post.scheduledDate?.toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 capitalize leading-tight">
                  {post.contentType?.replace('_', ' ')}
                </h3>
                
                <p className="text-sm text-gray-600 line-clamp-4">
                  {post.caption}
                </p>

                <div className="flex flex-wrap gap-1">
                  {post.hashtags?.map((tag) => (
                    <span key={tag} className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  post.status === 'posted' ? 'bg-green-100 text-green-800' : 
                  post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {post.status?.toUpperCase()}
                </span>
                <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
                  Edit Post
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
