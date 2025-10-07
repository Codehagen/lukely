"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CALENDAR_TEMPLATES, getDefaultDatesForYear } from "@/lib/calendar-templates";
import { toast } from "sonner";
import { Stepper, Step } from "@/components/ui/stepper";
import { StepNavigation } from "@/components/calendar-form-steps/step-navigation";
import { StepFormat } from "@/components/calendar-form-steps/step-format";
import { StepGrunnleggende } from "@/components/calendar-form-steps/step-grunnleggende";
import { StepDatoer } from "@/components/calendar-form-steps/step-datoer";
import { StepQuiz } from "@/components/calendar-form-steps/step-quiz";
import { StepMerkevare } from "@/components/calendar-form-steps/step-merkevare";
import { StepOppsummering } from "@/components/calendar-form-steps/step-oppsummering";
import CalendarPreview from "@/components/calendar-preview";
import { IconEye, IconEyeOff, IconArrowRight, IconArrowLeft } from "@tabler/icons-react";

const FORM_STEPS: Step[] = [
  { id: 1, title: "Format" },
  { id: 2, title: "Mal" },
  { id: 3, title: "Grunnleggende" },
  { id: 4, title: "Datoer" },
  { id: 5, title: "Quiz", optional: true },
  { id: 6, title: "Merkevare", optional: true },
  { id: 7, title: "Oppsummering" },
];

export default function NewCalendarForm() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [currentFormStep, setCurrentFormStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [formData, setFormData] = useState({
    calendarFormat: "" as "landing" | "quiz" | "",
    title: "",
    description: "",
    slug: "",
    startDate: new Date(),
    endDate: new Date(),
    doorCount: 24,
    brandColor: "#3B82F6",
    brandFont: "Inter",
    logo: "",
    requireEmail: true,
    requireName: true,
    requirePhone: false,
    enableQuiz: false,
    defaultQuizPassingScore: 80,
    defaultShowCorrectAnswers: false,
    defaultAllowRetry: false,
    aiQuizInstructions: "",
    generateAllQuizzes: false,
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
      // Auto-enable quiz if format is quiz
      enableQuiz: formData.calendarFormat === "quiz",
    });

    // Move to step 3 (Grunnleggende)
    setCurrentFormStep(3);
  };

  const handleBrandingImport = (branding: {
    brandColor?: string;
  }) => {
    setFormData({
      ...formData,
      brandColor: branding.brandColor || formData.brandColor,
    });
  };

  const generateRandomSuffix = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateSlug = (title: string) => {
    const normalizedTitle = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/å/g, "a");

    const baseSlug = normalizedTitle
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Add random suffix for uniqueness
    const slug = `${baseSlug}-${generateRandomSuffix()}`;
    setFormData({ ...formData, title, slug });
  };

  const nextStep = () => {
    if (currentFormStep < FORM_STEPS.length) {
      let nextStepNumber = currentFormStep + 1;

      // Skip quiz step (5) if format is "landing"
      if (nextStepNumber === 5 && formData.calendarFormat === "landing") {
        nextStepNumber = 6;
      }

      setCurrentFormStep(nextStepNumber);
    }
  };

  const previousStep = () => {
    if (currentFormStep > 1) {
      let prevStepNumber = currentFormStep - 1;

      // Skip quiz step (5) if format is "landing" when going back
      if (prevStepNumber === 5 && formData.calendarFormat === "landing") {
        prevStepNumber = 4;
      }

      setCurrentFormStep(prevStepNumber);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentFormStep) {
      setCurrentFormStep(step);
    }
  };

  const skipToSummary = () => {
    setCurrentFormStep(7); // Updated to new step count
  };

  const canProceedFromCurrentStep = () => {
    switch (currentFormStep) {
      case 1: // Format selection
        return !!formData.calendarFormat;
      case 2: // Template selection
        return !!selectedTemplate;
      case 3: // Grunnleggende (title and slug required)
        return !!formData.title.trim() && !!formData.slug.trim();
      case 4: // Datoer
        return true; // Dates are set automatically
      case 5: // Quiz (optional step)
        return true;
      case 6: // Merkevare (optional step)
        return true;
      case 7: // Oppsummering
        return true;
      default:
        return true;
    }
  };

  const handleSaveDraft = () => {
    toast.message("Lagring som utkast kommer snart");
  };

  const handlePreview = () => {
    toast.message("Forhåndsvisningen er ikke tilgjengelig enda");
  };

  const handleSubmit = async () => {
    if (!selectedTemplate) return;

    // Validate required fields
    if (!formData.title || !formData.slug) {
      toast.error("Vennligst fyll ut tittel og URL-slug");
      return;
    }

    setIsCreating(true);
    try {
      const template = CALENDAR_TEMPLATES[selectedTemplate];

      // Step 1: Create calendar
      const response = await fetch("/api/calendars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          type: template.type,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
          calendarFormat: formData.calendarFormat,
          // Auto-enable quiz if format is "quiz"
          enableQuiz: formData.calendarFormat === "quiz" ? true : formData.enableQuiz,
        }),
      });

      if (!response.ok) throw new Error("Kunne ikke opprette kalender");

      const calendar = await response.json();

      // Step 2: Generate all quizzes if requested
      if (formData.enableQuiz && formData.generateAllQuizzes) {
        toast.loading("Genererer quizer med AI...", { id: "quiz-gen" });

        const quizResponse = await fetch(
          `/api/calendars/${calendar.id}/generate-all-quizzes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionCount: 1 }),
          }
        );

        if (quizResponse.ok) {
          const quizResult = await quizResponse.json();
          toast.success(quizResult.message, { id: "quiz-gen" });
        } else {
          toast.error("Noen quizer kunne ikke genereres", { id: "quiz-gen" });
        }
      } else {
        toast.success("Kalenderen ble opprettet!");
      }

      router.push(`/dashboard/calendars/${calendar.id}`);
    } catch (error) {
      toast.error("Kunne ikke opprette kalender");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Opprett ny kalender</h2>
        <p className="text-muted-foreground">
          Sett opp en ny konkurransekalender for virksomheten din
        </p>
      </div>

      {/* Split-screen layout - Form prioritized, preview on right */}
      <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-[1fr_1fr] xl:grid-cols-[3fr_2fr]" : "grid-cols-1"}`}>
        {/* LEFT PANEL */}
        <div className={`space-y-6 ${!showPreview ? "max-w-4xl mx-auto w-full" : ""}`}>
          {/* Step 1: Format Selection */}
          {currentFormStep === 1 && (
            <>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Velg kalenderformat</h2>
                <StepFormat
                  formData={formData}
                  onFormatChange={(format) => setFormData({ ...formData, calendarFormat: format })}
                />

                {/* Navigation button - appears after format is selected */}
                {formData.calendarFormat && (
                  <div className="flex justify-end pt-4">
                    <Button onClick={nextStep} size="lg">
                      Neste
                      <IconArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 2: Template Selection */}
          {currentFormStep === 2 && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Velg en mal</h2>
                  <Button variant="ghost" size="sm" onClick={previousStep}>
                    <IconArrowLeft className="mr-2 h-4 w-4" />
                    Tilbake
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4">
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
            </>
          )}

          {/* Steps 3-7: Form Configuration */}
          {currentFormStep >= 3 && selectedTemplate && (
            <>
              {/* Stepper Navigation - Clean and Prominent */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-xl font-semibold">Konfigurer kalender</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className="hidden lg:flex items-center gap-1.5"
                    >
                      {showPreview ? (
                        <>
                          <IconEyeOff className="h-4 w-4" />
                          <span className="hidden xl:inline">Skjul forhåndsvisning</span>
                        </>
                      ) : (
                        <>
                          <IconEye className="h-4 w-4" />
                          <span className="hidden xl:inline">Vis forhåndsvisning</span>
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentFormStep(2)}>
                      <span className="hidden sm:inline">Tilbake til maler</span>
                      <span className="sm:hidden">Tilbake</span>
                    </Button>
                  </div>
                </div>
                <div className="border-b pb-4">
                  <Stepper
                    currentStep={currentFormStep}
                    steps={FORM_STEPS}
                    onStepClick={goToStep}
                    variant="compact"
                  />
                </div>
              </div>

              {/* Form Steps Content */}
              <div className="mt-6">
                {currentFormStep === 3 && (
                  <StepGrunnleggende
                    formData={formData}
                    onTitleChange={(title) => generateSlug(title)}
                    onSlugChange={(slug) => setFormData({ ...formData, slug })}
                    onDescriptionChange={(description) =>
                      setFormData({ ...formData, description })
                    }
                    onBrandingImport={handleBrandingImport}
                  />
                )}

                {currentFormStep === 4 && (
                  <StepDatoer
                    formData={formData}
                    onStartDateChange={(startDate) =>
                      setFormData({ ...formData, startDate })
                    }
                    onEndDateChange={(endDate) => setFormData({ ...formData, endDate })}
                    onDoorCountChange={(doorCount) =>
                      setFormData({ ...formData, doorCount })
                    }
                    templateFlexible={CALENDAR_TEMPLATES[selectedTemplate].flexible}
                  />
                )}

                {currentFormStep === 5 && formData.calendarFormat === "quiz" && (
                  <StepQuiz
                    formData={formData}
                    onEnableQuizChange={(enableQuiz) =>
                      setFormData({ ...formData, enableQuiz })
                    }
                    onPassingScoreChange={(defaultQuizPassingScore) =>
                      setFormData({ ...formData, defaultQuizPassingScore })
                    }
                    onGenerateAllChange={(generateAllQuizzes) =>
                      setFormData({ ...formData, generateAllQuizzes })
                    }
                  />
                )}

                {currentFormStep === 6 && (
                  <StepMerkevare
                    formData={formData}
                    onBrandColorChange={(brandColor) =>
                      setFormData({ ...formData, brandColor })
                    }
                    onBrandFontChange={(brandFont) =>
                      setFormData({ ...formData, brandFont })
                    }
                    onLogoChange={(logo) =>
                      setFormData({ ...formData, logo: logo ?? "" })
                    }
                  />
                )}

                {currentFormStep === 7 && (
                  <StepOppsummering formData={formData} onEdit={goToStep} />
                )}
              </div>

              <StepNavigation
                currentStep={currentFormStep}
                totalSteps={FORM_STEPS.length}
                onPrevious={previousStep}
                onNext={nextStep}
                onSkip={skipToSummary}
                onSubmit={handleSubmit}
                isSubmitting={isCreating}
                canSkip={currentFormStep === 5 || currentFormStep === 6}
                canProceed={canProceedFromCurrentStep()}
              />
            </>
          )}
        </div>

        {/* RIGHT PANEL - Live Preview */}
        {showPreview && (
          <div className="hidden lg:block">
            <CalendarPreview formData={formData} />
          </div>
        )}
      </div>
    </div>
  );
}
