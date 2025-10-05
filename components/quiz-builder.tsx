"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { IconSparkles, IconPlus, IconTrash, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import { QuestionEditor } from "@/components/question-editor";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Spinner } from "@/components/ui/spinner";

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
}

interface QuizBuilderProps {
  doorId: string;
  calendarId: string;
  door: {
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

export function QuizBuilder({
  doorId,
  calendarId,
  door,
  existingQuestions,
}: QuizBuilderProps) {
  const router = useRouter();
  const [aiPrompt, setAiPrompt] = useState("");
  const [questionCount, setQuestionCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [enableQuiz, setEnableQuiz] = useState(door.enableQuiz);
  const [quizPassingScore, setQuizPassingScore] = useState(door.quizPassingScore);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(door.showCorrectAnswers);
  const [allowRetry, setAllowRetry] = useState(door.allowRetry);
  const [questions, setQuestions] = useState<Question[]>(existingQuestions);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/doors/${doorId}/generate-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiPrompt: aiPrompt || undefined,
          questionCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Kunne ikke generere quiz");
      }

      const data = await response.json();
      const generatedQuestions: Question[] = data.questions.map((q: any, index: number) => ({
        type: q.type,
        questionText: q.questionText,
        order: questions.length + index,
        required: true,
        points: q.points || 1,
        correctAnswer: q.correctAnswer,
        acceptableAnswers: null,
        caseSensitive: false,
        options: q.options || null,
        generatedByAI: true,
        aiPrompt: aiPrompt || null,
      }));

      setQuestions([...questions, ...generatedQuestions]);
      toast.success(`${data.questions.length} spørsmål generert!`);
      setAiPrompt("");
    } catch (error) {
      toast.error("Kunne ikke generere quiz");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      type: "MULTIPLE_CHOICE",
      questionText: "",
      order: questions.length,
      required: true,
      points: 1,
      correctAnswer: "0",
      acceptableAnswers: null,
      caseSensitive: false,
      options: ["Alternativ 1", "Alternativ 2", "Alternativ 3", "Alternativ 4"],
      generatedByAI: false,
      aiPrompt: null,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (index: number, updated: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updated };
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((_, i) => i === active.id);
        const newIndex = items.findIndex((_, i) => i === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((q, i) => ({ ...q, order: i }));
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/doors/${doorId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enableQuiz,
          quizPassingScore,
          showCorrectAnswers,
          allowRetry,
          questions: questions.map((q, index) => ({ ...q, order: index })),
        }),
      });

      if (!response.ok) {
        throw new Error("Kunne ikke lagre quiz");
      }

      toast.success("Quiz lagret!");
      router.refresh();
    } catch (error) {
      toast.error("Kunne ikke lagre quiz");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Generator */}
      <Card>
        <CardHeader>
          <CardTitle>AI Quiz Generator 🤖</CardTitle>
          <CardDescription>
            Generer quiz automatisk med AI - spørsmålene lages på norsk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel>Beskriv hva du vil ha quiz om (valgfritt)</FieldLabel>
            <Textarea
              placeholder={`Eksempel: "Lag spørsmål om ${door.productName || "produktet"} og norske ${door.theme.toLowerCase()}-tradisjoner"`}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={3}
            />
            <FieldDescription>
              La stå tomt for automatisk generering basert på luke og premie
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Antall spørsmål</FieldLabel>
            <Input
              type="number"
              min={1}
              max={10}
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            />
          </Field>

          <Button onClick={handleGenerateQuiz} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Genererer...
              </>
            ) : (
              <>
                <IconSparkles className="mr-2 h-4 w-4" />
                Generer Quiz med AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quiz Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz-innstillinger</CardTitle>
          <CardDescription>Konfigurer hvordan quizen fungerer</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="flex flex-col gap-6">
            <Field>
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel>Aktiver quiz for denne luken</FieldLabel>
                  <FieldDescription>
                    Brukere må svare på spørsmål for å delta
                  </FieldDescription>
                </div>
                <Switch checked={enableQuiz} onCheckedChange={setEnableQuiz} />
              </div>
            </Field>

            <Field>
              <FieldLabel>Passing Score (%)</FieldLabel>
              <Input
                type="number"
                min={0}
                max={100}
                value={quizPassingScore}
                onChange={(e) => setQuizPassingScore(parseInt(e.target.value))}
              />
              <FieldDescription>
                Hvor mange prosent riktige svar kreves for å være med i trekningen?
              </FieldDescription>
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel>Vis riktige svar etter innsending</FieldLabel>
                  <FieldDescription>
                    Brukere ser hvilke svar som var riktige
                  </FieldDescription>
                </div>
                <Switch
                  checked={showCorrectAnswers}
                  onCheckedChange={setShowCorrectAnswers}
                />
              </div>
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel>Tillat flere forsøk</FieldLabel>
                  <FieldDescription>
                    Brukere kan prøve på nytt hvis de ikke består
                  </FieldDescription>
                </div>
                <Switch checked={allowRetry} onCheckedChange={setAllowRetry} />
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Spørsmål ({questions.length})</CardTitle>
              <CardDescription>
                Dra for å endre rekkefølge, rediger eller slett spørsmål
              </CardDescription>
            </div>
            <Button onClick={handleAddQuestion} variant="outline" size="sm">
              <IconPlus className="mr-2 h-4 w-4" />
              Legg til spørsmål
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Ingen spørsmål ennå</p>
              <p className="text-sm mt-2">
                Bruk AI-generatoren eller legg til manuelt
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={questions.map((_, i) => i)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <QuestionEditor
                      key={index}
                      index={index}
                      question={question}
                      onUpdate={(updated) => handleUpdateQuestion(index, updated)}
                      onDelete={() => handleDeleteQuestion(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button onClick={handleSave} disabled={isSaving || questions.length === 0}>
          {isSaving ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Lagrer...
            </>
          ) : (
            <>
              <IconCheck className="mr-2 h-4 w-4" />
              Lagre Quiz
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
