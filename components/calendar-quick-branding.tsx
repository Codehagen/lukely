"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { IconCheck, IconLoader2, IconPalette } from "@tabler/icons-react";

interface CalendarQuickBrandingProps {
  calendar: {
    id: string;
    brandColor: string | null;
    logo: string | null;
    bannerImage: string | null;
    buttonText: string | null;
    thankYouMessage: string | null;
  };
}

export function CalendarQuickBranding({ calendar }: CalendarQuickBrandingProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    brandColor: calendar.brandColor || "#3B82F6",
    logo: calendar.logo || "",
    bannerImage: calendar.bannerImage || "",
    buttonText: calendar.buttonText || "Delta nå",
    thankYouMessage: calendar.thankYouMessage || "Takk for din deltakelse!",
  });

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/calendars/${calendar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Kunne ikke oppdatere merkevare");

      toast.success("Merkevare oppdatert!");
      router.refresh();
    } catch (error) {
      toast.error("Kunne ikke oppdatere merkevare");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify({
    brandColor: calendar.brandColor || "#3B82F6",
    logo: calendar.logo || "",
    bannerImage: calendar.bannerImage || "",
    buttonText: calendar.buttonText || "Delta nå",
    thankYouMessage: calendar.thankYouMessage || "Takk for din deltakelse!",
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconPalette className="h-5 w-5" />
              Hurtig merkevare-redigering
            </CardTitle>
            <CardDescription>
              Tilpass utseendet til kalenderen din
            </CardDescription>
          </div>
          <Button
            onClick={handleUpdate}
            disabled={!hasChanges || isUpdating}
            size="sm"
          >
            {isUpdating ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Lagrer ...
              </>
            ) : (
              <>
                <IconCheck className="mr-2 h-4 w-4" />
                Lagre endringer
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup className="flex flex-col gap-6">
          <Field>
            <FieldLabel htmlFor="brandColor">Profilfarge</FieldLabel>
            <div className="flex items-center gap-4">
              <Input
                id="brandColor"
                type="color"
                value={formData.brandColor}
                onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={formData.brandColor}
                onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
            <FieldDescription>
              Brukes på knapper og detaljer i kalenderen
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="buttonText">Knappetekst</FieldLabel>
            <Input
              id="buttonText"
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              placeholder="Delta nå"
            />
            <FieldDescription>
              Teksten som vises på deltakelsesknappen
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="thankYouMessage">Takkemelding</FieldLabel>
            <Input
              id="thankYouMessage"
              value={formData.thankYouMessage}
              onChange={(e) => setFormData({ ...formData, thankYouMessage: e.target.value })}
              placeholder="Takk for din deltakelse!"
            />
            <FieldDescription>
              Meldingen som vises etter en vellykket deltakelse
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="logo">Logo-URL</FieldLabel>
            <div className="space-y-2">
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
              {formData.logo && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <img
                    src={formData.logo}
                    alt="Logo preview"
                    className="h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
            <FieldDescription>
              Vis logoen din på den offentlige kalendersiden
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="bannerImage">Bannerbilde-URL</FieldLabel>
            <div className="space-y-2">
              <Input
                id="bannerImage"
                value={formData.bannerImage}
                onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
              {formData.bannerImage && (
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={formData.bannerImage}
                    alt="Banner preview"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
            <FieldDescription>
              Valgfritt toppbanner for kalenderen
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
