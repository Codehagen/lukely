"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconSparkles, IconCheck, IconX } from "@tabler/icons-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface BulkQuizGeneratorProps {
  calendarId: string;
  calendarType: string;
  totalDoors: number;
}

const EXAMPLE_PROMPTS = {
  CHRISTMAS: [
    "Lag spørsmål om norske juletradisjoner og juleskikker",
    "Lag spørsmål om produktene og deres egenskaper",
    "Lag enkle juletrivia som alle kan svare på",
    "Kombiner spørsmål om jul og produktene i kalenderen",
  ],
  VALENTINE: [
    "Lag romantiske spørsmål om kjærlighet og valentinsdagen",
    "Lag spørsmål om produktene og deres egenskaper",
    "Lag morsomme spørsmål om forhold og dating",
  ],
  EASTER: [
    "Lag spørsmål om norske påsketradisjoner",
    "Lag spørsmål om produktene og deres egenskaper",
    "Lag påsketrivia om mat, tradisjoner og skikker",
  ],
  CUSTOM: [
    "Lag engasjerende spørsmål relatert til produktene",
    "Lag enkle triviaspørsmål som passer anledningen",
    "Lag morsomme spørsmål som er lette å svare på",
  ],
};

export function BulkQuizGenerator({
  calendarId,
  calendarType,
  totalDoors,
}: BulkQuizGeneratorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedExample, setSelectedExample] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentDoor, setCurrentDoor] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);

  const examplePrompts = EXAMPLE_PROMPTS[calendarType as keyof typeof EXAMPLE_PROMPTS] || EXAMPLE_PROMPTS.CUSTOM;

  const handleExampleSelect = (value: string) => {
    setSelectedExample(value);
    setCustomPrompt(value);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setCurrentDoor(0);
    setResults(null);

    try {
      const response = await fetch(`/api/calendars/${calendarId}/generate-all-quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionCount,
          aiPrompt: customPrompt || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Kunne ikke generere quizer");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "progress") {
                setCurrentDoor(data.current);
                setProgress((data.current / data.total) * 100);
              } else if (data.type === "complete") {
                setResults(data.results);
                toast.success(
                  `Quiz generert for ${data.results.success} av ${totalDoors} luker!`
                );
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch (e) {
              console.error("Error parsing SSE:", e);
            }
          }
        }
      }

      router.refresh();
    } catch (error) {
      console.error("Error generating quizzes:", error);
      toast.error("Kunne ikke generere quizer. Prøv igjen.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setOpen(false);
      setCustomPrompt("");
      setSelectedExample("");
      setProgress(0);
      setCurrentDoor(0);
      setResults(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <IconSparkles className="mr-2 h-4 w-4" />
          Generer med AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generer quiz for alle luker</DialogTitle>
          <DialogDescription>
            Bruk AI til å automatisk generere quiz-spørsmål for alle {totalDoors} luker i kalenderen
          </DialogDescription>
        </DialogHeader>

        {!isGenerating && !results ? (
          <div className="space-y-6 mt-4">
            <div>
              <Label htmlFor="questionCount">Antall spørsmål per luke</Label>
              <Input
                id="questionCount"
                type="number"
                min={1}
                max={5}
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Standard er 1 spørsmål per luke
              </p>
            </div>

            <div>
              <Label htmlFor="examplePrompt">Velg et eksempel (valgfritt)</Label>
              <Select value={selectedExample} onValueChange={handleExampleSelect}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Velg et eksempel..." />
                </SelectTrigger>
                <SelectContent>
                  {examplePrompts.map((prompt, index) => (
                    <SelectItem key={index} value={prompt}>
                      {prompt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="customPrompt">Egendefinert beskrivelse (valgfritt)</Label>
              <Textarea
                id="customPrompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Beskri hva slags spørsmål du vil ha, eller la stå tomt for automatisk generering..."
                rows={4}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                La stå tomt for å la AI-en generere basert på produkter og tema
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Avbryt
              </Button>
              <Button onClick={handleGenerate}>
                <IconSparkles className="mr-2 h-4 w-4" />
                Generer quiz
              </Button>
            </div>
          </div>
        ) : isGenerating ? (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <Spinner className="h-8 w-8 mx-auto mb-4" />
              <p className="text-lg font-medium">Genererer quiz...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Luke {currentDoor} av {totalDoors}
              </p>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-center text-muted-foreground">
              Dette kan ta noen minutter. Vennligst vent...
            </p>
          </div>
        ) : results ? (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                <IconCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ferdig!</h3>
              <p className="text-muted-foreground">
                Quiz generert for {results.success} av {totalDoors} luker
              </p>
              {results.failed > 0 && (
                <p className="text-sm text-destructive mt-2">
                  {results.failed} luker feilet
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 bg-muted/50 rounded-lg p-4 text-sm">
              <div className="flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-green-600" />
                <span>{results.success} luker med quiz</span>
              </div>
              {results.failed > 0 && (
                <div className="flex items-center gap-2">
                  <IconX className="h-4 w-4 text-destructive" />
                  <span>{results.failed} luker feilet</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Lukk
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
