import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GOOGLE_FONTS, getFontFamilyValue } from "@/lib/google-fonts";
import { useGoogleFont } from "@/hooks/use-google-font";

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
            Denne fargen brukes på knapper og detaljer i kalenderen. Se forhåndsvisning til høyre.
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
          <FieldLabel htmlFor="logo">Logo URL</FieldLabel>
          <Input
            id="logo"
            type="url"
            value={formData.logo || ""}
            onChange={(e) => onLogoChange(e.target.value || null)}
            placeholder="https://example.com/logo.png"
          />
          <FieldDescription>
            Logo-URL (valgfritt). Logoen vil vises når du implementerer bildeopplasting.
          </FieldDescription>
          {formData.logo && (
            <div className="mt-2 p-2 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground break-all">
                Lagret: {formData.logo}
              </p>
            </div>
          )}
        </Field>
      </CardContent>
    </Card>
  );
}
