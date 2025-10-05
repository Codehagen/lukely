import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(
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
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!door) {
      return NextResponse.json({ error: "Luke ikke funnet" }, { status: 404 });
    }

    return NextResponse.json(door);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente quiz" },
      { status: 500 }
    );
  }
}

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
    });

    if (!door) {
      return NextResponse.json({ error: "Luke ikke funnet" }, { status: 404 });
    }

    const body = await req.json();
    const {
      enableQuiz,
      quizPassingScore,
      showCorrectAnswers,
      allowRetry,
      questions,
    } = body;

    // Update door quiz settings and questions in a transaction
    await prisma.$transaction(async (tx) => {
      // Update door settings
      await tx.door.update({
        where: { id: doorId },
        data: {
          enableQuiz: enableQuiz ?? undefined,
          quizPassingScore: quizPassingScore ?? undefined,
          showCorrectAnswers: showCorrectAnswers ?? undefined,
          allowRetry: allowRetry ?? undefined,
        },
      });

      // Delete existing questions
      await tx.question.deleteMany({
        where: { doorId },
      });

      // Create new questions if provided
      if (questions && Array.isArray(questions)) {
        await tx.question.createMany({
          data: questions.map((q: any, index: number) => ({
            doorId,
            type: q.type,
            questionText: q.questionText,
            order: q.order ?? index,
            required: q.required ?? true,
            points: q.points ?? 1,
            correctAnswer: q.correctAnswer,
            acceptableAnswers: q.acceptableAnswers || null,
            caseSensitive: q.caseSensitive ?? false,
            options: q.options || null,
            generatedByAI: q.generatedByAI ?? false,
            aiPrompt: q.aiPrompt || null,
          })),
        });
      }
    });

    // Fetch updated door with questions
    const updatedDoor = await prisma.door.findUnique({
      where: { id: doorId },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(updatedDoor);
  } catch (error) {
    console.error("Error saving quiz:", error);
    return NextResponse.json(
      { error: "Kunne ikke lagre quiz" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    });

    if (!door) {
      return NextResponse.json({ error: "Luke ikke funnet" }, { status: 404 });
    }

    // Disable quiz and delete all questions
    await prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({
        where: { doorId },
      });

      await tx.door.update({
        where: { id: doorId },
        data: { enableQuiz: false },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Kunne ikke slette quiz" },
      { status: 500 }
    );
  }
}
