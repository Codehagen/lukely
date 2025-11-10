import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(
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
    const body = await req.json().catch(() => ({}));
    const { leadId } = body as { leadId?: string };

    const calendar = await prisma.calendar.findUnique({
      where: { id },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
        leads: true,
        landingWinners: true,
      },
    });

    if (!calendar) {
      return NextResponse.json({ error: "Kalender ikke funnet" }, { status: 404 });
    }

    if (calendar.workspace.members.length === 0) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
    }

    if (calendar.format !== "LANDING") {
      return NextResponse.json({ error: "Kun landingssider støttes" }, { status: 400 });
    }

    if (calendar.landingWinners.length > 0) {
      return NextResponse.json(
        { error: "Vinner er allerede trukket for denne kampanjen" },
        { status: 400 }
      );
    }

    if (calendar.leads.length === 0) {
      return NextResponse.json(
        { error: "Ingen registrerte leads å velge fra" },
        { status: 400 }
      );
    }

    let selectedLeadId: string | null = null;

    if (leadId) {
      const leadExists = calendar.leads.some((lead) => lead.id === leadId);
      if (!leadExists) {
        return NextResponse.json(
          { error: "Ugyldig lead valgt" },
          { status: 400 }
        );
      }
      selectedLeadId = leadId;
    } else {
      const randomIndex = Math.floor(Math.random() * calendar.leads.length);
      selectedLeadId = calendar.leads[randomIndex].id;
    }

    const winner = await prisma.landingWinner.create({
      data: {
        calendarId: id,
        leadId: selectedLeadId,
      },
      include: {
        lead: true,
      },
    });

    return NextResponse.json(winner);
  } catch (error) {
    console.error("Error selecting landing winner:", error);
    return NextResponse.json(
      { error: "Kunne ikke velge vinner" },
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
    const { isPublic } = await req.json();

    if (typeof isPublic !== "boolean") {
      return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
    }

    const calendar = await prisma.calendar.findUnique({
      where: { id },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
        landingWinners: {
          include: {
            lead: true,
          },
        },
      },
    });

    if (!calendar) {
      return NextResponse.json({ error: "Kalender ikke funnet" }, { status: 404 });
    }

    if (calendar.workspace.members.length === 0) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
    }

    const winner = calendar.landingWinners[0];

    if (!winner) {
      return NextResponse.json(
        { error: "Ingen vinner å oppdatere" },
        { status: 400 }
      );
    }

    const updatedWinner = await prisma.landingWinner.update({
      where: { calendarId: id },
      data: { isPublic },
      include: {
        lead: true,
      },
    });

    return NextResponse.json(updatedWinner);
  } catch (error) {
    console.error("Error updating landing winner:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere vinner" },
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

    const calendar = await prisma.calendar.findUnique({
      where: { id },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!calendar) {
      return NextResponse.json({ error: "Kalender ikke funnet" }, { status: 404 });
    }

    if (calendar.workspace.members.length === 0) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
    }

    const winner = await prisma.landingWinner.findUnique({
      where: { calendarId: id },
    });

    if (!winner) {
      return NextResponse.json(
        { error: "Ingen vinner å fjerne" },
        { status: 400 }
      );
    }

    await prisma.landingWinner.delete({
      where: { calendarId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting landing winner:", error);
    return NextResponse.json(
      { error: "Kunne ikke fjerne vinner" },
      { status: 500 }
    );
  }
}
