import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface StepGrunnleggendeProps {
  formData: {
    title: string;
    slug: string;
    description: string;
  };
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onDescriptionChange: (description: string) => void;
}

export function StepGrunnleggende({
  formData,
  onTitleChange,
  onSlugChange,
  onDescriptionChange,
}: StepGrunnleggendeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grunnleggende informasjon</CardTitle>
        <CardDescription>
          Gi kalenderen din et navn og en unik adresse
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel htmlFor="title">Kalendertittel</FieldLabel>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Min julekalender 2024"
              />
              <FieldDescription>
                Dette vises som hovedoverskriften på kalenderen din
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="slug">URL-slug</FieldLabel>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  yoursite.com/c/
                </span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => onSlugChange(e.target.value)}
                  placeholder="christmas-2024"
                />
              </div>
              <FieldDescription>
                Dette lager den unike kalenderadressen din
              </FieldDescription>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="description">Beskrivelse</FieldLabel>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Skriv inn en beskrivelse av kalenderen..."
              rows={3}
            />
            <FieldDescription>
              Valgfri beskrivelse som vises på den offentlige kalendersiden
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
