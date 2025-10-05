import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { IconSparkles } from "@tabler/icons-react";

interface StepQuizProps {
  formData: {
    enableQuiz: boolean;
    defaultQuizPassingScore: number;
    defaultShowCorrectAnswers: boolean;
    defaultAllowRetry: boolean;
    aiQuizInstructions: string;
    generateAllQuizzes: boolean;
  };
  onEnableQuizChange: (enabled: boolean) => void;
  onPassingScoreChange: (score: number) => void;
  onShowAnswersChange: (show: boolean) => void;
  onAllowRetryChange: (allow: boolean) => void;
  onInstructionsChange: (instructions: string) => void;
  onGenerateAllChange: (generate: boolean) => void;
}

export function StepQuiz({
  formData,
  onEnableQuizChange,
  onPassingScoreChange,
  onShowAnswersChange,
  onAllowRetryChange,
  onInstructionsChange,
  onGenerateAllChange,
}: StepQuizProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz-innstillinger</CardTitle>
        <CardDescription>
          Legg til quiz for å engasjere deltakere og velge vinnere basert på riktige svar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="flex flex-col gap-6">
          <Field>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FieldLabel>Aktiver quiz for denne kalenderen</FieldLabel>
                <FieldDescription>
                  Deltakere må svare på spørsmål for å delta i trekningen
                </FieldDescription>
              </div>
              <Switch
                checked={formData.enableQuiz}
                onCheckedChange={onEnableQuizChange}
              />
            </div>
          </Field>

          {formData.enableQuiz && (
            <>
              <Field>
                <FieldLabel htmlFor="defaultQuizPassingScore">
                  Poengkrav for å vinne (%)
                </FieldLabel>
                <Input
                  id="defaultQuizPassingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.defaultQuizPassingScore}
                  onChange={(e) => onPassingScoreChange(parseInt(e.target.value))}
                />
                <FieldDescription>
                  Deltakere må ha minst denne prosentandelen riktige svar for å være kvalifisert
                </FieldDescription>
              </Field>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="defaultShowCorrectAnswers"
                    checked={formData.defaultShowCorrectAnswers}
                    onCheckedChange={(checked) =>
                      onShowAnswersChange(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="defaultShowCorrectAnswers"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Vis riktige svar etter innsending
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="defaultAllowRetry"
                    checked={formData.defaultAllowRetry}
                    onCheckedChange={(checked) =>
                      onAllowRetryChange(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="defaultAllowRetry"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Tillat nye forsøk
                  </label>
                </div>
              </div>

              <Field>
                <FieldLabel htmlFor="aiQuizInstructions">
                  AI-instruksjoner (valgfritt)
                </FieldLabel>
                <Textarea
                  id="aiQuizInstructions"
                  value={formData.aiQuizInstructions}
                  onChange={(e) => onInstructionsChange(e.target.value)}
                  placeholder="F.eks. 'Lag spørsmål om norske juletradisjoner og nisser' eller la det stå tomt for generelle spørsmål"
                  rows={3}
                />
                <FieldDescription>
                  Tilpass AI-genererte spørsmål med egne instruksjoner
                </FieldDescription>
              </Field>

              <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/50">
                <Checkbox
                  id="generateAllQuizzes"
                  checked={formData.generateAllQuizzes}
                  onCheckedChange={(checked) =>
                    onGenerateAllChange(checked as boolean)
                  }
                />
                <label
                  htmlFor="generateAllQuizzes"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <IconSparkles className="h-4 w-4 text-primary" />
                  Generer alle quizer automatisk med AI
                </label>
              </div>
              {formData.generateAllQuizzes && (
                <p className="text-sm text-muted-foreground -mt-2">
                  ✨ AI vil generere 3 spørsmål for hver luke automatisk når kalenderen opprettes. Du kan redigere dem senere.
                </p>
              )}
            </>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
