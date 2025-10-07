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
      calendarFormat,
      startDate,
      endDate,
      doorCount,
      brandColor,
      brandFont,
      logo,
      requireEmail,
      requireName,
      requirePhone,
      enableQuiz,
      defaultQuizPassingScore,
      defaultShowCorrectAnswers,
      defaultAllowRetry,
      aiQuizInstructions,
      landingHeroTitle,
      landingHeroSubtitle,
      landingHeroDescription,
      landingPrimaryActionLabel,
      landingPrimaryActionUrl,
      landingSecondaryActionLabel,
      landingSecondaryActionUrl,
      landingHighlights,
      landingShowLeadForm,
    } = body;

    // Ensure slug is unique - auto-append number if needed
    let uniqueSlug = slug;
    let suffix = 1;

    while (await prisma.calendar.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${suffix}`;
      suffix++;
    }

    // Create calendar
    const isQuizFormat = calendarFormat === "quiz";
    const landingData = !isQuizFormat
      ? {
          landingHeroTitle: landingHeroTitle || null,
          landingHeroSubtitle: landingHeroSubtitle || null,
          landingHeroDescription: landingHeroDescription || null,
          landingPrimaryActionLabel: landingPrimaryActionLabel || undefined,
          landingPrimaryActionUrl: landingPrimaryActionUrl || null,
          landingSecondaryActionLabel: landingSecondaryActionLabel || null,
          landingSecondaryActionUrl: landingSecondaryActionUrl || null,
          landingHighlights:
            Array.isArray(landingHighlights) && landingHighlights.length > 0
              ? landingHighlights
              : undefined,
          landingShowLeadForm: landingShowLeadForm ?? true,
        }
      : {};

    const calendar = await prisma.calendar.create({
      data: {
        title,
        slug: uniqueSlug,
        description,
        type,
        format: isQuizFormat ? "QUIZ" : "LANDING",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        doorCount: isQuizFormat ? doorCount : 0,
        brandColor,
        brandFont: brandFont || "Inter",
        logo: logo || null,
        requireEmail: requireEmail ?? true,
        requireName: requireName ?? true,
        requirePhone: requirePhone ?? false,
        enableQuiz: isQuizFormat ? true : false,
        defaultQuizPassingScore: defaultQuizPassingScore ?? 80,
        defaultShowCorrectAnswers: defaultShowCorrectAnswers ?? false,
        defaultAllowRetry: defaultAllowRetry ?? false,
        aiQuizInstructions: aiQuizInstructions || null,
        workspaceId: user.defaultWorkspaceId,
        status: "DRAFT",
        ...landingData,
      },
    });

    if (isQuizFormat) {
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

      if (doorsData.length > 0) {
        await prisma.door.createMany({
          data: doorsData,
        });
      }
    }

    return NextResponse.json(calendar);
  } catch (error) {
    console.error("Error creating calendar:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette kalender" },
      { status: 500 }
    );
  }
}

export async function GET() {
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
