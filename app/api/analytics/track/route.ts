import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createVisitorHash, parseUserAgent, categorizeReferrer } from "@/lib/analytics-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { calendarId, type, doorId, referrer, userAgent, sessionId } = body;

    // Get IP address
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ||
               req.headers.get("x-real-ip") ||
               "unknown";

    // Create visitor hash for unique identification
    const visitorHash = createVisitorHash(ip, userAgent || "");

    // Track based on event type
    if (type === "page_view") {
      const deviceInfo = parseUserAgent(userAgent);

      await prisma.calendarView.create({
        data: {
          calendarId,
          visitorHash,
          ipAddress: ip,
          userAgent,
          referrer,
          deviceType: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          sessionId,
        },
      });

      // Update daily summary
      await updateDailySummary(calendarId, deviceInfo.deviceType, referrer);

      return NextResponse.json({ success: true });
    }

    if (type === "door_click" && doorId) {
      await prisma.doorView.create({
        data: {
          calendarId,
          doorId,
          visitorHash,
          sessionId,
          action: "CLICKED",
        },
      });

      return NextResponse.json({ success: true });
    }

    if (type === "door_enter" && doorId) {
      await prisma.doorView.create({
        data: {
          calendarId,
          doorId,
          visitorHash,
          sessionId,
          action: "ENTERED",
        },
      });

      return NextResponse.json({ success: true });
    }

    if (type === "session_end" && sessionId) {
      const { duration } = body;

      // Update the most recent calendar view with duration
      await prisma.calendarView.updateMany({
        where: {
          calendarId,
          sessionId,
          duration: null,
        },
        data: {
          duration,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }
}

async function updateDailySummary(
  calendarId: string,
  deviceType: string,
  referrer: string | null
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const trafficSource = categorizeReferrer(referrer);

  // Upsert daily summary
  const summary = await prisma.analyticsSummary.findUnique({
    where: {
      calendarId_date: {
        calendarId,
        date: today,
      },
    },
  });

  if (summary) {
    // Update existing summary
    await prisma.analyticsSummary.update({
      where: { id: summary.id },
      data: {
        totalViews: { increment: 1 },
        mobileViews: deviceType === "mobile" ? { increment: 1 } : undefined,
        desktopViews: deviceType === "desktop" ? { increment: 1 } : undefined,
        tabletViews: deviceType === "tablet" ? { increment: 1 } : undefined,
        directTraffic: trafficSource === "direct" ? { increment: 1 } : undefined,
        socialTraffic: trafficSource === "social" ? { increment: 1 } : undefined,
        emailTraffic: trafficSource === "email" ? { increment: 1 } : undefined,
        otherTraffic: trafficSource === "other" || trafficSource === "search" ? { increment: 1 } : undefined,
      },
    });
  } else {
    // Create new summary
    await prisma.analyticsSummary.create({
      data: {
        calendarId,
        date: today,
        totalViews: 1,
        uniqueVisitors: 1,
        mobileViews: deviceType === "mobile" ? 1 : 0,
        desktopViews: deviceType === "desktop" ? 1 : 0,
        tabletViews: deviceType === "tablet" ? 1 : 0,
        directTraffic: trafficSource === "direct" ? 1 : 0,
        socialTraffic: trafficSource === "social" ? 1 : 0,
        emailTraffic: trafficSource === "email" ? 1 : 0,
        otherTraffic: trafficSource === "other" || trafficSource === "search" ? 1 : 0,
      },
    });
  }
}
