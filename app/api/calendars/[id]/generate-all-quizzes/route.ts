import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { generateAllDoorQuizzes, type BulkDoorInfo } from "@/lib/ai/quiz-orchestrator";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: calendarId } = await params;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    const body = await req.json();
    const { questionCount = 1, aiPrompt } = body;

    // Verify calendar exists and user has access
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
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

    if (calendar.doors.length === 0) {
      return NextResponse.json(
        { error: "Ingen luker funnet" },
        { status: 400 }
      );
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // Prepare door info for bulk generation (all doors)
          const bulkDoorInfo: BulkDoorInfo[] = calendar.doors.map((door) => ({
            doorId: door.id,
            doorNumber: door.doorNumber,
            productName: door.product?.name || null,
            productDescription: door.product?.description || null,
          }));

          let successCount = 0;
          let failedCount = 0;
          let currentIndex = 0;

          // Generate quizzes for each door sequentially
          for (const doorInfo of bulkDoorInfo) {
            currentIndex++;

            sendEvent({
              type: "progress",
              current: currentIndex,
              total: bulkDoorInfo.length,
              doorNumber: doorInfo.doorNumber,
            });

            try {
              // Generate questions using AI
              const questionsMap = await generateAllDoorQuizzes(
                calendar.type as any,
                [doorInfo],
                aiPrompt,
                questionCount
              );

              const questions = questionsMap.get(doorInfo.doorId) || [];

              if (questions.length > 0) {
                // Delete existing questions for this door
                await prisma.question.deleteMany({
                  where: { doorId: doorInfo.doorId },
                });

                // Save new questions
                await prisma.question.createMany({
                  data: questions.map((q, index) => ({
                    doorId: doorInfo.doorId,
                    type: q.type,
                    questionText: q.questionText,
                    order: index,
                    required: true,
                    points: q.points || 1,
                    correctAnswer: q.correctAnswer,
                    acceptableAnswers: null,
                    caseSensitive: false,
                    options: q.options || null,
                    generatedByAI: true,
                    aiPrompt: aiPrompt || null,
                  })),
                });

                // Enable quiz for this door
                await prisma.door.update({
                  where: { id: doorInfo.doorId },
                  data: {
                    enableQuiz: true,
                    quizPassingScore: 80,
                  },
                });

                successCount++;
              } else {
                failedCount++;
              }
            } catch (error) {
              console.error(`Failed to generate quiz for door ${doorInfo.doorNumber}:`, error);
              failedCount++;
            }

            // Small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          // Send completion event
          sendEvent({
            type: "complete",
            results: {
              success: successCount,
              failed: failedCount,
            },
          });
        } catch (error) {
          console.error("Error generating quizzes:", error);
          sendEvent({
            type: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in bulk quiz generation:", error);
    return NextResponse.json(
      { error: "Kunne ikke generere quizer" },
      { status: 500 }
    );
  }
}
