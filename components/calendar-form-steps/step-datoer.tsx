import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconCalendar, IconClock, IconCalendarMonth, IconSettings, IconCheck } from "@tabler/icons-react";
import { format, addDays, differenceInDays } from "date-fns";
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
}

type DurationPreset = "1week" | "2weeks" | "1month" | "custom";

interface PresetOption {
  id: DurationPreset;
  label: string;
  description: string;
  icon: React.ReactNode;
  doorCount: number;
  durationDays: number;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    id: "1week",
    label: "1 Uke",
    description: "7 luker over 1 uke",
    icon: <IconClock className="h-5 w-5" />,
    doorCount: 7,
    durationDays: 7,
  },
  {
    id: "2weeks",
    label: "2 Uker",
    description: "14 luker over 2 uker",
    icon: <IconCalendar className="h-5 w-5" />,
    doorCount: 14,
    durationDays: 14,
  },
  {
    id: "1month",
    label: "1 Måned",
    description: "30 luker over 1 måned",
    icon: <IconCalendarMonth className="h-5 w-5" />,
    doorCount: 30,
    durationDays: 30,
  },
  {
    id: "custom",
    label: "Tilpasset",
    description: "Velg egne datoer og antall luker",
    icon: <IconSettings className="h-5 w-5" />,
    doorCount: 0,
    durationDays: 0,
  },
];

export function StepDatoer({
  formData,
  onStartDateChange,
  onEndDateChange,
  onDoorCountChange,
}: StepDatoerProps) {
  const [selectedPreset, setSelectedPreset] = useState<DurationPreset>("custom");

  // Calculate door count from date range
  const calculateDoorCount = (start: Date, end: Date): number => {
    const days = differenceInDays(end, start) + 1; // +1 to include both start and end day
    return Math.max(1, Math.min(31, days)); // Clamp between 1 and 31
  };

  const handlePresetSelect = (preset: DurationPreset) => {
    setSelectedPreset(preset);

    if (preset !== "custom") {
      const option = PRESET_OPTIONS.find((opt) => opt.id === preset);
      if (option) {
        const today = new Date();
        const endDate = addDays(today, option.durationDays - 1);
        const calculatedDoorCount = calculateDoorCount(today, endDate);

        onStartDateChange(today);
        onEndDateChange(endDate);
        onDoorCountChange(calculatedDoorCount);
      }
    }
  };

  const handleStartDateChange = (date: Date) => {
    const newDate = new Date(date);
    onStartDateChange(newDate);
    // Recalculate door count when start date changes
    const calculatedDoorCount = calculateDoorCount(newDate, formData.endDate);
    onDoorCountChange(calculatedDoorCount);
  };

  const handleEndDateChange = (date: Date) => {
    const newDate = new Date(date);
    onEndDateChange(newDate);
    // Recalculate door count when end date changes
    const calculatedDoorCount = calculateDoorCount(formData.startDate, newDate);
    onDoorCountChange(calculatedDoorCount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Velg varighet</h2>
        <p className="text-muted-foreground">
          Hvor lenge skal kalenderen kjøre?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRESET_OPTIONS.map((option) => (
          <Card
            key={option.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              selectedPreset === option.id && "border-primary bg-primary/5"
            )}
            onClick={() => handlePresetSelect(option.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="text-primary">{option.icon}</div>
                    <CardTitle>{option.label}</CardTitle>
                  </div>
                  <CardDescription>{option.description}</CardDescription>
                </div>
                {selectedPreset === option.id && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <IconCheck className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datoer og varighet</CardTitle>
          <CardDescription>
            {selectedPreset === "custom"
              ? "Velg når kalenderen skal kjøre og hvor mange luker du vil ha"
              : "Forhåndsutfylt basert på ditt valg - du kan justere datoene om nødvendig"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel>Startdato</FieldLabel>
                <Popover key={`start-${selectedPreset}-${formData.startDate?.getTime()}`}>
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
                      onSelect={(date) => date && handleStartDateChange(date)}
                    />
                  </PopoverContent>
                </Popover>
                <FieldDescription>Når den første luken åpnes</FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Sluttdato</FieldLabel>
                <Popover key={`end-${selectedPreset}-${formData.endDate?.getTime()}`}>
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
                      onSelect={(date) => date && handleEndDateChange(date)}
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
                disabled={true}
              />
              <FieldDescription>
                Automatisk beregnet fra datoene ({formData.doorCount} dager)
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
