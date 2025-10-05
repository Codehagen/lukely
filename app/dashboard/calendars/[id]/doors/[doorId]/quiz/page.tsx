import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/user";
import { QuizBuilder } from "@/components/quiz-builder";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";

async function getDoor(doorId: string, workspaceId: string) {
  return await prisma.door.findFirst({
    where: {
      id: doorId,
      calendar: {
        workspaceId,
      },
    },
    include: {
      questions: {
        orderBy: {
          order: "asc",
        },
      },
      product: true,
      calendar: true,
    },
  });
}

export default async function DoorQuizPage({
  params,
}: {
  params: Promise<{ id: string; doorId: string }>;
}) {
  const { id, doorId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userWithWorkspace = await prisma.user.findUnique({
    where: { id: user.id },
    include: { defaultWorkspace: true },
  });

  if (!userWithWorkspace?.defaultWorkspaceId) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <WorkspaceEmptyState description="Opprett et arbeidsområde for å administrere quiz." />
      </div>
    );
  }

  const door = await getDoor(doorId, userWithWorkspace.defaultWorkspaceId);

  if (!door) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/calendars/${id}/doors`}>
            <Button variant="outline" size="sm">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Tilbake til luker
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Quiz for Luke {door.doorNumber}
            </h2>
            <p className="text-muted-foreground">
              {door.product?.name || "Ingen premie satt"}
            </p>
          </div>
        </div>
      </div>

      <QuizBuilder
        doorId={door.id}
        calendarId={id}
        door={{
          doorNumber: door.doorNumber,
          productName: door.product?.name || undefined,
          productDescription: door.product?.description || undefined,
          theme: door.calendar.type,
          enableQuiz: door.enableQuiz,
          quizPassingScore: door.quizPassingScore,
          showCorrectAnswers: door.showCorrectAnswers,
          allowRetry: door.allowRetry,
        }}
        existingQuestions={door.questions.map((q) => ({
          id: q.id,
          type: q.type,
          questionText: q.questionText,
          order: q.order,
          required: q.required,
          points: q.points,
          correctAnswer: q.correctAnswer,
          acceptableAnswers: q.acceptableAnswers as string[] | null,
          caseSensitive: q.caseSensitive,
          options: q.options as string[] | null,
          generatedByAI: q.generatedByAI,
          aiPrompt: q.aiPrompt,
        }))}
      />
    </div>
  );
}
