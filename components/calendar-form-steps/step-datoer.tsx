import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconCalendar } from "@tabler/icons-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface StepDatoerProps {
  formData: {
    startDate: Date;
    endDate: Date;
    doorCount: number;
  };
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onDoorCountChange: (count: number) => void;
  templateFlexible: boolean;
}

export function StepDatoer({
  formData,
  onStartDateChange,
  onEndDateChange,
  onDoorCountChange,
  templateFlexible,
}: StepDatoerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datoer og luker</CardTitle>
        <CardDescription>
          Velg når kalenderen skal kjøre og hvor mange luker du vil ha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel>Startdato</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <IconCalendar className="mr-2 h-4 w-4" />
                    {formData.startDate
                      ? format(formData.startDate, "PPP", { locale: nb })
                      : "Velg en dato"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && onStartDateChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FieldDescription>Når den første luken åpnes</FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Sluttdato</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <IconCalendar className="mr-2 h-4 w-4" />
                    {formData.endDate
                      ? format(formData.endDate, "PPP", { locale: nb })
                      : "Velg en dato"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => date && onEndDateChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FieldDescription>Når den siste luken åpnes</FieldDescription>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="doorCount">Antall luker</FieldLabel>
            <Input
              id="doorCount"
              type="number"
              min="1"
              max="31"
              value={formData.doorCount}
              onChange={(e) => onDoorCountChange(parseInt(e.target.value))}
              disabled={!templateFlexible}
            />
            {!templateFlexible ? (
              <FieldDescription>
                Denne malen har et fast antall luker
              </FieldDescription>
            ) : (
              <FieldDescription>
                Velg hvor mange luker kalenderen skal ha (1-31)
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
