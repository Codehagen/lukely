"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { useState } from "react";

interface Question {
  id: string;
  type: string;
  questionText: string;
  required: boolean;
  options: string[] | null;
}

interface QuizAnswer {
  questionId: string;
  answer: string;
}

interface DoorQuizSectionProps {
  questions: Question[];
  answers: QuizAnswer[];
  onAnswerChange: (questionId: string, answer: string) => void;
}

export function DoorQuizSection({
  questions,
  answers,
  onAnswerChange,
}: DoorQuizSectionProps) {
  if (questions.length === 0) return null;

  return (
    <div className="border-t pt-4 space-y-4">
      <div>
        <h4 className="font-semibold mb-1">Quiz</h4>
        <p className="text-sm text-muted-foreground">
          Svar på spørsmålene for å delta i trekningen
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <QuestionField
            key={question.id}
            question={question}
            index={index}
            value={answers.find((a) => a.questionId === question.id)?.answer || ""}
            onChange={(answer) => onAnswerChange(question.id, answer)}
          />
        ))}
      </div>
    </div>
  );
}

function QuestionField({
  question,
  index,
  value,
  onChange,
}: {
  question: Question;
  index: number;
  value: string;
  onChange: (answer: string) => void;
}) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  switch (question.type) {
    case "MULTIPLE_CHOICE":
    case "TRUE_FALSE":
      return (
        <div>
          <Label className="text-base font-medium mb-3 block">
            {index + 1}. {question.questionText}
            {question.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <RadioGroup value={value} onValueChange={onChange}>
            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-3">
                <RadioGroupItem
                  value={optionIndex.toString()}
                  id={`${question.id}-${optionIndex}`}
                />
                <Label
                  htmlFor={`${question.id}-${optionIndex}`}
                  className="font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );

    case "TEXT":
      return (
        <div>
          <Label htmlFor={question.id} className="text-base font-medium mb-2 block">
            {index + 1}. {question.questionText}
            {question.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id={question.id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Skriv svaret ditt her..."
          />
        </div>
      );

    case "RATING":
      const rating = parseInt(value) || 0;
      const displayRating = hoverRating !== null ? hoverRating : rating;

      return (
        <div>
          <Label className="text-base font-medium mb-3 block">
            {index + 1}. {question.questionText}
            {question.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star.toString())}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                className="text-2xl transition-colors"
              >
                {star <= displayRating ? (
                  <IconStarFilled className="h-8 w-8 text-yellow-500" />
                ) : (
                  <IconStar className="h-8 w-8 text-gray-300" />
                )}
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {rating} av 5 stjerner
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
}
