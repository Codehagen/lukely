import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { IconSparkles, IconMail, IconCheck, IconInfoCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Velg deltakertype</h2>
        <p className="text-muted-foreground">
          Vil du ha quiz-spørsmål eller bare samle e-postadresser?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            !formData.enableQuiz && "border-primary bg-primary/5"
          )}
          onClick={() => onEnableQuizChange(false)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <IconMail className="h-5 w-5 text-primary" />
                  <CardTitle>Bare E-post</CardTitle>
                </div>
                <CardDescription>
                  Samle e-postadresser uten quiz. Alle deltakere er kvalifisert for trekning.
                </CardDescription>
              </div>
              {!formData.enableQuiz && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <IconCheck className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            formData.enableQuiz && "border-primary bg-primary/5"
          )}
          onClick={() => onEnableQuizChange(true)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <IconSparkles className="h-5 w-5 text-primary" />
                  <CardTitle>Med Quiz</CardTitle>
                </div>
                <CardDescription>
                  Hver luke får 3 spørsmål som deltakere må svare på. Bare de som svarer godt nok er med i trekningen for den luken.
                </CardDescription>
              </div>
              {formData.enableQuiz && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <IconCheck className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </CardHeader>
        </Card>
      </div>

      {formData.enableQuiz && (
        <Card>
          <CardHeader>
            <CardTitle>Quiz-innstillinger</CardTitle>
            <CardDescription>
              Tilpass hvordan quizen fungerer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 rounded-lg">
              <div className="flex gap-3">
                <IconInfoCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Slik fungerer quiz i kalenderen:
                  </p>
                  <ul className="space-y-1 text-blue-800 dark:text-blue-200 list-disc list-inside">
                    <li>Hver luke får 3 spørsmål (kan redigeres senere per luke)</li>
                    <li>Deltakere svarer på spørsmålene hver gang de åpner en luke</li>
                    <li>Deres score avgjør om de kvalifiserer for trekning for den spesifikke luken</li>
                    <li>Dette gjentas for hver luke de åpner gjennom hele kalenderen</li>
                  </ul>
                </div>
              </div>
            </div>
            <FieldGroup className="flex flex-col gap-6">
              <Field>
                <FieldLabel htmlFor="defaultQuizPassingScore">
                  Poengkrav for å delta i trekning (%)
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
                  <strong>Eksempel:</strong> Hvis du setter 70% og en luke har 3 spørsmål, må deltakeren svare riktig på minst 3 av 3 (100%) eller 2 av 3 (67% - under grensen) for å delta i trekningen.<br/>
                  <strong>Tips:</strong> Sett til 0% hvis alle skal være med uansett hvor mange de svarer riktig på.
                </FieldDescription>
              </Field>

              <div className="space-y-3">
                <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                  <Checkbox
                    id="defaultShowCorrectAnswers"
                    checked={formData.defaultShowCorrectAnswers}
                    onCheckedChange={(checked) =>
                      onShowAnswersChange(checked as boolean)
                    }
                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                  />
                  <div className="grid gap-1.5 font-normal">
                    <p className="text-sm leading-none font-medium">
                      Vis riktige svar etter innsending
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Deltakere ser hvilke svar som var riktige og gale etter de har svart på quizen
                    </p>
                  </div>
                </Label>

                <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                  <Checkbox
                    id="defaultAllowRetry"
                    checked={formData.defaultAllowRetry}
                    onCheckedChange={(checked) =>
                      onAllowRetryChange(checked as boolean)
                    }
                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                  />
                  <div className="grid gap-1.5 font-normal">
                    <p className="text-sm leading-none font-medium">
                      Tillat nye forsøk
                    </p>
                    <p className="text-muted-foreground text-sm">
                      La deltakere prøve quizen på nytt hvis de ikke fikk nok riktige svar
                    </p>
                  </div>
                </Label>
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
            </FieldGroup>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
