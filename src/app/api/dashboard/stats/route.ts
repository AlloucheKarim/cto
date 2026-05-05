import { NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, leads, missed_calls } from '@/db/schema';
import { eq, sql, gte, and } from 'drizzle-orm';
import { startOfDay, startOfMonth, subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const thirtyDaysAgo = subDays(now, 30);

    // 1. Total Bookings
    const bookingsResult = await db.select({ count: sql<number>`count(*)` }).from(appointments);
    const totalBookings = Number(bookingsResult[0].count);

    // 2. New Leads (Last 30 days)
    const leadsResult = await db.select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(gte(leads.createdAt, thirtyDaysAgo));
    const newLeads = Number(leadsResult[0].count);

    // 3. Missed Calls
    const missedResult = await db.select({ count: sql<number>`count(*)` }).from(missed_calls);
    const totalMissed = Number(missedResult[0].count);

    // 4. Today's Revenue (Paid deposits today)
    const revenueResult = await db.select({ sum: sql<number>`sum(deposit_amount)` })
      .from(appointments)
      .where(and(
        eq(appointments.depositStatus, 'paid'),
        gte(appointments.dateTime, todayStart)
      ));
    const todayRevenue = Number(revenueResult[0].sum || 0);

    // 5. Recent Appointments (Next 5)
    const recentAppointments = await db.query.appointments.findMany({
      where: gte(appointments.dateTime, now),
      with: {
        client: true,
        artist: true,
      },
      limit: 5,
      orderBy: (appointments, { asc }) => [asc(appointments.dateTime)],
    });

    // 6. Top Performing Artist (By number of appointments this month)
    const monthStart = startOfMonth(now);
    const topArtistResult = await db.select({
      artistId: appointments.artistId,
      count: sql<number>`count(*)`,
    })
      .from(appointments)
      .where(gte(appointments.dateTime, monthStart))
      .groupBy(appointments.artistId)
      .orderBy(sql`count(*) DESC`)
      .limit(1);
    
    let topArtist = null;
    if (topArtistResult.length > 0 && topArtistResult[0].artistId) {
       topArtist = await db.query.artists.findFirst({
         where: (artists, { eq }) => eq(artists.id, topArtistResult[0].artistId!),
       });
    }

    // 6. Lead Conversion Rate
    const totalLeadsResult = await db.select({ count: sql<number>`count(*)` }).from(leads);
    const totalLeads = Number(totalLeadsResult[0].count);
    const bookedLeadsResult = await db.select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.status, 'booked'));
    const bookedLeads = Number(bookedLeadsResult[0].count);
    const leadConversionRate = totalLeads > 0 ? bookedLeads / totalLeads : 0;

    // 7. No-Show Rate
    const totalApptsResult = await db.select({ count: sql<number>`count(*)` }).from(appointments);
    const totalAppts = Number(totalApptsResult[0].count);
    const noShowApptsResult = await db.select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(eq(appointments.status, 'no-show'));
    const noShowAppts = Number(noShowApptsResult[0].count);
    const noShowRate = totalAppts > 0 ? noShowAppts / totalAppts : 0;

    return NextResponse.json({
      stats: {
        totalBookings,
        newLeads,
        totalMissed,
        todayRevenue: todayRevenue / 100, // Convert from cents
      },
      recentAppointments,
      topArtist: topArtist ? {
        name: topArtist.name,
        count: topArtistResult[0].count
      } : null,
      noShowRate,
      leadConversionRate,
    });
  } catch (error) {
    console.error('Dashboard Stats API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
