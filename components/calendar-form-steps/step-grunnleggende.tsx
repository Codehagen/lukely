import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HOME_DOMAIN } from "@/lib/config";
import { IconWand, IconLoader2, IconSparkles } from "@tabler/icons-react";
import { toast } from "sonner";

interface StepGrunnleggendeProps {
  formData: {
    title: string;
    slug: string;
    description: string;
  };
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onDescriptionChange: (description: string) => void;
  onBrandingImport?: (branding: {
    title: string;
    description: string;
    brandColor?: string;
    logo?: string;
  }) => void;
}

export function StepGrunnleggende({
  formData,
  onTitleChange,
  onSlugChange,
  onDescriptionChange,
  onBrandingImport,
}: StepGrunnleggendeProps) {
  const calendarUrlPrefix = `${HOME_DOMAIN.replace(/\/$/, "")}/c/`;
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    if (!websiteUrl.trim()) {
      toast.error("Vennligst skriv inn en URL");
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading("Analyserer nettside med AI...");

    try {
      const response = await fetch("/api/analyze-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunne ikke analysere nettsiden");
      }

      // Extract branding data
      const { businessName, description, suggestedCalendarTitle, brandColor, logoUrl } = data.data;

      // Update form fields
      onTitleChange(suggestedCalendarTitle || businessName || "");
      onDescriptionChange(description || "");

      // Pass branding info to parent (for color and logo)
      if (onBrandingImport) {
        onBrandingImport({
          title: suggestedCalendarTitle || businessName || "",
          description: description || "",
          brandColor: brandColor || undefined,
          logo: logoUrl || undefined,
        });
      }

      toast.success("Merkevare importert! ✨", {
        id: toastId,
        description: `Hentet info fra ${businessName}`,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kunne ikke importere merkevare", {
        id: toastId,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Import Section */}
      <Card className="border-2 border-dashed border-primary/40 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconSparkles className="h-5 w-5 text-primary" />
            <CardTitle>Importer merkevare fra nettside</CardTitle>
          </div>
          <CardDescription>
            Lim inn nettsiden til bedriften din, så fyller vi ut resten automatisk med AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="https://dinbedrift.no"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isImporting) {
                  handleImport();
                }
              }}
              disabled={isImporting}
              className="flex-1"
            />
            <Button
              onClick={handleImport}
              disabled={isImporting || !websiteUrl.trim()}
              className="sm:w-auto w-full"
            >
              {isImporting ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyserer...
                </>
              ) : (
                <>
                  <IconWand className="mr-2 h-4 w-4" />
                  Importer med AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Eller fyll ut manuelt</span>
        </div>
      </div>

      {/* Manual Input Section */}
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
                    {calendarUrlPrefix}
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
    </div>
  );
}
