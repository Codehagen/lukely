"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CALENDAR_TEMPLATES, getDefaultDatesForYear } from "@/lib/calendar-templates";
import { toast } from "sonner";
import { Stepper, Step } from "@/components/ui/stepper";
import { StepNavigation } from "@/components/calendar-form-steps/step-navigation";
import { StepGrunnleggende } from "@/components/calendar-form-steps/step-grunnleggende";
import { StepDatoer } from "@/components/calendar-form-steps/step-datoer";
import { StepQuiz } from "@/components/calendar-form-steps/step-quiz";
import { StepMerkevare } from "@/components/calendar-form-steps/step-merkevare";
import { StepOppsummering } from "@/components/calendar-form-steps/step-oppsummering";
import CalendarPreview from "@/components/calendar-preview";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

const FORM_STEPS: Step[] = [
  { id: 1, title: "Grunnleggende" },
  { id: 2, title: "Datoer" },
  { id: 3, title: "Quiz", optional: true },
  { id: 4, title: "Merkevare", optional: true },
  { id: 5, title: "Oppsummering" },
];

export default function NewCalendarForm() {
  const router = useRouter();
  const [templateStep, setTemplateStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [currentFormStep, setCurrentFormStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [formData, setFormData] = useState({
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
    });

    setTemplateStep(2);
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

  const nextStep = () => {
    if (currentFormStep < FORM_STEPS.length) {
      setCurrentFormStep(currentFormStep + 1);
    }
  };

  const previousStep = () => {
    if (currentFormStep > 1) {
      setCurrentFormStep(currentFormStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentFormStep) {
      setCurrentFormStep(step);
    }
  };

  const skipToSummary = () => {
    setCurrentFormStep(5);
  };

  const handleSaveDraft = () => {
    toast.message("Lagring som utkast kommer snart");
  };

  const handlePreview = () => {
    toast.message("Forhåndsvisningen er ikke tilgjengelig enda");
  };

  const handleSubmit = async () => {
    if (!selectedTemplate) return;

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
            body: JSON.stringify({ questionCount: 3 }),
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
          {templateStep === 1 && (
            <>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Velg en mal</h2>
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

          {templateStep === 2 && selectedTemplate && (
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
                    <Button variant="ghost" size="sm" onClick={() => setTemplateStep(1)}>
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
                {currentFormStep === 1 && (
                  <StepGrunnleggende
                    formData={formData}
                    onTitleChange={(title) => generateSlug(title)}
                    onSlugChange={(slug) => setFormData({ ...formData, slug })}
                    onDescriptionChange={(description) =>
                      setFormData({ ...formData, description })
                    }
                  />
                )}

                {currentFormStep === 2 && (
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

                {currentFormStep === 3 && (
                  <StepQuiz
                    formData={formData}
                    onEnableQuizChange={(enableQuiz) =>
                      setFormData({ ...formData, enableQuiz })
                    }
                    onPassingScoreChange={(defaultQuizPassingScore) =>
                      setFormData({ ...formData, defaultQuizPassingScore })
                    }
                    onShowAnswersChange={(defaultShowCorrectAnswers) =>
                      setFormData({ ...formData, defaultShowCorrectAnswers })
                    }
                    onAllowRetryChange={(defaultAllowRetry) =>
                      setFormData({ ...formData, defaultAllowRetry })
                    }
                    onInstructionsChange={(aiQuizInstructions) =>
                      setFormData({ ...formData, aiQuizInstructions })
                    }
                    onGenerateAllChange={(generateAllQuizzes) =>
                      setFormData({ ...formData, generateAllQuizzes })
                    }
                  />
                )}

                {currentFormStep === 4 && (
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

                {currentFormStep === 5 && (
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
                canSkip={currentFormStep === 3 || currentFormStep === 4}
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
