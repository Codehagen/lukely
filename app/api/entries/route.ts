import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { calendarId, doorId, email, name, phone } = body;

    if (!email) {
      return NextResponse.json({ error: "E-post er påkrevd" }, { status: 400 });
    }

    // Check if calendar exists and is active
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
    });

    if (!calendar) {
      return NextResponse.json({ error: "Kalender ikke funnet" }, { status: 404 });
    }

    if (calendar.status !== "ACTIVE" && calendar.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Kalenderen er ikke aktiv" },
        { status: 400 }
      );
    }

    // Check if door exists
    const door = await prisma.door.findUnique({
      where: { id: doorId },
      include: { winner: true },
    });

    if (!door) {
      return NextResponse.json({ error: "Luke ikke funnet" }, { status: 404 });
    }

    // Check if door is open
    if (new Date() < door.openDate) {
      return NextResponse.json({ error: "Luken er ikke åpnet ennå" }, { status: 400 });
    }

    // Check if winner already selected
    if (door.winner) {
      return NextResponse.json(
        { error: "Vinner er allerede trukket for denne luken" },
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
        return NextResponse.json({ success: true, message: "Ekstra deltakelse registrert" });
      } else {
        return NextResponse.json(
          { error: "Du har allerede deltatt i denne konkurransen" },
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

    return NextResponse.json({ success: true, message: "Deltakelsen er registrert" });
  } catch (error) {
    console.error("Error creating entry:", error);
    return NextResponse.json(
      { error: "Kunne ikke registrere deltakelse" },
      { status: 500 }
    );
  }
}
