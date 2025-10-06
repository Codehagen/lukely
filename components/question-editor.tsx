"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IconGripVertical, IconTrash, IconSparkles, IconPlus, IconX } from "@tabler/icons-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImageUpload } from "@/components/image-upload";

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

interface QuestionEditorProps {
  index: number;
  question: Question;
  onUpdate: (updated: Partial<Question>) => void;
  onDelete: () => void;
}

export function QuestionEditor({
  index,
  question,
  onUpdate,
  onDelete,
}: QuestionEditorProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTypeChange = (newType: string) => {
    let defaultCorrectAnswer = "";
    let defaultOptions = null;

    if (newType === "MULTIPLE_CHOICE") {
      defaultOptions = ["Alternativ 1", "Alternativ 2", "Alternativ 3", "Alternativ 4"];
      defaultCorrectAnswer = "0";
    } else if (newType === "TRUE_FALSE") {
      defaultOptions = ["Sant", "Usant"];
      defaultCorrectAnswer = "0";
    } else if (newType === "RATING") {
      defaultCorrectAnswer = "5";
    } else {
      defaultCorrectAnswer = "";
    }

    onUpdate({
      type: newType,
      correctAnswer: defaultCorrectAnswer,
      options: defaultOptions,
    });
  };

  const handleOptionChange = (optionIndex: number, value: string) => {
    if (!question.options) return;
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    onUpdate({ options: newOptions });
  };

  const handleAddOption = () => {
    const newOptions = question.options || [];
    onUpdate({ options: [...newOptions, `Alternativ ${newOptions.length + 1}`] });
  };

  const handleRemoveOption = (optionIndex: number) => {
    if (!question.options) return;
    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    onUpdate({ options: newOptions });
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <button
              className="cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <IconGripVertical className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex-1 flex items-center gap-2">
              <span className="font-semibold">Spørsmål {index + 1}</span>
              {question.generatedByAI && (
                <Badge variant="secondary" className="text-xs">
                  <IconSparkles className="h-3 w-3 mr-1" />
                  AI-generert
                </Badge>
              )}
            </div>
            <Select value={question.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MULTIPLE_CHOICE">Flervalg</SelectItem>
                <SelectItem value="TRUE_FALSE">Sant/Usant</SelectItem>
                <SelectItem value="TEXT">Tekstsvar</SelectItem>
                <SelectItem value="RATING">Vurdering (1-5)</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question Text */}
          <div>
            <label className="text-sm font-medium mb-2 block">Spørsmål</label>
            <Textarea
              value={question.questionText}
              onChange={(e) => onUpdate({ questionText: e.target.value })}
              placeholder="Skriv spørsmålet her..."
              rows={2}
            />
          </div>

          {/* Media Section */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Media (valgfritt)</label>
              <Select
                value={question.mediaType || "NONE"}
                onValueChange={(value) => {
                  if (value === "NONE") {
                    onUpdate({ mediaType: null, mediaUrl: null });
                  } else {
                    onUpdate({ mediaType: value, mediaUrl: question.mediaUrl });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Ingen media</SelectItem>
                  <SelectItem value="IMAGE">Bilde</SelectItem>
                  <SelectItem value="YOUTUBE">YouTube-video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {question.mediaType === "IMAGE" && (
              <ImageUpload
                currentImageUrl={question.mediaUrl || undefined}
                onUploadComplete={(url) => onUpdate({ mediaUrl: url })}
                onRemove={() => onUpdate({ mediaUrl: null })}
              />
            )}

            {question.mediaType === "YOUTUBE" && (
              <div>
                <Input
                  value={question.mediaUrl || ""}
                  onChange={(e) => onUpdate({ mediaUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lim inn YouTube-lenke
                </p>
                {question.mediaUrl && (
                  <div className="mt-3 aspect-video rounded-lg overflow-hidden border">
                    <iframe
                      src={question.mediaUrl.replace("watch?v=", "embed/")}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Multiple Choice Options */}
          {question.type === "MULTIPLE_CHOICE" && question.options && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Alternativer</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={(question.options?.length || 0) >= 6}
                >
                  <IconPlus className="h-3 w-3 mr-1" />
                  Legg til
                </Button>
              </div>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                      placeholder={`Alternativ ${optionIndex + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOption(optionIndex)}
                      disabled={question.options!.length <= 2}
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* True/False Options */}
          {question.type === "TRUE_FALSE" && question.options && (
            <div>
              <label className="text-sm font-medium mb-2 block">Alternativer</label>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <Input
                    key={optionIndex}
                    value={option}
                    onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Correct Answer */}
          <div>
            <label className="text-sm font-medium mb-2 block">Riktig svar</label>
            {question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE" ? (
              <Select
                value={question.correctAnswer || "0"}
                onValueChange={(value) => onUpdate({ correctAnswer: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {question.options?.map((option, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : question.type === "RATING" ? (
              <Select
                value={question.correctAnswer || "5"}
                onValueChange={(value) => onUpdate({ correctAnswer: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} stjerner
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={question.correctAnswer || ""}
                onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
                placeholder="Skriv det riktige svaret (lowercase, uten punktum)"
              />
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE"
                ? "Velg hvilket alternativ som er riktig"
                : question.type === "RATING"
                ? "Velg hvor mange stjerner som er riktig svar"
                : "Skriv nøyaktig hva som er riktig svar (store/små bokstaver ignoreres)"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
