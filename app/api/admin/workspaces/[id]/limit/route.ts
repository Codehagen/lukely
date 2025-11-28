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

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { limit } = body;

    if (typeof limit !== "number" || limit < 1) {
      return NextResponse.json(
        { error: "Ugyldig grense" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.update({
      where: { id },
      data: { maxCalendars: limit },
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Error updating workspace limit:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere grense" },
      { status: 500 }
    );
  }
}
