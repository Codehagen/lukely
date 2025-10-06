import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { generateDoorDates } from "@/lib/calendar-templates";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    // Get user's default workspace
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { defaultWorkspace: true },
    });

    if (!user?.defaultWorkspaceId) {
      return NextResponse.json(
        { error: "Du må opprette et arbeidsområde før du kan lage kalendere. Gå til innstillinger for å opprette et arbeidsområde." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      title,
      slug,
      description,
      type,
      startDate,
      endDate,
      doorCount,
      brandColor,
      brandFont,
      requireEmail,
      requireName,
      requirePhone,
      enableQuiz,
      defaultQuizPassingScore,
      defaultShowCorrectAnswers,
      defaultAllowRetry,
      aiQuizInstructions,
    } = body;

    // Check if slug is unique
    const existingCalendar = await prisma.calendar.findUnique({
      where: { slug },
    });

    if (existingCalendar) {
      return NextResponse.json(
        { error: "Slugen er allerede i bruk" },
        { status: 400 }
      );
    }

    // Create calendar
    const calendar = await prisma.calendar.create({
      data: {
        title,
        slug,
        description,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        doorCount,
        brandColor,
        brandFont: brandFont || "Inter",
        requireEmail: requireEmail ?? true,
        requireName: requireName ?? true,
        requirePhone: requirePhone ?? false,
        enableQuiz: enableQuiz ?? false,
        defaultQuizPassingScore: defaultQuizPassingScore ?? 80,
        defaultShowCorrectAnswers: defaultShowCorrectAnswers ?? false,
        defaultAllowRetry: defaultAllowRetry ?? false,
        aiQuizInstructions: aiQuizInstructions || null,
        workspaceId: user.defaultWorkspaceId,
        status: "DRAFT",
      },
    });

    // Generate doors for the calendar
    const doorDates = generateDoorDates(new Date(startDate), doorCount);

    const doorsData = doorDates.map((date, index) => ({
      calendarId: calendar.id,
      doorNumber: index + 1,
      openDate: date,
      title: `Luke ${index + 1}`,
      enableQuiz: enableQuiz ?? false,
      quizPassingScore: defaultQuizPassingScore ?? 80,
      showCorrectAnswers: defaultShowCorrectAnswers ?? false,
      allowRetry: defaultAllowRetry ?? false,
    }));

    await prisma.door.createMany({
      data: doorsData,
    });

    return NextResponse.json(calendar);
  } catch (error) {
    console.error("Error creating calendar:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette kalender" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    // Get user's default workspace
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { defaultWorkspace: true },
    });

    if (!user?.defaultWorkspaceId) {
      return NextResponse.json(
        { error: "Ingen arbeidsområde funnet" },
        { status: 400 }
      );
    }

    const calendars = await prisma.calendar.findMany({
      where: {
        workspaceId: user.defaultWorkspaceId,
      },
      include: {
        _count: {
          select: {
            leads: true,
            doors: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(calendars);
  } catch (error) {
    console.error("Error fetching calendars:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente kalendere" },
      { status: 500 }
    );
  }
}
