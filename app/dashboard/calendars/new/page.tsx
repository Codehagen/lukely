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

      if (!response.ok) throw new Error("Failed to create calendar");

      const calendar = await response.json();
      toast.success("Calendar created successfully!");
      router.push(`/dashboard/calendars/${calendar.id}`);
    } catch (error) {
      toast.error("Failed to create calendar");
      console.error(error);
    }
  };

  const generateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData({ ...formData, title, slug });
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Calendar</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new giveaway calendar for your business
        </p>
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Choose a Template</h2>
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
                    {template.doorCount} doors
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
            <h2 className="text-xl font-semibold">Configure Calendar</h2>
            <Button variant="outline" onClick={() => setStep(1)}>
              Back to Templates
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup className="flex flex-col gap-6">
                <Field>
                  <FieldLabel htmlFor="title">Calendar Title</FieldLabel>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => generateSlug(e.target.value)}
                    placeholder="My Christmas Giveaway 2024"
                  />
                  <FieldDescription>
                    This will be displayed as the main heading on your calendar
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="slug">URL Slug</FieldLabel>
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
                      This creates your unique calendar URL
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter a description for your calendar..."
                    rows={3}
                  />
                  <FieldDescription>
                    Optional description shown on the public calendar page
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dates & Doors</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Start Date</FieldLabel>
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
                          {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
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
                    <FieldDescription>When the first door opens</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>End Date</FieldLabel>
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
                          {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
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
                    <FieldDescription>When the last door opens</FieldDescription>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="doorCount">Number of Doors</FieldLabel>
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
                      This template has a fixed number of doors
                    </FieldDescription>
                  ) : (
                    <FieldDescription>
                      Choose how many doors your calendar will have (1-31)
                    </FieldDescription>
                  )}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>
            <CardContent>
              <Field>
                <FieldLabel htmlFor="brandColor">Brand Color</FieldLabel>
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
                  This color will be used for buttons and accents on your calendar
                </FieldDescription>
              </Field>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.push("/dashboard/calendars")}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Calendar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
