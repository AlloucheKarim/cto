import React from 'react';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Basic role check logic (staff vs owner)
  // In a real app, we'd fetch the user's role from a profiles table
  const role = user?.user_metadata?.role || 'staff'; 

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
           <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800">
             {role.toUpperCase()} View
           </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards */}
        {[
          { label: 'Total Bookings', value: '0' },
          { label: 'New Leads', value: '0' },
          { label: 'Missed Calls', value: '0' },
          { label: 'Today\'s Revenue', value: '$0' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Appointments</h3>
          <p className="text-gray-500">No appointments scheduled for today.</p>
        </div>
        <div className="col-span-3 rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              New Booking
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              Add Lead
            </button>
            {role === 'owner' && (
              <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors text-blue-600 border-blue-200 bg-blue-50">
                Generate Weekly Report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
