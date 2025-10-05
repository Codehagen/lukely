import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { calendarId, doorId, email, name, phone } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if calendar exists and is active
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
    });

    if (!calendar) {
      return NextResponse.json({ error: "Calendar not found" }, { status: 404 });
    }

    if (calendar.status !== "ACTIVE" && calendar.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Calendar is not active" },
        { status: 400 }
      );
    }

    // Check if door exists
    const door = await prisma.door.findUnique({
      where: { id: doorId },
      include: { winner: true },
    });

    if (!door) {
      return NextResponse.json({ error: "Door not found" }, { status: 404 });
    }

    // Check if door is open
    if (new Date() < door.openDate) {
      return NextResponse.json({ error: "Door is not open yet" }, { status: 400 });
    }

    // Check if winner already selected
    if (door.winner) {
      return NextResponse.json(
        { error: "Winner already selected for this door" },
        { status: 400 }
      );
    }

    // Get IP and User Agent for tracking
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
    const userAgent = req.headers.get("user-agent") || null;

    // Find or create lead
    let lead = await prisma.lead.findFirst({
      where: {
        email: email.toLowerCase(),
        calendarId,
      },
    });

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          email: email.toLowerCase(),
          name: name || null,
          phone: phone || null,
          calendarId,
          ipAddress,
          userAgent,
        },
      });
    } else {
      // Update lead info if provided
      if (name && !lead.name) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { name },
        });
      }
      if (phone && !lead.phone) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { phone },
        });
      }
    }

    // Check if already entered this door
    const existingEntry = await prisma.doorEntry.findUnique({
      where: {
        leadId_doorId: {
          leadId: lead.id,
          doorId,
        },
      },
    });

    if (existingEntry) {
      if (calendar.allowMultipleEntries) {
        // Allow multiple entries - just return success
        return NextResponse.json({ success: true, message: "Additional entry recorded" });
      } else {
        return NextResponse.json(
          { error: "You have already entered this giveaway" },
          { status: 400 }
        );
      }
    }

    // Create door entry
    await prisma.doorEntry.create({
      data: {
        leadId: lead.id,
        doorId,
      },
    });

    return NextResponse.json({ success: true, message: "Entry submitted successfully" });
  } catch (error) {
    console.error("Error creating entry:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}
