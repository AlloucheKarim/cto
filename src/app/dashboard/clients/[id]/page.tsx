'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Phone, Mail, Camera, Cake, 
  Calendar, Clock, MessageSquare, StickyNote, 
  Tag, TrendingUp, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/crm/clients/${id}`)
      .then(res => res.json())
      .then(data => setClient(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  if (!client) return <div className="p-8 text-center text-red-500">Client not found.</div>;

  const totalSpend = client.appointments
    ?.filter((a: any) => a.depositStatus === 'paid')
    .reduce((sum: number, a: any) => sum + (a.depositAmount || 0), 0) || 0;

  const noShows = client.appointments?.filter((a: any) => a.status === 'no-show').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
          {client.appointments?.length > 1 && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase">
              Repeat Client
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Basic Info & Tags */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold">
                {client.name.charAt(0)}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} /> <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} /> <span>{client.email || 'No email provided'}</span>
              </div>
              {client.instagramHandle && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Camera size={18} /> <span>@{client.instagramHandle}</span>
                </div>
              )}
              {client.birthday && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Cake size={18} /> <span>{new Date(client.birthday).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="pt-6 border-t space-y-4">
              <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                <Tag size={16} /> Client Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold uppercase",
                  client.spendLevel === 'high' ? "bg-green-100 text-green-800" :
                  client.spendLevel === 'medium' ? "bg-blue-100 text-blue-800" :
                  "bg-gray-100 text-gray-800"
                )}>
                  {client.spendLevel} Spend
                </span>
                {client.stylePreference?.map((style: string) => (
                  <span key={style} className="px-3 py-1 bg-zinc-100 text-zinc-800 rounded-full text-xs font-medium">
                    {style}
                  </span>
                ))}
                {noShows > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1">
                    <AlertCircle size={12} /> {noShows} No-Shows
                  </span>
                )}
              </div>
            </div>

            <div className="pt-6 border-t grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Total Revenue</p>
                <p className="text-xl font-bold">${(totalSpend / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Appointments</p>
                <p className="text-xl font-bold">{client.appointments?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <StickyNote size={18} /> Private Notes
            </h3>
            <p className="text-sm text-gray-600 bg-zinc-50 p-4 rounded-lg italic">
              {client.notes || 'No notes added yet.'}
            </p>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={18} /> Appointment History
              </h3>
            </div>
            <div className="divide-y">
              {client.appointments?.length === 0 ? (
                <p className="p-8 text-center text-gray-500">No appointments recorded.</p>
              ) : (
                client.appointments.map((appt: any) => (
                  <div key={appt.id} className="p-6 hover:bg-gray-50 transition-colors flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{new Date(appt.dateTime).toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Artist: {appt.artist?.name}</p>
                      <p className="text-sm text-gray-600">{appt.style} • {appt.size} • {appt.placement}</p>
                      {appt.status === 'completed' && (
                        <div className="mt-2 flex gap-2">
                          <div className="w-16 h-16 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 text-center px-1">
                            No Photo
                          </div>
                          <button className="text-[10px] text-blue-600 hover:underline">Add Photo</button>
                        </div>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        appt.status === 'completed' ? "bg-green-100 text-green-800" :
                        appt.status === 'no-show' ? "bg-red-100 text-red-800" :
                        "bg-blue-100 text-blue-800"
                      )}>
                        {appt.status}
                      </span>
                      <p className="text-xs text-gray-500">
                        Deposit: ${(appt.depositAmount / 100).toFixed(2)} ({appt.depositStatus})
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare size={18} /> Communication Log
              </h3>
            </div>
            <div className="divide-y max-h-[400px] overflow-y-auto">
              {client.communications?.length === 0 ? (
                <p className="p-8 text-center text-gray-500">No messages sent or received.</p>
              ) : (
                client.communications.map((msg: any) => (
                  <div key={msg.id} className="p-4 flex gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      msg.direction === 'inbound' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                    )}>
                      <MessageSquare size={14} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase text-gray-500">
                          {msg.direction === 'inbound' ? 'From Client' : 'To Client'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
