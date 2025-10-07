import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldTitle } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IconSparkles, IconMail, IconCheck, IconInfoCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface StepQuizProps {
  formData: {
    enableQuiz: boolean;
    defaultQuizPassingScore: number;
    generateAllQuizzes: boolean;
  };
  onEnableQuizChange: (enabled: boolean) => void;
  onPassingScoreChange: (score: number) => void;
  onGenerateAllChange: (generate: boolean) => void;
}

export function StepQuiz({
  formData,
  onEnableQuizChange,
  onPassingScoreChange,
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
                  Hver luke får 1 spørsmål som deltakere må svare på. Bare de som svarer godt nok er med i trekningen for den luken.
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
                    <li>Hver luke får 1 spørsmål (kan redigeres senere per luke)</li>
                    <li>Deltakere svarer på spørsmålene hver gang de åpner en luke</li>
                    <li>Deres score avgjør om de kvalifiserer for trekning for den spesifikke luken</li>
                    <li>Dette gjentas for hver luke de åpner gjennom hele kalenderen</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <FieldGroup>
                <FieldSet>
                  <FieldLabel htmlFor="quiz-passing-score">
                    Hvem kan vinne?
                  </FieldLabel>
                  <FieldDescription>
                    Velg hvem som skal være med i trekningen
                  </FieldDescription>
                  <RadioGroup
                    className="space-y-3 w-full"
                    value={formData.defaultQuizPassingScore.toString()}
                    onValueChange={(value) => onPassingScoreChange(parseInt(value))}
                  >
                    <FieldLabel htmlFor="correct-answers-only" className="block w-full cursor-pointer">
                      <div className={cn(
                        "p-4 border rounded-lg transition-colors w-full",
                        formData.defaultQuizPassingScore === 100
                          ? "border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900"
                          : "border-border bg-background"
                      )}>
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>Kun riktige svar vinner</FieldTitle>
                            <FieldDescription>
                              Bare brukere som svarer riktig er med i trekningen
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem value="100" id="correct-answers-only" />
                        </Field>
                      </div>
                    </FieldLabel>
                    <FieldLabel htmlFor="everyone-wins" className="block w-full cursor-pointer">
                      <div className={cn(
                        "p-4 border rounded-lg transition-colors w-full",
                        formData.defaultQuizPassingScore === 0
                          ? "border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900"
                          : "border-border bg-background"
                      )}>
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>Alle kan vinne</FieldTitle>
                            <FieldDescription>
                              Alle som deltar er med i trekningen uavhengig av svar
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem value="0" id="everyone-wins" />
                        </Field>
                      </div>
                    </FieldLabel>
                  </RadioGroup>
                </FieldSet>
              </FieldGroup>

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
                  ✨ AI vil generere 1 spørsmål for hver luke automatisk når kalenderen opprettes. Du kan redigere dem senere.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
