import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    const body = await req.json();
    const { name, image } = body;

    // Validate input
    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json(
        { error: "Navnet må være en tekst" },
        { status: 400 }
      );
    }

    if (image !== undefined && typeof image !== "string") {
      return NextResponse.json(
        { error: "Bildelenken må være en tekst" },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(image !== undefined && { image }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere profilen" },
      { status: 500 }
    );
  }
}
