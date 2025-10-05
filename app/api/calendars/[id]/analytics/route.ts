import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDateRange } from "@/lib/analytics-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "7d";

    const dateRange = getDateRange(period);

    const analytics = await getCalendarAnalytics(id, dateRange);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
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
