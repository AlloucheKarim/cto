import { NextResponse } from 'next/server';
import { db } from '@/db';
import { clients, appointments } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch clients with appointment counts and total spend
    const allClients = await db.query.clients.findMany({
      with: {
        appointments: true,
      },
      orderBy: [desc(clients.createdAt)],
    });

    const clientsWithStats = allClients.map(client => {
      const totalSpend = client.appointments
        .filter(a => a.depositStatus === 'paid')
        .reduce((sum, a) => sum + (a.depositAmount || 0), 0);
      
      const noShows = client.appointments.filter(a => a.status === 'no-show').length;
      const completed = client.appointments.filter(a => a.status === 'completed').length;

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        spendLevel: client.spendLevel,
        referralSource: client.referralSource,
        stylePreference: client.stylePreference,
        totalSpend,
        appointmentCount: client.appointments.length,
        noShows,
        completed,
        createdAt: client.createdAt,
      };
    });

    return NextResponse.json(clientsWithStats);
  } catch (error) {
    console.error('CRM Clients API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
