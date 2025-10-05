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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ error: "Door not found" }, { status: 404 });
    }

    if (door.calendar.workspace.members.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if winner already exists
    if (door.winner) {
      return NextResponse.json(
        { error: "Winner already selected for this door" },
        { status: 400 }
      );
    }

    // Check if there are entries
    if (door.entries.length === 0) {
      return NextResponse.json(
        { error: "No entries for this door" },
        { status: 400 }
      );
    }

    // Select random winner
    const randomIndex = Math.floor(Math.random() * door.entries.length);
    const winningEntry = door.entries[randomIndex];

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
      { error: "Failed to select winner" },
      { status: 500 }
    );
  }
}
