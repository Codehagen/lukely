"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { QuizBuilder } from "@/components/quiz-builder";

interface Question {
  id?: string;
  type: string;
  questionText: string;
  order: number;
  required: boolean;
  points: number;
  correctAnswer: string | null;
  acceptableAnswers: string[] | null;
  caseSensitive: boolean;
  options: string[] | null;
  generatedByAI: boolean;
  aiPrompt: string | null;
  mediaType?: string | null;
  mediaUrl?: string | null;
}

interface QuizBuilderWrapperProps {
  calendarId: string;
  door: {
    id: string;
    doorNumber: number;
    productName?: string;
    productDescription?: string;
    theme: string;
    enableQuiz: boolean;
    quizPassingScore: number;
    showCorrectAnswers: boolean;
    allowRetry: boolean;
  };
  existingQuestions: Question[];
}

export function QuizBuilderWrapper({
  calendarId,
  door,
  existingQuestions,
}: QuizBuilderWrapperProps) {
  const [aiGeneratorTrigger, setAiGeneratorTrigger] = useState<React.ReactNode>(null);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/calendars/${calendarId}/doors`}>
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
              {door.productName || "Ingen premie satt"}
            </p>
          </div>
        </div>
        <div>{aiGeneratorTrigger}</div>
      </div>

      <QuizBuilder
        doorId={door.id}
        calendarId={calendarId}
        door={door}
        existingQuestions={existingQuestions}
        onRenderTrigger={setAiGeneratorTrigger}
      />
    </div>
  );
}
