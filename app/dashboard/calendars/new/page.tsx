"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CALENDAR_TEMPLATES, getDefaultDatesForYear } from "@/lib/calendar-templates";
import { CalendarType } from "@/app/generated/prisma";
import { toast } from "sonner";

export default function NewCalendarPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
    startDate: "",
    endDate: "",
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
      startDate: dates?.startDate.toISOString().split("T")[0] || "",
      endDate: dates?.endDate.toISOString().split("T")[0] || "",
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
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Calendar Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => generateSlug(e.target.value)}
                  placeholder="My Christmas Giveaway 2024"
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">yoursite.com/c/</span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="christmas-2024"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter a description for your calendar..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dates & Doors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="doorCount">Number of Doors</Label>
                <Input
                  id="doorCount"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.doorCount}
                  onChange={(e) => setFormData({ ...formData, doorCount: parseInt(e.target.value) })}
                  disabled={!CALENDAR_TEMPLATES[selectedTemplate].flexible}
                />
                {!CALENDAR_TEMPLATES[selectedTemplate].flexible && (
                  <p className="text-sm text-muted-foreground mt-1">
                    This template has a fixed number of doors
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="brandColor">Brand Color</Label>
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
              </div>
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
