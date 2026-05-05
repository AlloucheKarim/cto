import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Calendar, 
  Phone,
  Users, 
  MessageSquare, 
  TrendingUp, 
  Settings,
  LogOut,
  Sparkles,
  Star
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: Calendar, label: 'Bookings', href: '/dashboard/bookings' },
    { icon: Phone, label: 'Missed Calls', href: '/dashboard/missed-calls' },
    { icon: Sparkles, label: 'Content Ideas', href: '/dashboard/content' },
    { icon: Star, label: 'Reviews', href: '/dashboard/reviews' },
    { icon: MessageSquare, label: 'Communications', href: '/dashboard/communications' },
    { icon: Users, label: 'Clients', href: '/dashboard/clients' },
    { icon: TrendingUp, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Ink Business</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button className="flex items-center space-x-3 p-3 w-full text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b p-4 md:hidden">
           <h1 className="text-xl font-bold text-gray-800">Ink Business</h1>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
