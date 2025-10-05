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

    const body = await req.json();
    const { name, description, imageUrl, value, quantity } = body;

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
        product: true,
      },
    });

    if (!door) {
      return NextResponse.json({ error: "Luke ikke funnet" }, { status: 404 });
    }

    if (door.calendar.workspace.members.length === 0) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
    }

    // Create or update product
    if (door.product) {
      const product = await prisma.product.update({
        where: { id: door.product.id },
        data: {
          name,
          description,
          imageUrl,
          value,
          quantity,
        },
      });
      return NextResponse.json(product);
    } else {
      const product = await prisma.product.create({
        data: {
          name,
          description,
          imageUrl,
          value,
          quantity,
          doorId: params.doorId,
        },
      });
      return NextResponse.json(product);
    }
  } catch (error) {
    console.error("Error saving product:", error);
    return NextResponse.json(
      { error: "Kunne ikke lagre produkt" },
      { status: 500 }
    );
  }
}
