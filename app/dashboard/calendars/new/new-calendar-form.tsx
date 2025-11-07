"use client";

import { useEffect, useMemo, useState } from "react";
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
import { StepLandingContent, LandingHighlight } from "@/components/calendar-form-steps/step-landing-content";
import CalendarPreview from "@/components/calendar-preview";
import { IconEye, IconEyeOff, IconArrowRight, IconArrowLeft } from "@tabler/icons-react";

const QUIZ_FORM_STEPS: Step[] = [
  { id: 1, title: "Format" },
  { id: 2, title: "Mal" },
  { id: 3, title: "Grunnleggende" },
  { id: 4, title: "Datoer" },
  { id: 5, title: "Quiz", optional: true },
  { id: 6, title: "Merkevare", optional: true },
  { id: 7, title: "Oppsummering" },
];

const LANDING_FORM_STEPS: Step[] = [
  { id: 1, title: "Format" },
  { id: 2, title: "Mal" },
  { id: 3, title: "Grunnleggende" },
  { id: 4, title: "Innhold" },
  { id: 5, title: "Merkevare", optional: true },
  { id: 6, title: "Oppsummering" },
];

const DEFAULT_LANDING_HIGHLIGHTS: LandingHighlight[] = [
  {
    title: "Innsikt i sanntid",
    description: "Følg trafikk og konverteringer direkte i dashboardet.",
  },
  {
    title: "Smart leadskjema",
    description: "Tilpass feltene og samle data som betyr noe for deg.",
  },
  {
    title: "Merkevarebygging",
    description: "Tilpass farger, fonter og budskap til profilen din.",
  },
];

interface CalendarFormState {
  calendarFormat: "landing" | "quiz" | "";
  title: string;
  description: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  doorCount: number;
  brandColor: string;
  brandFont: string;
  logo: string;
  requireEmail: boolean;
  requireName: boolean;
  requirePhone: boolean;
  enableQuiz: boolean;
  defaultQuizPassingScore: number;
  defaultShowCorrectAnswers: boolean;
  defaultAllowRetry: boolean;
  aiQuizInstructions: string;
  generateAllQuizzes: boolean;
  landingHeroTitle: string;
  landingHeroSubtitle: string;
  landingHeroDescription: string;
  landingPrimaryActionLabel: string;
  landingPrimaryActionUrl: string;
  landingSecondaryActionLabel: string;
  landingSecondaryActionUrl: string;
  landingHighlights: LandingHighlight[];
  landingShowLeadForm: boolean;
  landingPrizeImage: string;
}

const createDefaultLandingContent = (): Pick<
  CalendarFormState,
  | "landingHeroTitle"
  | "landingHeroSubtitle"
  | "landingHeroDescription"
  | "landingPrimaryActionLabel"
  | "landingPrimaryActionUrl"
  | "landingSecondaryActionLabel"
  | "landingSecondaryActionUrl"
  | "landingHighlights"
  | "landingShowLeadForm"
  | "landingPrizeImage"
> => ({
  landingHeroTitle: "",
  landingHeroSubtitle: "",
  landingHeroDescription: "",
  landingPrimaryActionLabel: "Registrer deg nå",
  landingPrimaryActionUrl: "",
  landingSecondaryActionLabel: "",
  landingSecondaryActionUrl: "",
  landingHighlights: DEFAULT_LANDING_HIGHLIGHTS.map((highlight) => ({
    ...highlight,
  })),
  landingShowLeadForm: true,
  landingPrizeImage: "",
});

export default function NewCalendarForm() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [currentFormStep, setCurrentFormStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [formData, setFormData] = useState<CalendarFormState>({
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
  ...createDefaultLandingContent(),
});

  const steps = useMemo(
    () => (formData.calendarFormat === "quiz" ? QUIZ_FORM_STEPS : LANDING_FORM_STEPS),
    [formData.calendarFormat]
  );
  const totalSteps = steps.length;
  const isLandingFormat = formData.calendarFormat === "landing";
  const currentStepDefinition = steps[currentFormStep - 1];
  const currentStepTitle = currentStepDefinition?.title;
  const isOptionalStep = currentStepDefinition?.optional === true;

  useEffect(() => {
    setCurrentFormStep((prev) => Math.min(prev, totalSteps));
  }, [totalSteps]);

  const updateFormData = (values: Partial<CalendarFormState>) => {
    setFormData((prev) => ({
      ...prev,
      ...values,
    }));
  };

  const availableTemplates = useMemo(
    () =>
      Object.entries(CALENDAR_TEMPLATES).filter(
        ([, template]) =>
          formData.calendarFormat === ""
            ? true
            : template.format === formData.calendarFormat
      ),
    [formData.calendarFormat]
  );

  const handleFormatChange = (format: "landing" | "quiz") => {
    setSelectedTemplate(null);
    setFormData((prev) => {
      const baseState: CalendarFormState = {
        ...prev,
        calendarFormat: format,
      };

      if (format === "landing") {
        return {
          ...baseState,
          ...createDefaultLandingContent(),
          enableQuiz: false,
          generateAllQuizzes: false,
          aiQuizInstructions: "",
          doorCount: 0,
          startDate: new Date(),
          endDate: new Date(),
        };
      }

      return {
        ...baseState,
        enableQuiz: true,
        doorCount: Math.max(prev.doorCount || 0, 1),
      };
    });
    setCurrentFormStep(1);
  };

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = CALENDAR_TEMPLATES[templateKey];

    const currentYear = new Date().getFullYear();
    const dates = getDefaultDatesForYear(template, currentYear);

    setFormData((prev) => {
      const updates: Partial<CalendarFormState> = {
        calendarFormat: template.format,
        title: template.title,
        description: template.description,
        brandColor: template.theme.colors[0] ?? prev.brandColor,
        enableQuiz: template.format === "quiz",
      };

      if (template.format === "quiz") {
        updates.doorCount = template.doorCount;
        updates.startDate = dates?.startDate || new Date();
        updates.endDate = dates?.endDate || new Date();
      } else {
        updates.doorCount = 0;
        const landingDefaults = template.landingDefaults;
        updates.startDate = new Date();
        updates.endDate = new Date();
        updates.enableQuiz = false;
        updates.generateAllQuizzes = false;
        updates.aiQuizInstructions = "";
        if (landingDefaults) {
          updates.landingHeroTitle = landingDefaults.heroTitle;
          updates.landingHeroSubtitle = landingDefaults.heroSubtitle;
          updates.landingHeroDescription = landingDefaults.heroDescription;
          updates.landingPrimaryActionLabel = landingDefaults.primaryActionLabel;
          updates.landingPrimaryActionUrl = landingDefaults.primaryActionUrl || "";
          updates.landingSecondaryActionLabel = landingDefaults.secondaryActionLabel || "";
          updates.landingSecondaryActionUrl = landingDefaults.secondaryActionUrl || "";
          updates.landingHighlights = landingDefaults.features.map((feature) => ({
            title: feature.title,
            description: feature.description,
          }));
          updates.landingShowLeadForm =
            landingDefaults.showLeadForm ?? prev.landingShowLeadForm;
        } else {
          updates.landingHeroTitle = prev.landingHeroTitle;
          updates.landingHeroSubtitle = prev.landingHeroSubtitle;
          updates.landingHeroDescription = prev.landingHeroDescription;
          updates.landingPrimaryActionLabel = prev.landingPrimaryActionLabel;
          updates.landingPrimaryActionUrl = prev.landingPrimaryActionUrl;
          updates.landingSecondaryActionLabel = prev.landingSecondaryActionLabel;
          updates.landingSecondaryActionUrl = prev.landingSecondaryActionUrl;
          updates.landingHighlights = prev.landingHighlights.map((highlight) => ({
            ...highlight,
          }));
          updates.landingShowLeadForm = prev.landingShowLeadForm;
        }
      }

      return {
        ...prev,
        ...updates,
      };
    });

    // Move to step 3 (Grunnleggende)
    setCurrentFormStep(3);
  };

  const handleBrandingImport = (branding: {
    brandColor?: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      brandColor: branding.brandColor || prev.brandColor,
    }));
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
    setFormData((prev) => ({
      ...prev,
      title,
      slug,
    }));
  };

  const nextStep = () => {
    setCurrentFormStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const previousStep = () => {
    setCurrentFormStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    if (step <= currentFormStep && step >= 1 && step <= totalSteps) {
      setCurrentFormStep(step);
    }
  };

  const skipToSummary = () => {
    setCurrentFormStep(totalSteps);
  };

  const canProceedFromCurrentStep = () => {
    if (currentFormStep === 1) {
      return !!formData.calendarFormat;
    }

    if (currentFormStep === 2) {
      return !!selectedTemplate;
    }

    if (currentFormStep === 3) {
      return !!formData.title.trim() && !!formData.slug.trim();
    }

    if (formData.calendarFormat === "quiz") {
      if (currentFormStep === 4) {
        return formData.doorCount > 0;
      }
      return true;
    }

    if (isLandingFormat) {
      if (currentFormStep === 4) {
        const hasHero = formData.landingHeroTitle.trim().length > 0;
        const hasPrimaryCta = formData.landingPrimaryActionLabel.trim().length > 0;
        const hasHighlights = formData.landingHighlights.some(
          (highlight) =>
            highlight.title.trim().length > 0 && highlight.description.trim().length > 0
        );
        return hasHero && hasPrimaryCta && hasHighlights;
      }
      return true;
    }

    return true;
  };

  const addLandingHighlight = () => {
    setFormData((prev) => {
      if (prev.landingHighlights.length >= 4) {
        return prev;
      }

      return {
        ...prev,
        landingHighlights: [
          ...prev.landingHighlights,
          {
            title: "",
            description: "",
          },
        ],
      };
    });
  };

  const updateLandingHighlight = (index: number, values: Partial<LandingHighlight>) => {
    setFormData((prev) => {
      const highlights = prev.landingHighlights.map((highlight, idx) =>
        idx === index ? { ...highlight, ...values } : highlight
      );

      return {
        ...prev,
        landingHighlights: highlights,
      };
    });
  };

  const removeLandingHighlight = (index: number) => {
    setFormData((prev) => {
      if (prev.landingHighlights.length <= 1) {
        return prev;
      }

      const highlights = prev.landingHighlights.filter((_, idx) => idx !== index);
      return {
        ...prev,
        landingHighlights: highlights,
      };
    });
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

      const sanitizedHighlights = formData.landingHighlights
        .filter(
          (highlight) =>
            highlight.title.trim().length > 0 || highlight.description.trim().length > 0
        )
        .map((highlight) => ({
          title: highlight.title.trim(),
          description: highlight.description.trim(),
        }));

      const payload = {
        ...formData,
        type: template.type,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        calendarFormat: formData.calendarFormat,
        doorCount: isLandingFormat ? 0 : formData.doorCount,
        landingHighlights: sanitizedHighlights,
        // Auto-enable quiz if format is "quiz"
        enableQuiz: formData.calendarFormat === "quiz" ? true : formData.enableQuiz,
      };

      // Step 1: Create calendar
      const response = await fetch("/api/calendars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Kunne ikke opprette kalender" }));
        console.error("Calendar creation failed:", response.status, errorData);
        throw new Error(errorData.error || "Kunne ikke opprette kalender");
      }

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

        if (!quizResponse.ok) {
          toast.error("Noen quizer kunne ikke genereres", { id: "quiz-gen" });
        } else {
          // Read SSE stream
          const reader = quizResponse.body?.getReader();
          const decoder = new TextDecoder();

          if (reader) {
            try {
              let successCount = 0;
              let failedCount = 0;

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    try {
                      const data = JSON.parse(line.slice(6));

                      if (data.type === "progress") {
                        toast.loading(
                          `Genererer quiz for luke ${data.current} av ${data.total}...`,
                          { id: "quiz-gen" }
                        );
                      } else if (data.type === "complete") {
                        successCount = data.results.success;
                        failedCount = data.results.failed;
                      } else if (data.type === "error") {
                        toast.error(data.message, { id: "quiz-gen" });
                      }
                    } catch (e) {
                      console.error("Error parsing SSE:", e);
                    }
                  }
                }
              }

              // Show final result
              if (successCount > 0) {
                toast.success(
                  `Quiz generert for ${successCount} ${failedCount > 0 ? `av ${successCount + failedCount}` : ""} luker!`,
                  { id: "quiz-gen" }
                );
              }
            } catch (error) {
              console.error("Error reading SSE stream:", error);
              toast.error("Noen quizer kunne ikke genereres", { id: "quiz-gen" });
            }
          }
        }
      } else {
        toast.success("Kalenderen ble opprettet!");
      }

      router.push(`/dashboard/calendars/${calendar.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Kunne ikke opprette kalender";
      toast.error(errorMessage);
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
                <StepFormat formData={formData} onFormatChange={handleFormatChange} />

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
                {availableTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableTemplates.map(([key, template]) => {
                      const isSelected = selectedTemplate === key;
                      return (
                        <Card
                          key={key}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "border-primary shadow-lg ring-2 ring-primary/20"
                              : "hover:border-primary"
                          }`}
                          onClick={() => handleTemplateSelect(key)}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="text-4xl mb-2">{template.theme.icon}</div>
                              {isSelected && (
                                <span className="text-xs font-medium text-primary">Valgt</span>
                              )}
                            </div>
                            <CardTitle className="text-lg">{template.title}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              {template.format === "landing"
                                ? "Landingsside"
                                : `${template.doorCount} luker`}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ingen maler tilgjengelig</CardTitle>
                      <CardDescription>
                        Det finnes ingen maler for det valgte formatet enda. Prøv et annet format eller skreddersy kalenderen senere.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
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
                    steps={steps}
                    onStepClick={goToStep}
                    variant="compact"
                  />
                </div>
              </div>

              {/* Form Steps Content */}
              <div className="mt-6">
                {currentStepTitle === "Grunnleggende" && (
                  <StepGrunnleggende
                    formData={formData}
                    onTitleChange={(title) => generateSlug(title)}
                    onSlugChange={(slug) =>
                      setFormData((prev) => ({
                        ...prev,
                        slug,
                      }))
                    }
                    onDescriptionChange={(description) =>
                      setFormData((prev) => ({
                        ...prev,
                        description,
                      }))
                    }
                    onBrandingImport={handleBrandingImport}
                  />
                )}

                {currentStepTitle === "Datoer" && (
                  <StepDatoer
                    formData={formData}
                    onStartDateChange={(startDate) =>
                      setFormData((prev) => ({ ...prev, startDate }))
                    }
                    onEndDateChange={(endDate) =>
                      setFormData((prev) => ({ ...prev, endDate }))
                    }
                    onDoorCountChange={(doorCount) =>
                      setFormData((prev) => ({ ...prev, doorCount }))
                    }
                  />
                )}

                {currentStepTitle === "Innhold" && isLandingFormat && (
                  <StepLandingContent
                    formData={formData}
                    onChange={(values) => updateFormData(values)}
                    onUpdateHighlight={updateLandingHighlight}
                    onAddHighlight={addLandingHighlight}
                    onRemoveHighlight={removeLandingHighlight}
                  />
                )}

                {currentStepTitle === "Quiz" && formData.calendarFormat === "quiz" && (
                  <StepQuiz
                    formData={formData}
                    onEnableQuizChange={(enableQuiz) =>
                      setFormData((prev) => ({
                        ...prev,
                        enableQuiz,
                      }))
                    }
                    onPassingScoreChange={(defaultQuizPassingScore) =>
                      setFormData((prev) => ({
                        ...prev,
                        defaultQuizPassingScore,
                      }))
                    }
                    onGenerateAllChange={(generateAllQuizzes) =>
                      setFormData((prev) => ({
                        ...prev,
                        generateAllQuizzes,
                      }))
                    }
                  />
                )}

                {currentStepTitle === "Merkevare" && (
                  <StepMerkevare
                    formData={formData}
                    onBrandColorChange={(brandColor) =>
                      setFormData((prev) => ({
                        ...prev,
                        brandColor,
                      }))
                    }
                    onBrandFontChange={(brandFont) =>
                      setFormData((prev) => ({
                        ...prev,
                        brandFont,
                      }))
                    }
                    onLogoChange={(logo) =>
                      setFormData((prev) => ({
                        ...prev,
                        logo: logo ?? "",
                      }))
                    }
                  />
                )}

                {currentStepTitle === "Oppsummering" && (
                  <StepOppsummering
                    formData={formData}
                    calendarFormat={formData.calendarFormat}
                    onEdit={goToStep}
                  />
                )}
              </div>

              <StepNavigation
                currentStep={currentFormStep}
                totalSteps={totalSteps}
                onPrevious={previousStep}
                onNext={nextStep}
                onSkip={skipToSummary}
                onSubmit={handleSubmit}
                isSubmitting={isCreating}
                canSkip={isOptionalStep}
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
