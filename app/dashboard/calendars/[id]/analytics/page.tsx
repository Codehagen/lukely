import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/user";
import { getDateRange } from "@/lib/analytics-utils";
import { CalendarAnalyticsPeriodSelector } from "@/components/calendar-analytics-period-selector";
import { CalendarAnalyticsContent } from "@/components/calendar-analytics-content";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { IconChartBar } from "@tabler/icons-react";

async function getCalendar(calendarId: string, workspaceId: string) {
  return await prisma.calendar.findUnique({
    where: {
      id: calendarId,
      workspaceId,
    },
    select: {
      id: true,
      title: true,
      format: true,
    },
  });
}

async function getCalendarAnalytics(
  calendarId: string,
  workspaceId: string,
  format: "LANDING" | "QUIZ",
  dateRange: { start: Date; end: Date },
  previousRange: { start: Date; end: Date }
) {
  // Parallel queries for performance
  const [
    totalViews,
    uniqueVisitors,
    totalDoorEntries,
    deviceBreakdown,
    trafficSources,
    doorPerformance,
    dailyTimeline,
    averageDuration,
    totalLeads,
    previousViews,
    previousUniqueVisitors,
    previousDoorEntries,
    previousAverageDuration,
    previousLeads,
    workspaceConversionSummary,
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
        entries: {
          where: {
            enteredAt: { gte: dateRange.start, lte: dateRange.end },
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

    // Leads captured
    prisma.lead.count({
      where: {
        calendarId,
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
    }),

    // Previous period views
    prisma.calendarView.count({
      where: {
        calendarId,
        createdAt: { gte: previousRange.start, lte: previousRange.end },
      },
    }),

    // Previous period unique visitors
    prisma.calendarView.findMany({
      where: {
        calendarId,
        createdAt: { gte: previousRange.start, lte: previousRange.end },
      },
      select: { visitorHash: true },
      distinct: ["visitorHash"],
    }),

    // Previous period entries
    prisma.doorEntry.count({
      where: {
        door: { calendarId },
        enteredAt: { gte: previousRange.start, lte: previousRange.end },
      },
    }),

    // Previous average session duration
    prisma.calendarView.aggregate({
      where: {
        calendarId,
        createdAt: { gte: previousRange.start, lte: previousRange.end },
        duration: { not: null },
      },
      _avg: { duration: true },
    }),

    // Previous leads
    prisma.lead.count({
      where: {
        calendarId,
        createdAt: { gte: previousRange.start, lte: previousRange.end },
      },
    }),

    // Workspace conversion snapshot for benchmarks
    prisma.analyticsSummary.groupBy({
      by: ["calendarId"],
      where: {
        calendar: {
          workspaceId,
        },
        date: { gte: dateRange.start, lte: dateRange.end },
      },
      _sum: {
        totalViews: true,
        totalEntries: true,
      },
    }),
  ]);

  const isLanding = format === "LANDING";
  const primaryMetricLabel = isLanding ? "Registrerte leads" : "Deltakelser";
  const primaryMetricCurrent = isLanding ? totalLeads : totalDoorEntries;
  const primaryMetricPrevious = isLanding ? previousLeads : previousDoorEntries;

  // Calculate conversion rate
  const conversionRate = totalViews > 0
    ? ((primaryMetricCurrent / totalViews) * 100).toFixed(2)
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
    const entries = door.entries.length;

    return {
      doorNumber: door.doorNumber,
      productName: door.product?.name || `Luke ${door.doorNumber}`,
      totalViews: views,
      clicks,
      entries,
      clickRate: views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0",
      conversionRate: clicks > 0 ? ((entries / clicks) * 100).toFixed(1) : "0.0",
    };
  });

  // Find top performing doors
  const topDoors = [...doors]
    .sort((a, b) => b.entries - a.entries)
    .slice(0, 5);

  const previousOverview = {
    totalViews: previousViews,
    uniqueVisitors: previousUniqueVisitors.length,
    totalEntries: primaryMetricPrevious,
    conversionRate: previousViews > 0
      ? ((primaryMetricPrevious / previousViews) * 100).toFixed(2)
      : "0.00",
    averageDuration: Math.round(previousAverageDuration._avg.duration || 0),
    returningVisitorRate: previousViews > 0
      ? (((previousViews - previousUniqueVisitors.length) / previousViews) * 100).toFixed(1)
      : "0.0",
  };

  const currentConversionRatio = totalViews > 0 ? primaryMetricCurrent / totalViews : 0;
  const workspaceConversionRates = workspaceConversionSummary.map((summary) => {
    const views = summary._sum.totalViews || 0;
    const entries = summary._sum.totalEntries || 0;
    return views > 0 ? entries / views : 0;
  });

  const conversionPercentile = (() => {
    if (workspaceConversionRates.length === 0) {
      return 100;
    }
    const sorted = [...workspaceConversionRates].sort((a, b) => a - b);
    let rank = 0;
    for (const value of sorted) {
      if (value <= currentConversionRatio) {
        rank += 1;
      }
    }
    return (rank / sorted.length) * 100;
  })();

  let conversionMessage = "Konverteringsraten din er midt på treet sammenlignet med andre kalendere.";
  if (primaryMetricCurrent === 0) {
    conversionMessage = isLanding
      ? "Ingen registrerte leads i denne perioden ennå."
      : "Ingen deltakelser i denne perioden ennå.";
  } else if (workspaceConversionRates.length === 0) {
    conversionMessage = "Ingen andre kalendere å sammenligne med ennå.";
  } else if (conversionPercentile >= 75) {
    conversionMessage = "Konverteringsraten din er i topp 25% av kalendere.";
  } else if (conversionPercentile <= 25) {
    conversionMessage = "Konverteringsraten din er blant de nederste 25% av kalendere.";
  }

  const ALERT_THRESHOLD = 0.2;
  const alerts = [
    {
      metric: "Visninger",
      current: totalViews,
      previous: previousOverview.totalViews,
    },
    {
      metric: "Unike besøkende",
      current: uniqueVisitors.length,
      previous: previousOverview.uniqueVisitors,
    },
    {
      metric: primaryMetricLabel,
      current: primaryMetricCurrent,
      previous: previousOverview.totalEntries,
    },
  ]
    .map((item) => {
      if (item.previous === 0) return null;
      const change = (item.current - item.previous) / item.previous;
      if (change <= -ALERT_THRESHOLD) {
        return {
          metric: item.metric,
          changePercent: (change * 100).toFixed(1),
        };
      }
      return null;
    })
    .filter((item): item is { metric: string; changePercent: string } => Boolean(item));

  return {
    overview: {
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      totalEntries: primaryMetricCurrent,
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
    previousOverview,
    benchmarks: {
      conversionPercentile,
      conversionMessage,
      hasComparisons: workspaceConversionRates.length > 0 && primaryMetricCurrent > 0,
    },
    alerts,
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
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <WorkspaceEmptyState description="Opprett et arbeidsområde for å se kalenderanalyser." />
      </div>
    );
  }

  const calendar = await getCalendar(id, userWithWorkspace.defaultWorkspaceId);

  if (!calendar) {
    notFound();
  }

  const dateRange = getDateRange(period);
  const durationMs = dateRange.end.getTime() - dateRange.start.getTime();
  const previousRange = {
    start: new Date(dateRange.start.getTime() - durationMs),
    end: new Date(dateRange.start.getTime()),
  };
  const analytics = await getCalendarAnalytics(
    id,
    userWithWorkspace.defaultWorkspaceId,
    calendar.format,
    dateRange,
    previousRange
  );
  const showDoorAnalytics = calendar.format === "QUIZ";
  const hasInsights =
    analytics.overview.totalViews > 0 ||
    analytics.overview.totalEntries > 0 ||
    analytics.timeline.length > 0 ||
    analytics.doorPerformance.some(
      (door) => door.totalViews > 0 || door.entries > 0 || Number(door.clicks) > 0
    );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analyser</h2>
          <p className="text-muted-foreground">
            Detaljert innsikt i kampanjens ytelse for {calendar.title}
          </p>
        </div>
        <CalendarAnalyticsPeriodSelector />
      </div>

      {hasInsights ? (
        <CalendarAnalyticsContent
          data={analytics}
          showDoorAnalytics={showDoorAnalytics}
          variant={calendar.format}
        />
      ) : (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconChartBar className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Ingen analyser ennå</EmptyTitle>
            <EmptyDescription>
              Når {calendar.title} begynner å få trafikk og deltakelser, vises innsikten her.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
