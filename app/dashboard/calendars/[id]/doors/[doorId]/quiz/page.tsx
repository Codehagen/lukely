import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/user";
import { QuizBuilderWrapper } from "@/components/quiz-builder-wrapper";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";

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
    <QuizBuilderWrapper
      calendarId={id}
      door={{
        id: door.id,
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
        mediaType: q.mediaType,
        mediaUrl: q.mediaUrl,
      }))}
    />
  );
}
