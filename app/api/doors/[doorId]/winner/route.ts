import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { doorId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    // Verify door exists and user has access
    const door = await prisma.door.findUnique({
      where: { id: params.doorId },
      include: {
        calendar: {
          include: {
            workspace: {
              include: {
                members: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
        },
        winner: true,
        entries: {
          include: {
            lead: true,
          },
        },
      },
    });

    if (!door) {
      return NextResponse.json({ error: "Luke ikke funnet" }, { status: 404 });
    }

    if (door.calendar.workspace.members.length === 0) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
    }

    // Check if winner already exists
    if (door.winner) {
      return NextResponse.json(
        { error: "Vinner er allerede trukket for denne luken" },
        { status: 400 }
      );
    }

    // Filter eligible entries (quiz passed or quiz not enabled)
    const eligibleEntries = door.entries.filter((entry) => entry.eligibleForWinner);

    // Check if there are eligible entries
    if (eligibleEntries.length === 0) {
      return NextResponse.json(
        { error: "Ingen kvalifiserte deltakelser for denne luken" },
        { status: 400 }
      );
    }

    // Select random winner from eligible entries
    const randomIndex = Math.floor(Math.random() * eligibleEntries.length);
    const winningEntry = eligibleEntries[randomIndex];

    // Create winner record
    const winner = await prisma.winner.create({
      data: {
        doorId: params.doorId,
        leadId: winningEntry.leadId,
      },
      include: {
        lead: true,
      },
    });

    return NextResponse.json(winner);
  } catch (error) {
    console.error("Error selecting winner:", error);
    return NextResponse.json(
      { error: "Kunne ikke velge vinner" },
      { status: 500 }
    );
  }
}
