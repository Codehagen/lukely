"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { CALENDAR_TEMPLATES, getDefaultDatesForYear } from "@/lib/calendar-templates";
import { CalendarType } from "@/app/generated/prisma";
import { toast } from "sonner";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { IconCalendar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export default function NewCalendarPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
    startDate: new Date(),
    endDate: new Date(),
    doorCount: 24,
    brandColor: "#3B82F6",
    requireEmail: true,
    requireName: true,
    requirePhone: false,
  });

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = CALENDAR_TEMPLATES[templateKey];

    const currentYear = new Date().getFullYear();
    const dates = getDefaultDatesForYear(template, currentYear);

    setFormData({
      ...formData,
      title: template.title,
      description: template.description,
      doorCount: template.doorCount,
      brandColor: template.theme.colors[0],
      startDate: dates?.startDate || new Date(),
      endDate: dates?.endDate || new Date(),
    });

    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedTemplate) return;

    try {
      const template = CALENDAR_TEMPLATES[selectedTemplate];

      const response = await fetch("/api/calendars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          type: template.type,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Kunne ikke opprette kalender");

      const calendar = await response.json();
      toast.success("Kalenderen ble opprettet!");
      router.push(`/dashboard/calendars/${calendar.id}`);
    } catch (error) {
      toast.error("Kunne ikke opprette kalender");
      console.error(error);
    }
  };

  const generateSlug = (title: string) => {
    const normalizedTitle = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/å/g, "a");

    const slug = normalizedTitle
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData({ ...formData, title, slug });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Opprett ny kalender</h2>
          <p className="text-muted-foreground">
            Sett opp en ny konkurransekalender for virksomheten din
          </p>
        </div>
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Velg en mal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(CALENDAR_TEMPLATES).map(([key, template]) => (
              <Card
                key={key}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleTemplateSelect(key)}
              >
                <CardHeader>
                  <div className="text-4xl mb-2">{template.theme.icon}</div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {template.doorCount} luker
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {step === 2 && selectedTemplate && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Konfigurer kalender</h2>
            <Button variant="outline" onClick={() => setStep(1)}>
              Tilbake til maler
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Grunnleggende informasjon</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup className="flex flex-col gap-6">
                <Field>
                  <FieldLabel htmlFor="title">Kalendertittel</FieldLabel>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => generateSlug(e.target.value)}
                    placeholder="Min julekalender 2024"
                  />
                  <FieldDescription>
                    Dette vises som hovedoverskriften på kalenderen din
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="slug">URL-slug</FieldLabel>
                  <FieldContent>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">yoursite.com/c/</span>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="christmas-2024"
                      />
                    </div>
                    <FieldDescription>
                      Dette lager den unike kalenderadressen din
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="description">Beskrivelse</FieldLabel>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

          <Card>
            <CardHeader>
              <CardTitle>Datoer og luker</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
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
                          {formData.startDate ? format(formData.startDate, "PPP", { locale: nb }) : "Velg en dato"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
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
                          {formData.endDate ? format(formData.endDate, "PPP", { locale: nb }) : "Velg en dato"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
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
                    onChange={(e) => setFormData({ ...formData, doorCount: parseInt(e.target.value) })}
                    disabled={!CALENDAR_TEMPLATES[selectedTemplate].flexible}
                  />
                  {!CALENDAR_TEMPLATES[selectedTemplate].flexible ? (
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

          <Card>
            <CardHeader>
              <CardTitle>Merkevare</CardTitle>
            </CardHeader>
            <CardContent>
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
                  />
                </div>
                <FieldDescription>
                  Denne fargen brukes på knapper og detaljer i kalenderen
                </FieldDescription>
              </Field>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.push("/dashboard/calendars")}>
              Avbryt
            </Button>
            <Button onClick={handleSubmit}>
              Opprett kalender
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
