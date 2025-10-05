"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { IconLock, IconGift, IconTrophy, IconExternalLink } from "@tabler/icons-react";
import { format, isPast, isToday } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { AnalyticsTracker, useTrackDoorInteraction } from "@/components/analytics-tracker";
import { DoorQuizSection } from "@/components/door-quiz-section";
import { Spinner } from "@/components/ui/spinner";
import { useGoogleFont } from "@/hooks/use-google-font";
import { getFontFamilyValue } from "@/lib/google-fonts";

interface Door {
  id: string;
  doorNumber: number;
  openDate: Date;
  title: string | null;
  description: string | null;
  image: string | null;
  enableQuiz: boolean;
  quizPassingScore: number;
  showCorrectAnswers: boolean;
  allowRetry: boolean;
  product: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    value: number | null;
  } | null;
  winner: {
    id: string;
    lead: {
      name: string | null;
      email: string;
    };
  } | null;
  questions: {
    id: string;
    type: string;
    questionText: string;
    required: boolean;
    options: string[] | null;
  }[];
  _count: {
    entries: number;
  };
}

interface Calendar {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  brandColor: string | null;
  brandFont: string | null;
  logo: string | null;
  bannerImage: string | null;
  buttonText: string | null;
  thankYouMessage: string | null;
  footerText: string | null;
  startDate: Date;
  endDate: Date;
  requireEmail: boolean;
  requireName: boolean;
  requirePhone: boolean;
  termsUrl: string | null;
  privacyPolicyUrl: string | null;
  doors: Door[];
  workspace: {
    name: string;
    image: string | null;
  };
}

export default function PublicCalendar({ calendar }: { calendar: Calendar }) {
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
  });
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });
  const [quizAnswers, setQuizAnswers] = useState<Array<{ questionId: string; answer: string }>>([]);

  // Load brand font dynamically
  useGoogleFont(calendar.brandFont);

  // Analytics tracking
  const { trackDoorClick, trackDoorEntry } = useTrackDoorInteraction(calendar.id);

  const isDoorOpen = (door: Door) => {
    const now = new Date();
    return isPast(door.openDate) || isToday(door.openDate);
  };

  const handleDoorClick = (door: Door) => {
    if (!isDoorOpen(door)) {
      toast.error("Denne luken er ikke åpnet ennå!");
      return;
    }
    // Track door click
    trackDoorClick(door.id);
    setSelectedDoor(door);
  };

  const triggerConfetti = () => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = [calendar.brandColor || "#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  const handleQuizAnswerChange = (questionId: string, answer: string) => {
    setQuizAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) {
        return prev.map((a) =>
          a.questionId === questionId ? { ...a, answer } : a
        );
      }
      return [...prev, { questionId, answer }];
    });
  };

  const handleSubmitEntry = async () => {
    if (!selectedDoor) return;

    if (calendar.requireEmail && !formData.email) {
      toast.error("E-post er påkrevd");
      return;
    }

    if (calendar.requireName && !formData.name) {
      toast.error("Navn er påkrevd");
      return;
    }

    if (calendar.requirePhone && !formData.phone) {
      toast.error("Telefonnummer er påkrevd");
      return;
    }

    // Quiz validation
    if (selectedDoor.enableQuiz && selectedDoor.questions.length > 0) {
      const requiredQuestions = selectedDoor.questions.filter((q) => q.required);
      const answeredQuestions = quizAnswers.filter((a) => a.answer.trim() !== "");

      if (answeredQuestions.length < requiredQuestions.length) {
        toast.error("Vennligst svar på alle påkrevde spørsmål");
        return;
      }
    }

    // GDPR Consent validation
    if (!consents.terms) {
      toast.error("Du må godta vilkårene for å delta");
      return;
    }

    if (!consents.privacy) {
      toast.error("Du må godta personvernerklæringen for å delta");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarId: calendar.id,
          doorId: selectedDoor.id,
          ...formData,
          marketingConsent: consents.marketing,
          termsAccepted: consents.terms,
          privacyPolicyAccepted: consents.privacy,
          quizAnswers: selectedDoor.enableQuiz ? quizAnswers : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke sende inn deltakelse");
      }

      // Track door entry
      trackDoorEntry(selectedDoor.id);

      // Trigger confetti
      triggerConfetti();

      toast.success(calendar.thankYouMessage || "Deltakelsen er registrert! Lykke til! 🎉");
      setSelectedDoor(null);
      setFormData({ email: "", name: "", phone: "" });
      setConsents({ terms: false, privacy: false, marketing: false });
      setQuizAnswers([]);
    } catch (error: any) {
      toast.error(error.message || "Kunne ikke sende inn deltakelse");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Analytics Tracker */}
      <AnalyticsTracker calendarId={calendar.id} />

      <div className="min-h-screen" style={{
        background: `linear-gradient(to bottom, ${calendar.brandColor || "#3B82F6"}15, transparent)`
      }}>
        {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {calendar.logo && (
                <img src={calendar.logo} alt={calendar.title} className="h-12 w-12 rounded-lg" />
              )}
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined }}
                >
                  {calendar.title}
                </h1>
                <p className="text-sm text-muted-foreground">{calendar.workspace.name}</p>
              </div>
            </div>
            <Badge variant="outline" style={{ borderColor: calendar.brandColor || undefined }}>
              {format(calendar.startDate, "d. MMM", { locale: nb })} - {format(calendar.endDate, "d. MMM yyyy", { locale: nb })}
            </Badge>
          </div>
          {calendar.description && (
            <p className="mt-4 text-muted-foreground">{calendar.description}</p>
          )}
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="container max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {calendar.doors.map((door) => {
            const isOpen = isDoorOpen(door);
            const hasWinner = !!door.winner;

            return (
              <Card
                key={door.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  !isOpen ? "opacity-60" : ""
                } ${hasWinner ? "border-yellow-400" : ""}`}
                onClick={() => handleDoorClick(door)}
                style={{
                  borderColor: isOpen && !hasWinner ? calendar.brandColor || undefined : undefined,
                }}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center aspect-square">
                  {!isOpen ? (
                    <>
                      <IconLock className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-2xl font-bold">{door.doorNumber}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(door.openDate, "d. MMM", { locale: nb })}
                      </p>
                    </>
                  ) : hasWinner ? (
                    <>
                      <IconTrophy className="h-8 w-8 text-yellow-500 mb-2" />
                      <p className="text-2xl font-bold">{door.doorNumber}</p>
                      <p className="text-xs text-muted-foreground mt-1">Vinner trukket</p>
                    </>
                  ) : (
                    <>
                      <IconGift className="h-8 w-8 mb-2" style={{ color: calendar.brandColor || undefined }} />
                      <p className="text-2xl font-bold">{door.doorNumber}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {door._count.entries} deltakelser
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {calendar.footerText && (
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-12">
          <div className="container max-w-7xl mx-auto px-4 md:px-8 py-6 text-center text-sm text-muted-foreground">
            {calendar.footerText}
          </div>
        </footer>
      )}

      {/* Door Modal */}
      <Dialog open={!!selectedDoor} onOpenChange={() => setSelectedDoor(null)}>
        <DialogContent className="max-w-2xl">
          {selectedDoor && (
            <>
              <DialogHeader>
                <DialogTitle
                  className="text-2xl"
                  style={{ fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined }}
                >
                  Luke {selectedDoor.doorNumber}
                  {selectedDoor.title && ` - ${selectedDoor.title}`}
                </DialogTitle>
                <DialogDescription>
                  {format(selectedDoor.openDate, "d. MMMM yyyy", { locale: nb })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {selectedDoor.product && (
                  <div className="space-y-4">
                    {selectedDoor.product.imageUrl && (
                      <img
                        src={selectedDoor.product.imageUrl}
                        alt={selectedDoor.product.name}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3
                        className="text-xl font-semibold"
                        style={{ fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined }}
                      >
                        {selectedDoor.product.name}
                      </h3>
                      {selectedDoor.product.description && (
                        <p className="text-muted-foreground mt-2">{selectedDoor.product.description}</p>
                      )}
                      {selectedDoor.product.value && (
                        <p className="text-sm font-medium mt-2">Verdi: kr {selectedDoor.product.value}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedDoor.winner ? (
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <IconTrophy className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-semibold">Vinner valgt!</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Gratulerer til vinneren! Denne konkurransen er avsluttet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Quiz Section */}
                    {selectedDoor.enableQuiz && selectedDoor.questions.length > 0 && (
                      <DoorQuizSection
                        questions={selectedDoor.questions}
                        answers={quizAnswers}
                        onAnswerChange={handleQuizAnswerChange}
                      />
                    )}

                    {/* Contact Form */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-4">Delta og vinn!</h4>
                      <div className="space-y-4">
                        {calendar.requireEmail && (
                          <div>
                            <Label htmlFor="email">E-post *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="din@epost.no"
                            />
                          </div>
                        )}
                        {calendar.requireName && (
                          <div>
                            <Label htmlFor="name">Navn *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Ditt navn"
                            />
                          </div>
                        )}
                        {calendar.requirePhone && (
                          <div>
                            <Label htmlFor="phone">Telefon *</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="Telefonnummeret ditt"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* GDPR Consent Section */}
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms"
                          checked={consents.terms}
                          onCheckedChange={(checked) => setConsents({ ...consents, terms: checked as boolean })}
                        />
                        <div className="flex-1">
                          <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                            Jeg godtar{" "}
                            {calendar.termsUrl ? (
                              <a
                                href={calendar.termsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                vilkårene for konkurransen
                                <IconExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="font-medium">vilkårene for konkurransen</span>
                            )}{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="privacy"
                          checked={consents.privacy}
                          onCheckedChange={(checked) => setConsents({ ...consents, privacy: checked as boolean })}
                        />
                        <div className="flex-1">
                          <Label htmlFor="privacy" className="text-sm font-normal cursor-pointer">
                            Jeg har lest og godtar{" "}
                            {calendar.privacyPolicyUrl ? (
                              <a
                                href={calendar.privacyPolicyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                personvernerklæringen
                                <IconExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="font-medium">personvernerklæringen</span>
                            )}{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="marketing"
                          checked={consents.marketing}
                          onCheckedChange={(checked) => setConsents({ ...consents, marketing: checked as boolean })}
                        />
                        <div className="flex-1">
                          <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer">
                            Jeg godtar å motta markedsføring og nyhetsbrev (valgfritt)
                          </Label>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mt-2">
                        Dine opplysninger behandles i henhold til personvernreglene. Du kan når som helst trekke tilbake ditt samtykke.
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        {selectedDoor._count.entries} {selectedDoor._count.entries === 1 ? "deltakelse" : "deltakelser"} så langt
                      </p>
                      <Button
                        onClick={handleSubmitEntry}
                        disabled={isSubmitting}
                        style={{ backgroundColor: calendar.brandColor || undefined }}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Sender ...
                          </>
                        ) : (
                          calendar.buttonText || "Send inn deltakelse"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}
