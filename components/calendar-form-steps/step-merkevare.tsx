import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface StepMerkevareProps {
  formData: {
    brandColor: string;
  };
  onBrandColorChange: (color: string) => void;
}

export function StepMerkevare({
  formData,
  onBrandColorChange,
}: StepMerkevareProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Merkevare</CardTitle>
        <CardDescription>
          Tilpass kalenderen med din merkevare
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              placeholder="#3B82F6"
            />
          </div>
          <FieldDescription>
            Denne fargen brukes på knapper og detaljer i kalenderen
          </FieldDescription>
        </Field>
      </CardContent>
    </Card>
  );
}
