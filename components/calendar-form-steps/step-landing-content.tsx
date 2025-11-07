"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { ImageUpload } from "@/components/image-upload";

export interface LandingHighlight {
  title: string;
  description: string;
}

interface StepLandingContentProps {
  formData: {
    landingHeroTitle: string;
    landingHeroSubtitle: string;
    landingHeroDescription: string;
    landingPrimaryActionLabel: string;
    landingPrimaryActionUrl: string;
    landingSecondaryActionLabel: string;
    landingSecondaryActionUrl: string;
    landingHighlights: LandingHighlight[];
    landingShowLeadForm: boolean;
    landingPrizeImage: string;
  };
  onChange: (values: Partial<StepLandingContentProps["formData"]>) => void;
  onUpdateHighlight: (index: number, values: Partial<LandingHighlight>) => void;
  onAddHighlight: () => void;
  onRemoveHighlight: (index: number) => void;
}

export function StepLandingContent({
  formData,
  onChange,
  onUpdateHighlight,
  onAddHighlight,
  onRemoveHighlight,
}: StepLandingContentProps) {
  const hasHighlights = formData.landingHighlights.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero-seksjon</CardTitle>
          <CardDescription>
            Sett tonen for landingssiden din med en sterk overskrift, underoverskrift og beskrivelse.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field>
            <FieldLabel htmlFor="landingHeroTitle">Overskrift</FieldLabel>
            <Input
              id="landingHeroTitle"
              value={formData.landingHeroTitle}
              onChange={(event) => onChange({ landingHeroTitle: event.target.value })}
              placeholder="Gi kampanjen et tydelig løfte"
            />
            <FieldDescription>
              Dette er teksten som fanger oppmerksomheten til besøkende først.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="landingHeroSubtitle">Underoverskrift</FieldLabel>
            <Input
              id="landingHeroSubtitle"
              value={formData.landingHeroSubtitle}
              onChange={(event) => onChange({ landingHeroSubtitle: event.target.value })}
              placeholder="Utdyp verdiforslaget med én setning"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="landingHeroDescription">Beskrivelse</FieldLabel>
            <Textarea
              id="landingHeroDescription"
              value={formData.landingHeroDescription}
              onChange={(event) => onChange({ landingHeroDescription: event.target.value })}
              placeholder="Fortell kort hva brukeren får ut av å registrere seg"
              rows={3}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Knapper og handlinger</CardTitle>
          <CardDescription>
            Definer hva slags handling du ønsker at brukerne skal gjøre.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel htmlFor="landingPrimaryActionLabel">Primær CTA-tekst</FieldLabel>
              <Input
                id="landingPrimaryActionLabel"
                value={formData.landingPrimaryActionLabel}
                onChange={(event) => onChange({ landingPrimaryActionLabel: event.target.value })}
                placeholder="Registrer deg nå"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="landingPrimaryActionUrl">Primær CTA-lenke (valgfritt)</FieldLabel>
              <Input
                id="landingPrimaryActionUrl"
                type="url"
                value={formData.landingPrimaryActionUrl}
                onChange={(event) => onChange({ landingPrimaryActionUrl: event.target.value })}
                placeholder="https://dinbedrift.no/kampanje"
              />
              <FieldDescription>
                Legg igjen tom for å bruke standard påmeldingsskjema.
              </FieldDescription>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel htmlFor="landingSecondaryActionLabel">Sekundær CTA-tekst (valgfritt)</FieldLabel>
              <Input
                id="landingSecondaryActionLabel"
                value={formData.landingSecondaryActionLabel}
                onChange={(event) => onChange({ landingSecondaryActionLabel: event.target.value })}
                placeholder="Les mer"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="landingSecondaryActionUrl">Sekundær CTA-lenke (valgfritt)</FieldLabel>
              <Input
                id="landingSecondaryActionUrl"
                type="url"
                value={formData.landingSecondaryActionUrl}
                onChange={(event) => onChange({ landingSecondaryActionUrl: event.target.value })}
                placeholder="https://dinbedrift.no"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Høydepunkter</CardTitle>
          <CardDescription>
            Vis fordelene eller funksjonene som gjør kampanjen attraktiv. Du kan legge til opptil fire høydepunkter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasHighlights ? (
            formData.landingHighlights.map((highlight, index) => (
              <div key={`highlight-${index}`} className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Høydepunkt {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveHighlight(index)}
                    disabled={formData.landingHighlights.length === 1}
                  >
                    <IconTrash className="mr-2 h-4 w-4" />
                    Fjern
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor={`highlight-title-${index}`}>Tittel</FieldLabel>
                    <Input
                      id={`highlight-title-${index}`}
                      value={highlight.title}
                      onChange={(event) =>
                        onUpdateHighlight(index, { title: event.target.value })
                      }
                      placeholder="Hva er fordelen?"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`highlight-description-${index}`}>
                      Beskrivelse
                    </FieldLabel>
                    <Textarea
                      id={`highlight-description-${index}`}
                      value={highlight.description}
                      onChange={(event) =>
                        onUpdateHighlight(index, { description: event.target.value })
                      }
                      rows={3}
                      placeholder="Forklar kort hvorfor dette er nyttig"
                    />
                  </Field>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Ingen høydepunkter enda. Legg til et høydepunkt for å vise frem fordelene.
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddHighlight}
            disabled={formData.landingHighlights.length >= 4}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Legg til høydepunkt
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Premiebilde</CardTitle>
          <CardDescription>
            Last opp et bilde av premien eller produktet som kan vinnes. Dette vises i hero-seksjonen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            currentImageUrl={formData.landingPrizeImage}
            onUploadComplete={(url) => onChange({ landingPrizeImage: url })}
            onRemove={() => onChange({ landingPrizeImage: "" })}
            aspectRatio="video"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Anbefalt størrelse: 1200x675 piksler (16:9 format)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leadskjema</CardTitle>
          <CardDescription>
            Bestem om landingssiden skal vise et innebygd leadskjema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="font-medium">Vis leadskjema</p>
              <p className="text-sm text-muted-foreground">
                Når aktivert vises standard leadskjema på landingssiden og data sendes til dashboardet ditt.
              </p>
            </div>
            <Switch
              id="landingShowLeadForm"
              checked={formData.landingShowLeadForm}
              onCheckedChange={(checked) => onChange({ landingShowLeadForm: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
