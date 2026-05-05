import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { clients, appointments, communications } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await db.query.clients.findFirst({
      where: eq(clients.id, id),
      with: {
        appointments: {
          with: {
            artist: true,
          },
          orderBy: [desc(appointments.dateTime)],
        },
        communications: {
          orderBy: [desc(communications.timestamp)],
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('CRM Client Profile API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
