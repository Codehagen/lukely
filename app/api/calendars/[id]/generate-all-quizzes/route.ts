import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { generateAllDoorQuizzes } from "@/lib/ai/quiz-orchestrator";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    const body = await req.json();
    const { questionCount = 3 } = body;

    // Verify calendar exists and user has access
    const calendar = await prisma.calendar.findUnique({
      where: { id: params.id },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
        doors: {
          include: {
            product: true,
          },
          orderBy: {
            doorNumber: "asc",
          },
        },
      },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Kalender ikke funnet" },
        { status: 404 }
      );
    }

    if (calendar.workspace.members.length === 0) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
    }

    if (!calendar.enableQuiz) {
      return NextResponse.json(
        { error: "Quiz er ikke aktivert for denne kalenderen" },
        { status: 400 }
      );
    }

    // Prepare door information for bulk generation
    const doorInfos = calendar.doors.map((door) => ({
      doorId: door.id,
      doorNumber: door.doorNumber,
      productName: door.product?.name || null,
      productDescription: door.product?.description || null,
    }));

    // Generate quizzes for all doors
    const quizResults = await generateAllDoorQuizzes(
      calendar.type,
      doorInfos,
      calendar.aiQuizInstructions || undefined,
      questionCount
    );

    let successCount = 0;
    let failedCount = 0;

    // Save generated questions to database
    for (const [doorId, questions] of quizResults.entries()) {
      if (questions.length === 0) {
        failedCount++;
        continue;
      }

      try {
        // Get existing question count for this door to set proper order
        const existingCount = await prisma.question.count({
          where: { doorId },
        });

        // Create questions for this door
        await prisma.question.createMany({
          data: questions.map((q, index) => ({
            doorId,
            type: q.type,
            questionText: q.questionText,
            correctAnswer: q.correctAnswer,
            options: q.options || null,
            order: existingCount + index,
            required: true,
            generatedByAI: true,
            caseSensitive: false,
          })),
        });

        successCount++;
      } catch (error) {
        console.error(`Failed to save questions for door ${doorId}:`, error);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Genererte quizer for ${successCount} luker${failedCount > 0 ? `, ${failedCount} feilet` : ""}`,
      successCount,
      failedCount,
      totalDoors: calendar.doors.length,
    });
  } catch (error) {
    console.error("Error generating all quizzes:", error);
    return NextResponse.json(
      { error: "Kunne ikke generere quizer" },
      { status: 500 }
    );
  }
}
