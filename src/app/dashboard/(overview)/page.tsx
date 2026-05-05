'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Users, Calendar, Phone, DollarSign, 
  TrendingUp, Clock, ArrowRight, User 
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(stats => setData(stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  const role = user?.user_metadata?.role || 'staff';
  const { stats, recentAppointments, topArtist } = data || {};

  const statCards = [
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'New Leads (30d)', value: stats?.newLeads || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Missed Calls', value: stats?.totalMissed || 0, icon: Phone, color: 'text-red-600', bg: 'bg-red-50' },
    { label: "Today's Revenue", value: `$${stats?.todayRevenue?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
          <p className="text-gray-500">Welcome back, {user?.email?.split('@')[0] || 'Artist'}</p>
        </div>
        <div className="flex items-center space-x-2">
           <span className="inline-flex items-center rounded-full bg-black px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
             {role} Mode
           </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-white p-6 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-6">
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
              <Link href="/dashboard/bookings" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y">
              {recentAppointments?.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No upcoming appointments found.</div>
              ) : (
                recentAppointments?.map((appt: any) => (
                  <div key={appt.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                        <User size={20} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{appt.client?.name}</p>
                        <p className="text-xs text-gray-500">{appt.style} with {appt.artist?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-900">{new Date(appt.dateTime).toLocaleDateString()}</p>
                      <p className="text-[10px] text-gray-500">{new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {role === 'owner' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <TrendingUp size={18} />
                  <span className="text-xs font-semibold uppercase">Lead Conv. Rate</span>
                </div>
                <p className="text-2xl font-bold">{(data.leadConversionRate * 100).toFixed(1)}%</p>
                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${data.leadConversionRate * 100}%` }}></div>
                </div>
              </div>
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Clock size={18} />
                  <span className="text-xs font-semibold uppercase">No-Show Rate</span>
                </div>
                <p className="text-2xl font-bold">{(data.noShowRate * 100).toFixed(1)}%</p>
                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${data.noShowRate * 100}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-3 space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/book" className="flex items-center justify-between w-full p-3 border rounded-lg hover:bg-zinc-50 transition-colors group">
                <span className="text-sm font-medium">New Booking</span>
                <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center justify-between w-full p-3 border rounded-lg hover:bg-zinc-50 transition-colors group text-left">
                <span className="text-sm font-medium">Add Manual Lead</span>
                <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
              {role === 'owner' && (
                <button className="flex items-center justify-between w-full p-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors group">
                  <span className="text-sm font-medium">Download Monthly Report</span>
                  <DollarSign size={16} className="text-zinc-400" />
                </button>
              )}
            </div>
          </div>

          {topArtist && (
            <div className="rounded-xl border bg-white p-6 shadow-sm border-yellow-200 bg-yellow-50/30">
              <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-widest mb-4">Artist Spotlight</h4>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-xl border border-yellow-200">
                  {topArtist.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{topArtist.name}</p>
                  <p className="text-xs text-gray-600">{topArtist.count} bookings this month</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded-lg border border-yellow-100 text-[11px] text-yellow-800 italic">
                "Top performing artist for the current billing cycle. Great job!"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
