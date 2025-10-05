import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    // Verify calendar exists and user has access
    const calendar = await prisma.calendar.findFirst({
      where: {
        id: params.id,
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

    // Update calendar
    const updatedCalendar = await prisma.calendar.update({
      where: { id: params.id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        brandColor: body.brandColor,
        logo: body.logo,
        bannerImage: body.bannerImage,
        status: body.status,
        requireEmail: body.requireEmail,
        requireName: body.requireName,
        requirePhone: body.requirePhone,
        allowMultipleEntries: body.allowMultipleEntries,
      },
    });

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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    // Verify calendar exists and user has access
    const calendar = await prisma.calendar.findFirst({
      where: {
        id: params.id,
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
      where: { id: params.id },
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
