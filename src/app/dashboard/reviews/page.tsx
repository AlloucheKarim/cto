import React from 'react';
import { db } from '@/db';
import { reviews, appointments, clients } from '@/db/schema';
import { desc, eq, avg } from 'drizzle-orm';
import { Star, MessageSquare, AlertCircle } from 'lucide-react';

export default async function ReviewsDashboardPage() {
  const allReviews = await db.select({
    id: reviews.id,
    rating: reviews.rating,
    feedback: reviews.feedback,
    createdAt: reviews.createdAt,
    clientName: clients.name,
  })
  .from(reviews)
  .innerJoin(appointments, eq(reviews.appointmentId, appointments.id))
  .innerJoin(clients, eq(appointments.clientId, clients.id))
  .orderBy(desc(reviews.createdAt));

  // Calculate average rating
  const avgResult = await db.select({ value: avg(reviews.rating) }).from(reviews);
  const averageRating = avgResult[0]?.value ? parseFloat(avgResult[0].value).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reviews & Reputation</h2>
          <p className="text-gray-500">Monitor customer satisfaction and feedback.</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center space-x-3">
          <Star className="w-8 h-8 text-yellow-400 fill-current" />
          <div>
            <p className="text-2xl font-bold">{averageRating}</p>
            <p className="text-xs text-gray-400">Average Rating</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {allReviews.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border border-dashed">
             <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <p className="text-gray-500">No reviews received yet.</p>
          </div>
        ) : (
          allReviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-bold text-gray-900">{review.clientName}</p>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {review.createdAt?.toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-gray-700 italic">"{review.feedback}"</p>

              {review.rating < 4 && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Flagged for attention: Rating below 4 stars.</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
