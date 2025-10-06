import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    let preferences = await prisma.userNotificationPreferences.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.userNotificationPreferences.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente varslingsinnstillinger" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    const body = await req.json();
    const {
      emailCalendarActivity,
      emailWinnerSelected,
      emailNewLeads,
      emailWeeklySummary,
    } = body;

    // Get or create preferences first
    let preferences = await prisma.userNotificationPreferences.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!preferences) {
      preferences = await prisma.userNotificationPreferences.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    // Update preferences
    const updatedPreferences = await prisma.userNotificationPreferences.update({
      where: { userId: session.user.id },
      data: {
        ...(emailCalendarActivity !== undefined && { emailCalendarActivity }),
        ...(emailWinnerSelected !== undefined && { emailWinnerSelected }),
        ...(emailNewLeads !== undefined && { emailNewLeads }),
        ...(emailWeeklySummary !== undefined && { emailWeeklySummary }),
      },
    });

    return NextResponse.json(updatedPreferences);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere varslingsinnstillinger" },
      { status: 500 }
    );
  }
}
