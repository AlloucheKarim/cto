'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, User, Phone, Mail, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CRMPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/crm/clients')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setClients(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Client CRM</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Client</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Spend Level</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Style Pref</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Joined</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading clients...</td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No clients found.</td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            {client.name}
                            {client.appointmentCount > 1 && (
                              <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded text-[10px] font-bold uppercase">
                                Repeat
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{client.referralSource || 'Organic'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} /> {client.phone}
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-2 text-gray-600 text-xs">
                            <Mail size={14} /> {client.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium uppercase",
                        client.spendLevel === 'high' ? "bg-green-100 text-green-800" :
                        client.spendLevel === 'medium' ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      )}>
                        {client.spendLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {client.stylePreference?.slice(0, 2).map((style: string) => (
                          <span key={style} className="px-2 py-0.5 bg-zinc-100 rounded-md text-[10px]">
                            {style}
                          </span>
                        )) || <span className="text-gray-400 text-xs">None</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="text-sm font-semibold text-black hover:underline"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
