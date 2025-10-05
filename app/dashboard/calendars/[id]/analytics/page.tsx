import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/user";
import { getDateRange } from "@/lib/analytics-utils";
import { CalendarAnalyticsPeriodSelector } from "@/components/calendar-analytics-period-selector";
import { CalendarAnalyticsContent } from "@/components/calendar-analytics-content";

async function getCalendar(calendarId: string, workspaceId: string) {
  return await prisma.calendar.findUnique({
    where: {
      id: calendarId,
      workspaceId,
    },
    select: {
      id: true,
      title: true,
    },
  });
}

async function getCalendarAnalytics(
  calendarId: string,
  dateRange: { start: Date; end: Date }
) {
  // Parallel queries for performance
  const [
    totalViews,
    uniqueVisitors,
    totalEntries,
    deviceBreakdown,
    trafficSources,
    doorPerformance,
    dailyTimeline,
    averageDuration,
  ] = await Promise.all([
    // Total page views
    prisma.calendarView.count({
      where: {
        calendarId,
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
    }),

    // Unique visitors
    prisma.calendarView.findMany({
      where: {
        calendarId,
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
      select: { visitorHash: true },
      distinct: ["visitorHash"],
    }),

    // Total entries
    prisma.doorEntry.count({
      where: {
        door: { calendarId },
        enteredAt: { gte: dateRange.start, lte: dateRange.end },
      },
    }),

    // Device breakdown
    prisma.calendarView.groupBy({
      by: ["deviceType"],
      where: {
        calendarId,
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
      _count: true,
    }),

    // Traffic sources (from daily summaries)
    prisma.analyticsSummary.aggregate({
      where: {
        calendarId,
        date: { gte: dateRange.start, lte: dateRange.end },
      },
      _sum: {
        directTraffic: true,
        socialTraffic: true,
        emailTraffic: true,
        otherTraffic: true,
      },
    }),

    // Door performance
    prisma.door.findMany({
      where: { calendarId },
      select: {
        id: true,
        doorNumber: true,
        product: {
          select: { name: true },
        },
        _count: {
          select: {
            entries: true,
            doorViews: true,
          },
        },
        doorViews: {
          where: {
            createdAt: { gte: dateRange.start, lte: dateRange.end },
          },
          select: {
            action: true,
          },
        },
      },
      orderBy: { doorNumber: "asc" },
    }),

    // Daily timeline
    prisma.analyticsSummary.findMany({
      where: {
        calendarId,
        date: { gte: dateRange.start, lte: dateRange.end },
      },
      orderBy: { date: "asc" },
      select: {
        date: true,
        totalViews: true,
        uniqueVisitors: true,
        totalEntries: true,
      },
    }),

    // Average session duration
    prisma.calendarView.aggregate({
      where: {
        calendarId,
        createdAt: { gte: dateRange.start, lte: dateRange.end },
        duration: { not: null },
      },
      _avg: { duration: true },
    }),
  ]);

  // Calculate conversion rate
  const conversionRate = totalViews > 0
    ? ((totalEntries / totalViews) * 100).toFixed(2)
    : "0.00";

  // Format device breakdown
  const devices = deviceBreakdown.reduce((acc, item) => {
    acc[item.deviceType || "unknown"] = item._count;
    return acc;
  }, {} as Record<string, number>);

  // Format door performance
  const doors = doorPerformance.map((door) => {
    const clicks = door.doorViews.filter((v) => v.action === "CLICKED").length;
    const views = door.doorViews.length;

    return {
      doorNumber: door.doorNumber,
      productName: door.product?.name || `Luke ${door.doorNumber}`,
      totalViews: views,
      clicks,
      entries: door._count.entries,
      clickRate: views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0",
      conversionRate: clicks > 0 ? ((door._count.entries / clicks) * 100).toFixed(1) : "0.0",
    };
  });

  // Find top performing doors
  const topDoors = [...doors]
    .sort((a, b) => b.entries - a.entries)
    .slice(0, 5);

  return {
    overview: {
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      totalEntries,
      conversionRate,
      averageDuration: Math.round(averageDuration._avg.duration || 0),
      returningVisitorRate: totalViews > 0
        ? (((totalViews - uniqueVisitors.length) / totalViews) * 100).toFixed(1)
        : "0.0",
    },
    devices: {
      mobile: devices.mobile || 0,
      desktop: devices.desktop || 0,
      tablet: devices.tablet || 0,
    },
    trafficSources: {
      direct: trafficSources._sum.directTraffic || 0,
      social: trafficSources._sum.socialTraffic || 0,
      email: trafficSources._sum.emailTraffic || 0,
      other: trafficSources._sum.otherTraffic || 0,
    },
    timeline: dailyTimeline.map((day) => ({
      date: day.date,
      views: day.totalViews,
      visitors: day.uniqueVisitors,
      entries: day.totalEntries,
    })),
    doorPerformance: doors,
    topPerformers: topDoors,
  };
}

export default async function CalendarAnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const { id } = await params;
  const { period = "7d" } = await searchParams;

  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userWithWorkspace = await prisma.user.findUnique({
    where: { id: user.id },
    include: { defaultWorkspace: true },
  });

  if (!userWithWorkspace?.defaultWorkspaceId) {
    return <div>Fant ingen arbeidsområde</div>;
  }

  const calendar = await getCalendar(id, userWithWorkspace.defaultWorkspaceId);

  if (!calendar) {
    notFound();
  }

  const dateRange = getDateRange(period);
  const analytics = await getCalendarAnalytics(id, dateRange);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Analyser</h3>
          <p className="text-sm text-muted-foreground">
            Detaljert innsikt i kampanjens ytelse
          </p>
        </div>
        <CalendarAnalyticsPeriodSelector />
      </div>

      <CalendarAnalyticsContent data={analytics} />
    </div>
  );
}
