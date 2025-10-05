import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconEdit, IconCheck, IconX } from "@tabler/icons-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface StepOppsummeringProps {
  formData: {
    title: string;
    slug: string;
    description: string;
    startDate: Date;
    endDate: Date;
    doorCount: number;
    enableQuiz: boolean;
    defaultQuizPassingScore: number;
    defaultShowCorrectAnswers: boolean;
    defaultAllowRetry: boolean;
    aiQuizInstructions: string;
    generateAllQuizzes: boolean;
    brandColor: string;
  };
  onEdit: (step: number) => void;
}

export function StepOppsummering({ formData, onEdit }: StepOppsummeringProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Klar til å opprette kalenderen?</h2>
        <p className="text-muted-foreground">
          Sjekk at alt ser riktig ut før du oppretter kalenderen
        </p>
      </div>

      {/* Grunnleggende informasjon */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Grunnleggende informasjon</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(1)}
            >
              <IconEdit className="h-4 w-4 mr-2" />
              Rediger
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Kalendertittel</dt>
              <dd className="font-medium">{formData.title || "–"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">URL-slug</dt>
              <dd className="font-mono text-sm">
                yoursite.com/c/{formData.slug || "–"}
              </dd>
            </div>
            {formData.description && (
              <div className="md:col-span-2">
                <dt className="text-sm text-muted-foreground">Beskrivelse</dt>
                <dd className="text-sm">{formData.description}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Datoer og luker */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Datoer og luker</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(2)}
            >
              <IconEdit className="h-4 w-4 mr-2" />
              Rediger
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Startdato</dt>
              <dd className="font-medium">
                {format(formData.startDate, "d. MMM yyyy", { locale: nb })}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Sluttdato</dt>
              <dd className="font-medium">
                {format(formData.endDate, "d. MMM yyyy", { locale: nb })}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Antall luker</dt>
              <dd className="font-medium">{formData.doorCount} luker</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Quiz */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Quiz</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(3)}
            >
              <IconEdit className="h-4 w-4 mr-2" />
              Rediger
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {formData.enableQuiz ? (
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Quiz aktivert</dt>
                <dd className="flex items-center gap-2 font-medium text-green-600">
                  <IconCheck className="h-4 w-4" />
                  Ja
                </dd>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Poengkrav</dt>
                  <dd className="font-medium">{formData.defaultQuizPassingScore}%</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Vis svar</dt>
                  <dd className="font-medium">
                    {formData.defaultShowCorrectAnswers ? "Ja" : "Nei"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Tillat nye forsøk</dt>
                  <dd className="font-medium">
                    {formData.defaultAllowRetry ? "Ja" : "Nei"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">AI-generering</dt>
                  <dd className="font-medium">
                    {formData.generateAllQuizzes ? "Automatisk" : "Manuelt"}
                  </dd>
                </div>
              </div>
              {formData.aiQuizInstructions && (
                <div>
                  <dt className="text-sm text-muted-foreground">AI-instruksjoner</dt>
                  <dd className="text-sm">{formData.aiQuizInstructions}</dd>
                </div>
              )}
            </dl>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconX className="h-4 w-4" />
              Ingen quiz aktivert
            </div>
          )}
        </CardContent>
      </Card>

      {/* Merkevare */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Merkevare</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(4)}
            >
              <IconEdit className="h-4 w-4 mr-2" />
              Rediger
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <dt className="text-sm text-muted-foreground mb-2">Profilfarge</dt>
            <dd className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded border"
                style={{ backgroundColor: formData.brandColor }}
              />
              <span className="font-mono text-sm">{formData.brandColor}</span>
            </dd>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
