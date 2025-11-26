import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { generateDoorDates } from "@/lib/calendar-templates";
import { addDays, differenceInCalendarDays } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch calendar and verify user has access
    const calendar = await prisma.calendar.findFirst({
      where: {
        id: id,
        workspace: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!calendar) {
      return NextResponse.json({ error: "Kalender ikke funnet" }, { status: 404 });
    }

    return NextResponse.json(calendar);
  } catch (error) {
    console.error("Error fetching calendar:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente kalender" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    const { id } = await params;

    // Verify calendar exists and user has access
    const calendar = await prisma.calendar.findFirst({
      where: {
        id: id,
        workspace: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!calendar) {
      return NextResponse.json({ error: "Kalender ikke funnet" }, { status: 404 });
    }

    const body = await req.json();

    const isLandingCalendar = calendar.format === "LANDING";

    let newStartDate = calendar.startDate;
    let newEndDate = calendar.endDate;
    let newDoorCount = calendar.doorCount;

    if (body.startDate) {
      const parsedStart = new Date(body.startDate);
      if (Number.isNaN(parsedStart.getTime())) {
        return NextResponse.json(
          { error: "Ugyldig startdato" },
          { status: 400 }
        );
      }
      newStartDate = parsedStart;
    }

    if (body.doorCount !== undefined) {
      const parsedDoorCount = Number(body.doorCount);
      if (!Number.isFinite(parsedDoorCount)) {
        return NextResponse.json(
          { error: "Ugyldig antall luker" },
          { status: 400 }
        );
      }
      newDoorCount = Math.trunc(parsedDoorCount);
    }

    if (isLandingCalendar) {
      newDoorCount = 0;
    }

    if (body.endDate) {
      const parsedEnd = new Date(body.endDate);
      if (Number.isNaN(parsedEnd.getTime())) {
        return NextResponse.json(
          { error: "Ugyldig sluttdato" },
          { status: 400 }
        );
      }
      newEndDate = parsedEnd;
    }

    if (!isLandingCalendar && (newDoorCount < 1 || newDoorCount > 31)) {
      return NextResponse.json(
        { error: "Antall luker må være mellom 1 og 31" },
        { status: 400 }
      );
    }

    if (newEndDate < newStartDate) {
      return NextResponse.json(
        { error: "Sluttdato kan ikke være før startdato" },
        { status: 400 }
      );
    }

    if (!isLandingCalendar && body.endDate) {
      const span = differenceInCalendarDays(newEndDate, newStartDate) + 1;
      if (span < 1) {
        return NextResponse.json(
          { error: "Datoene må dekke minst én dag" },
          { status: 400 }
        );
      }
      if (span > 31) {
        return NextResponse.json(
          { error: "Kalenderen kan maks ha 31 luker" },
          { status: 400 }
        );
      }
      newDoorCount = span;
    } else if (!isLandingCalendar) {
      newEndDate = addDays(newStartDate, newDoorCount - 1);
    }

    const shouldSyncDoors =
      !isLandingCalendar &&
      (newStartDate.getTime() !== calendar.startDate.getTime() ||
        newDoorCount !== calendar.doorCount ||
        newEndDate.getTime() !== calendar.endDate.getTime());

    let doorsBeforeUpdate: { id: string; doorNumber: number }[] = [];

    if (shouldSyncDoors) {
      doorsBeforeUpdate = await prisma.door.findMany({
        where: { calendarId: id },
        orderBy: { doorNumber: "asc" },
        select: {
          id: true,
          doorNumber: true,
        },
      });

      if (doorsBeforeUpdate.length > newDoorCount) {
        const doorsToRemove = doorsBeforeUpdate.slice(newDoorCount);
        const doorIdsToRemove = doorsToRemove.map((door) => door.id);

        const [entriesCount, winnersCount] = await Promise.all([
          prisma.doorEntry.count({
            where: { doorId: { in: doorIdsToRemove } },
          }),
          prisma.winner.count({
            where: { doorId: { in: doorIdsToRemove } },
          }),
        ]);

        if (entriesCount > 0 || winnersCount > 0) {
          return NextResponse.json(
            {
              error:
                "Kan ikke redusere antall luker fordi noen av de siste lukene har deltakere eller vinnere.",
            },
            { status: 400 }
          );
        }
      }
    }

    const updatedCalendar = await prisma.calendar.update({
      where: { id: id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        brandColor: body.brandColor,
        brandFont: body.brandFont,
        logo: body.logo,
        bannerImage: body.bannerImage,
        buttonText: body.buttonText,
        thankYouMessage: body.thankYouMessage,
        footerText: body.footerText,
        favicon: body.favicon,
        metaDescription: body.metaDescription,
        termsUrl: body.termsUrl,
        privacyPolicyUrl: body.privacyPolicyUrl,
        status: body.status,
        requireEmail: body.requireEmail,
        requireName: body.requireName,
        requirePhone: body.requirePhone,
        allowMultipleEntries: body.allowMultipleEntries,
        landingHeroTitle: body.landingHeroTitle,
        landingHeroSubtitle: body.landingHeroSubtitle,
        landingHeroDescription: body.landingHeroDescription,
        landingPrimaryActionLabel: body.landingPrimaryActionLabel,
        landingPrimaryActionUrl: body.landingPrimaryActionUrl,
        landingSecondaryActionLabel: body.landingSecondaryActionLabel,
        landingSecondaryActionUrl: body.landingSecondaryActionUrl,
        landingHighlights: body.landingHighlights,
        landingShowLeadForm: body.landingShowLeadForm,
        promoCode: body.promoCode,
        promoCodeMessage: body.promoCodeMessage,
        startDate: newStartDate,
        endDate: newEndDate,
        doorCount: newDoorCount,
      },
    });

    if (shouldSyncDoors) {
      if (doorsBeforeUpdate.length > newDoorCount) {
        const doorsToRemove = doorsBeforeUpdate.slice(newDoorCount);
        const doorIdsToRemove = doorsToRemove.map((door) => door.id);
        await prisma.door.deleteMany({
          where: { id: { in: doorIdsToRemove } },
        });
      }

      let currentDoors = await prisma.door.findMany({
        where: { calendarId: id },
        orderBy: { doorNumber: "asc" },
      });

      if (currentDoors.length < newDoorCount) {
        const doorDates = generateDoorDates(newStartDate, newDoorCount);
        const doorsToCreate = [] as {
          calendarId: string;
          doorNumber: number;
          openDate: Date;
          title: string;
          enableQuiz: boolean;
          quizPassingScore: number;
          showCorrectAnswers: boolean;
          allowRetry: boolean;
        }[];

        for (let i = currentDoors.length; i < newDoorCount; i++) {
          doorsToCreate.push({
            calendarId: id,
            doorNumber: i + 1,
            openDate: doorDates[i],
            title: `Luke ${i + 1}`,
            enableQuiz: updatedCalendar.enableQuiz,
            quizPassingScore: updatedCalendar.defaultQuizPassingScore,
            showCorrectAnswers: updatedCalendar.defaultShowCorrectAnswers,
            allowRetry: updatedCalendar.defaultAllowRetry,
          });
        }

        if (doorsToCreate.length > 0) {
          await prisma.door.createMany({ data: doorsToCreate });
        }

        currentDoors = await prisma.door.findMany({
          where: { calendarId: id },
          orderBy: { doorNumber: "asc" },
        });
      }

      const doorDates = generateDoorDates(newStartDate, newDoorCount);

      await Promise.all(
        currentDoors.slice(0, newDoorCount).map((door, index) =>
          prisma.door.update({
            where: { id: door.id },
            data: {
              doorNumber: index + 1,
              openDate: doorDates[index],
            },
          })
        )
      );
    }

    return NextResponse.json(updatedCalendar);
  } catch (error) {
    console.error("Error updating calendar:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere kalender" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    const { id } = await params;

    // Verify calendar exists and user has access
    const calendar = await prisma.calendar.findFirst({
      where: {
        id: id,
        workspace: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!calendar) {
      return NextResponse.json({ error: "Kalender ikke funnet" }, { status: 404 });
    }

    // Delete calendar (cascade will handle related records)
    await prisma.calendar.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting calendar:", error);
    return NextResponse.json(
      { error: "Kunne ikke slette kalender" },
      { status: 500 }
    );
  }
}
