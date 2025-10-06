"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { IconCheck, IconPalette, IconPhoto } from "@tabler/icons-react";
import { Spinner } from "@/components/ui/spinner";

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

  const fallbackColor = "#3B82F6";
  const isValidHexColor = /^#([0-9a-fA-F]{6})$/.test(formData.brandColor);
  const accentColor = isValidHexColor ? formData.brandColor : fallbackColor;

  const parseHex = (hex: string) => {
    const cleanHex = hex.replace("#", "");
    if (cleanHex.length !== 6) return null;
    const bigint = Number.parseInt(cleanHex, 16);
    if (Number.isNaN(bigint)) return null;
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const rgb = parseHex(hex) ?? parseHex(fallbackColor)!;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };

  const accentSurface = hexToRgba(accentColor, 0.08);
  const accentBorder = hexToRgba(accentColor, 0.14);

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
                <Spinner className="mr-2 h-4 w-4" />
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
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
          {/* Left Column: Form Fields */}
          <div className="space-y-6">
            {/* Colors & Text Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Farger & Tekst</h3>

              <Field>
                <FieldLabel htmlFor="brandColor">Profilfarge</FieldLabel>
                <div className="flex items-center gap-3">
                  <Input
                    id="brandColor"
                    type="color"
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    className="w-16 h-10 cursor-pointer"
                  />
                  <Input
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1 font-mono"
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
            </div>

            {/* Images Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-foreground">Bilder</h3>

              <Field>
                <FieldLabel htmlFor="logo">Logo-URL</FieldLabel>
                <Input
                  id="logo"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo && (
                  <div className="mt-3 border rounded-lg p-4 bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Forhåndsvisning</p>
                    <div className="relative h-16 flex items-center justify-center">
                      <img
                        src={formData.logo}
                        alt="Logo preview"
                        className="max-h-16 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}
                <FieldDescription>
                  Vis logoen din på den offentlige kalendersiden
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="bannerImage">Bannerbilde-URL</FieldLabel>
                <Input
                  id="bannerImage"
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                />
                {formData.bannerImage && (
                  <div className="mt-3 border rounded-lg overflow-hidden bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground px-4 pt-3 pb-2">Forhåndsvisning</p>
                    <img
                      src={formData.bannerImage}
                      alt="Banner preview"
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <FieldDescription>
                  Valgfritt toppbanner for kalenderen
                </FieldDescription>
              </Field>
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div
            className="flex flex-col justify-between gap-6 rounded-xl border bg-background/60 p-6"
            style={{
              borderColor: accentBorder,
              background: `linear-gradient(160deg, ${accentSurface} 0%, transparent 100%)`,
            }}
          >
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Forhåndsvisning
              </p>
              <div className="flex items-start gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm">
                  {formData.logo ? (
                    <Image
                      src={formData.logo}
                      alt="Forhåndsvisning av logo"
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <IconPhoto className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold" style={{ color: accentColor }}>
                    Din merkevare
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Slik kan kalenderen din se ut for deltakerne.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div
                className="rounded-lg border bg-background/80 p-4 shadow-sm"
                style={{ borderColor: accentBorder }}
              >
                <p className="text-sm font-medium" style={{ color: accentColor }}>
                  Luke 1 – 1. desember
                </p>
                <p className="text-base font-semibold mt-1">Vinn en eksklusiv premie</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Delta i dagens luke for en sjanse til å vinne. Vi trekker en heldig vinner hver dag!
                </p>
              </div>

              <button
                type="button"
                className="w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow transition-opacity hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                {formData.buttonText}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
