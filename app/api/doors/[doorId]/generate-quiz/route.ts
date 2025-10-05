import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { generateDoorQuiz } from "@/lib/ai/quiz-orchestrator";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ doorId: string }> }
) {
  try {
    const { doorId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    // Verify door exists and user has access
    const door = await prisma.door.findFirst({
      where: {
        id: doorId,
        calendar: {
          workspace: {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
      },
      include: {
        product: true,
        calendar: true,
      },
    });

    if (!door) {
      return NextResponse.json({ error: "Luke ikke funnet" }, { status: 404 });
    }

    const body = await req.json();
    const { aiPrompt, questionCount = 3 } = body;

    // Generate quiz using AI
    const questions = await generateDoorQuiz(
      {
        doorNumber: door.doorNumber,
        productName: door.product?.name,
        productDescription: door.product?.description || undefined,
        theme: door.calendar.type as any,
      },
      aiPrompt,
      questionCount
    );

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Kunne ikke generere quiz" },
      { status: 500 }
    );
  }
}
