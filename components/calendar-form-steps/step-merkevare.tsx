import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/image-upload";
import { GOOGLE_FONTS, getFontFamilyValue } from "@/lib/google-fonts";
import { useGoogleFont } from "@/hooks/use-google-font";
import { IconPhoto } from "@tabler/icons-react";

interface StepMerkevareProps {
  formData: {
    brandColor: string;
    brandFont?: string;
    logo?: string;
  };
  onBrandColorChange: (color: string) => void;
  onBrandFontChange: (font: string) => void;
  onLogoChange: (url: string | null) => void;
}

export function StepMerkevare({
  formData,
  onBrandColorChange,
  onBrandFontChange,
  onLogoChange,
}: StepMerkevareProps) {
  const selectedFont = formData.brandFont || "Inter";
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

  // Load the selected font dynamically
  useGoogleFont(selectedFont);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Merkevare</CardTitle>
        <CardDescription>
          Tilpass kalenderen med din merkevare
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
          <div className="space-y-6">
            <Field>
              <FieldLabel htmlFor="brandColor">Profilfarge</FieldLabel>
              <div className="flex items-center gap-4">
                <Input
                  id="brandColor"
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) => onBrandColorChange(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.brandColor}
                  onChange={(e) => onBrandColorChange(e.target.value)}
                  placeholder={fallbackColor}
                />
              </div>
              <FieldDescription>
                Denne fargen brukes på knapper og detaljer i kalenderen
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="brandFont">Skrifttype</FieldLabel>
              <Select value={selectedFont} onValueChange={onBrandFontChange}>
                <SelectTrigger id="brandFont">
                  <SelectValue placeholder="Velg skrifttype" />
                </SelectTrigger>
                <SelectContent>
                  {GOOGLE_FONTS.map((font) => (
                    <SelectItem
                      key={font.name}
                      value={font.name}
                      style={{ fontFamily: getFontFamilyValue(font.name) }}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{font.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {font.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Denne skrifttypen brukes på overskrifter og viktige elementer
              </FieldDescription>

              <div
                className="mt-4 p-4 border rounded-md bg-muted/50"
                style={{ fontFamily: getFontFamilyValue(selectedFont) }}
              >
                <p className="text-2xl font-semibold mb-2">
                  {selectedFont}
                </p>
                <p className="text-sm text-muted-foreground">
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
            </Field>

            <Field>
              <FieldLabel>Logo</FieldLabel>
              <ImageUpload
                currentImageUrl={formData.logo}
                onUploadComplete={(url) => onLogoChange(url)}
                onRemove={() => onLogoChange(null)}
                aspectRatio="square"
              />
              <FieldDescription>
                Last opp din logo (helst kvadratisk PNG med transparent bakgrunn)
              </FieldDescription>
            </Field>
          </div>

          <div
            className="flex flex-col justify-between gap-6 rounded-xl border bg-background/60 p-6"
            style={{
              fontFamily: getFontFamilyValue(selectedFont),
              borderColor: accentBorder,
              background: `linear-gradient(160deg, ${accentSurface} 0%, transparent 100%)`,
            }}
          >
            <div className="flex items-start gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm">
                {formData.logo ? (
                  <Image
                    src={formData.logo}
                    alt="Forhåndsvisning av logo"
                    fill
                    className="object-contain p-2"
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
                className="w-full rounded-md px-4 py-2 text-sm font-semibold text-white shadow"
                style={{ backgroundColor: accentColor }}
              >
                Delta nå
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
