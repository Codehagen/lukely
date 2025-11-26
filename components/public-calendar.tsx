"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import BlurImage from "@/lib/blur-image";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { IconLock, IconGift, IconTrophy, IconExternalLink, IconChevronUp, IconCalendar, IconCircleCheck, IconShare, IconCopy } from "@tabler/icons-react";
import { format, isPast, isToday } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { AnalyticsTracker, useTrackDoorInteraction } from "@/components/analytics-tracker";
import { DoorQuizSection } from "@/components/door-quiz-section";
import { Spinner } from "@/components/ui/spinner";
import { ShareUrlCopyButton } from "@/components/share-url-copy";
import { ShareTargetButtons } from "@/components/share-target-buttons";
import { useGoogleFont } from "@/hooks/use-google-font";
import { getFontFamilyValue } from "@/lib/google-fonts";
import { HOME_DOMAIN } from "@/lib/config";
import { DotPattern } from "@/components/dot-pattern";

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
    isPublic: boolean;
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
  slug: string;
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
  promoCode: string | null;
  promoCodeMessage: string | null;
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
  const [showScrollTop, setShowScrollTop] = useState(false);
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
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Load brand font dynamically
  useGoogleFont(calendar.brandFont);

  // Analytics tracking
  const { trackDoorClick, trackDoorEntry } = useTrackDoorInteraction(calendar.id);

  // Scroll to top handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const baseShareUrl = useMemo(() => {
    const configured = (HOME_DOMAIN || "").replace(/\/$/, "");
    if (configured) return configured;
    if (typeof window !== "undefined") {
      return window.location.origin.replace(/\/$/, "");
    }
    return "";
  }, []);

  const shareUrl = selectedDoor ? `${baseShareUrl}/c/${calendar.slug}/doors/${selectedDoor.doorNumber}` : "";
  const shareTitle = selectedDoor
    ? selectedDoor.product?.name ?? selectedDoor.title ?? `Luke ${selectedDoor.doorNumber}`
    : "";
  const shareDescription = selectedDoor
    ? selectedDoor.product?.description ?? selectedDoor.description ?? calendar.description ?? ""
    : "";

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
      setHasSubmitted(true);
      setFormData({ email: "", name: "", phone: "" });
      setConsents({ terms: false, privacy: false, marketing: false });
      setQuizAnswers([]);
    } catch (error: any) {
      toast.error(error.message || "Kunne ikke sende inn deltakelse");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate stats
  const totalDoors = calendar.doors.length;
  const openedDoors = calendar.doors.filter((door) => isDoorOpen(door)).length;
  const totalEntries = calendar.doors.reduce((sum, door) => sum + door._count.entries, 0);
  const totalPrizeValue = calendar.doors.reduce((sum, door) => sum + (door.product?.value || 0), 0);
  const todaysDoor = calendar.doors.find((door) => isToday(door.openDate));

  return (
    <>
      {/* Analytics Tracker */}
      <AnalyticsTracker calendarId={calendar.id} />

      <div className="min-h-screen" style={{
        background: `linear-gradient(to bottom, ${calendar.brandColor || "#3B82F6"}15, transparent)`
      }}>
        {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              {calendar.logo ? (
                <div className="relative h-10 w-10 md:h-14 md:w-14 overflow-hidden rounded-xl shadow-lg bg-white dark:bg-white/10 p-2 border border-gray-100 dark:border-gray-800">
                  <Image
                    src={calendar.logo}
                    alt={calendar.title}
                    fill
                    sizes="(max-width: 768px) 40px, 56px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="h-10 w-10 md:h-14 md:w-14 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg md:text-2xl"
                  style={{
                    backgroundColor: calendar.brandColor || "#3B82F6",
                    fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined
                  }}
                >
                  {calendar.workspace.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1
                  className="text-xl md:text-2xl font-bold tracking-tight"
                  style={{
                    fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined,
                    color: calendar.brandColor || undefined
                  }}
                >
                  {calendar.title}
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">{calendar.workspace.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Badge
                variant="outline"
                className="text-xs md:text-sm px-2 md:px-3 py-1"
                style={{
                  borderColor: calendar.brandColor || undefined,
                  color: calendar.brandColor || undefined
                }}
              >
                {format(calendar.startDate, "d. MMM", { locale: nb })} - {format(calendar.endDate, "d. MMM", { locale: nb })}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${calendar.brandColor || "#3B82F6"}20 0%, ${calendar.brandColor || "#3B82F6"}05 50%, transparent 100%)`
          }}
        />
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
          className="opacity-30 [mask-image:radial-gradient(circle_at_center,white,transparent)]"
          style={{ color: calendar.brandColor || "#3B82F6" }}
        />
        {calendar.bannerImage && (
          <div className="absolute inset-0 flex items-center justify-center p-8 md:p-16 opacity-10">
            <div className="relative w-full h-full max-h-[300px] md:max-h-[400px]">
              <Image
                src={calendar.bannerImage}
                alt={calendar.title}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-contain blur-[0.5px]"
                style={{ objectPosition: "center" }}
                unoptimized
                priority
              />
            </div>
          </div>
        )}
        <div className="relative container max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              style={{
                fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined,
                background: `linear-gradient(135deg, ${calendar.brandColor || "#3B82F6"}, ${calendar.brandColor || "#3B82F6"}99)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              Vinn fantastiske premier hver dag!
            </h2>
            {calendar.description && (
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {calendar.description}
              </p>
            )}
            <p className="text-base md:text-lg text-muted-foreground mb-10">
              {totalDoors} lukere å åpne{totalPrizeValue > 0 && ` • Premier til en verdi av kr ${totalPrizeValue.toLocaleString('nb-NO')}`}
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10 max-w-3xl mx-auto">
              <div
                className="rounded-2xl border-2 bg-background/80 backdrop-blur-sm p-6 shadow-lg hover:scale-105 transition-transform"
                style={{ borderColor: `${calendar.brandColor || "#3B82F6"}40` }}
              >
                <div
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{
                    fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined,
                    color: calendar.brandColor || undefined
                  }}
                >
                  {openedDoors}/{totalDoors}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Lukere åpnet</div>
              </div>
              <div
                className="rounded-2xl border-2 bg-background/80 backdrop-blur-sm p-6 shadow-lg hover:scale-105 transition-transform"
                style={{ borderColor: `${calendar.brandColor || "#3B82F6"}40` }}
              >
                <div
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{
                    fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined,
                    color: calendar.brandColor || undefined
                  }}
                >
                  {totalEntries.toLocaleString('nb-NO')}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Deltakelser</div>
              </div>
              {totalPrizeValue > 0 && (
                <div
                  className="rounded-2xl border-2 bg-background/80 backdrop-blur-sm p-6 shadow-lg hover:scale-105 transition-transform col-span-2 md:col-span-1"
                  style={{ borderColor: `${calendar.brandColor || "#3B82F6"}40` }}
                >
                  <div
                    className="text-3xl md:text-4xl font-bold mb-2"
                    style={{
                      fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined,
                      color: calendar.brandColor || undefined
                    }}
                  >
                    kr {totalPrizeValue.toLocaleString('nb-NO')}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Total premieverdi</div>
                </div>
              )}
            </div>

            {/* CTA Button for Today's Door */}
            {todaysDoor && (
              <Button
                onClick={() => handleDoorClick(todaysDoor)}
                size="lg"
                className="text-base md:text-lg px-8 py-6 h-auto font-bold shadow-2xl hover:scale-105 transition-all"
                style={{
                  backgroundColor: calendar.brandColor || "#3B82F6",
                  fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined
                }}
              >
                <IconGift className="mr-2 h-6 w-6" />
                Åpne dagens luke nå!
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Calendar Grid */}
      <div className="container max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h3
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined,
              color: calendar.brandColor || undefined
            }}
          >
            Alle luker
          </h3>
          <p className="text-muted-foreground text-lg">
            Åpne en luke hver dag og delta i trekningen
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {calendar.doors.map((door) => {
            const isOpen = isDoorOpen(door);
            const hasWinner = !!door.winner;
            const publicWinnerName = door.winner?.isPublic
              ? door.winner?.lead.name || door.winner?.lead.email
              : null;
            const isTodaysDoor = todaysDoor?.id === door.id;

            return (
              <Card
                key={door.id}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  !isOpen ? "opacity-50 hover:opacity-70" : ""
                } ${hasWinner ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20" : ""} ${
                  isTodaysDoor ? "ring-4 ring-offset-4 animate-pulse" : ""
                } relative overflow-hidden`}
                onClick={() => handleDoorClick(door)}
                style={{
                  borderColor: isOpen && !hasWinner ? calendar.brandColor || undefined : undefined,
                  ringColor: isTodaysDoor ? calendar.brandColor || undefined : undefined,
                }}
              >
                {/* Gradient overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${calendar.brandColor || "#3B82F6"}, transparent)`
                  }}
                />

                <CardContent className="relative p-6 flex flex-col items-center justify-center aspect-square">
                  {!isOpen ? (
                    <>
                      <IconLock className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3 group-hover:scale-110 transition-transform" />
                      <p
                        className="text-3xl md:text-4xl font-bold mb-1"
                        style={{ fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined }}
                      >
                        {door.doorNumber}
                      </p>
                      <p className="text-xs text-muted-foreground text-center">
                        {format(door.openDate, "d. MMM", { locale: nb })}
                      </p>
                    </>
                  ) : hasWinner ? (
                    <>
                      <IconTrophy className="h-10 w-10 md:h-12 md:w-12 text-yellow-500 mb-3 group-hover:scale-110 transition-transform" />
                      <p
                        className="text-3xl md:text-4xl font-bold mb-1"
                        style={{ fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined }}
                      >
                        {door.doorNumber}
                      </p>
                      <p className="text-xs text-muted-foreground text-center">
                        {publicWinnerName ? `Vinner: ${publicWinnerName}` : "Vinner trukket"}
                      </p>
                    </>
                  ) : (
                    <>
                      <IconGift
                        className="h-10 w-10 md:h-12 md:w-12 mb-3 group-hover:scale-110 transition-transform"
                        style={{ color: calendar.brandColor || undefined }}
                      />
                      <p
                        className="text-3xl md:text-4xl font-bold mb-1"
                        style={{
                          fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined,
                          color: calendar.brandColor || undefined
                        }}
                      >
                        {door.doorNumber}
                      </p>
                      <p className="text-xs text-muted-foreground text-center">
                        {door._count.entries} {door._count.entries === 1 ? "deltakelse" : "deltakelser"}
                      </p>
                    </>
                  )}

                  {/* Today's badge */}
                  {isTodaysDoor && (
                    <div
                      className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                      style={{ backgroundColor: calendar.brandColor || "#3B82F6" }}
                    >
                      I DAG
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="border-t bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <h3
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined,
                color: calendar.brandColor || undefined
              }}
            >
              Hvordan fungerer det?
            </h3>
            <p className="text-muted-foreground text-lg">
              Tre enkle steg til din vinnerpremie
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                style={{ backgroundColor: calendar.brandColor || "#3B82F6" }}
              >
                1
              </div>
              <h4
                className="text-xl font-bold mb-3"
                style={{ fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined }}
              >
                Åpne en luke
              </h4>
              <p className="text-muted-foreground">
                Klikk på dagens luke for å se hva du kan vinne
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                style={{ backgroundColor: calendar.brandColor || "#3B82F6" }}
              >
                2
              </div>
              <h4
                className="text-xl font-bold mb-3"
                style={{ fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined }}
              >
                {calendar.doors.some(d => d.enableQuiz) ? "Svar på quiz" : "Fyll ut skjema"}
              </h4>
              <p className="text-muted-foreground">
                {calendar.doors.some(d => d.enableQuiz)
                  ? "Svar på spørsmålene og fyll ut kontaktinformasjonen din"
                  : "Registrer deg med din kontaktinformasjon"}
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                style={{ backgroundColor: calendar.brandColor || "#3B82F6" }}
              >
                3
              </div>
              <h4
                className="text-xl font-bold mb-3"
                style={{ fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined }}
              >
                Vinn premier
              </h4>
              <p className="text-muted-foreground">
                Vi trekker en heldig vinner for hver luke. Lykke til!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {calendar.logo ? (
                <div className="relative h-8 w-8 overflow-hidden rounded-lg shadow-md bg-white dark:bg-white/10 p-1.5 border border-gray-100 dark:border-gray-800">
                  <Image
                    src={calendar.logo}
                    alt={calendar.title}
                    fill
                    sizes="32px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="h-8 w-8 rounded-lg shadow-md flex items-center justify-center text-white font-bold text-sm"
                  style={{
                    backgroundColor: calendar.brandColor || "#3B82F6",
                    fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined
                  }}
                >
                  {calendar.workspace.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                {calendar.footerText || `© ${new Date().getFullYear()} ${calendar.workspace.name}`}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {calendar.termsUrl && (
                <a
                  href={calendar.termsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Vilkår
                </a>
              )}
              {calendar.privacyPolicyUrl && (
                <a
                  href={calendar.privacyPolicyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Personvern
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all hover:scale-110 hover:shadow-3xl"
          style={{ backgroundColor: calendar.brandColor || "#3B82F6" }}
          aria-label="Scroll til toppen"
        >
          <IconChevronUp className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Door Sheet - Bottom on mobile, Right on desktop */}
      <Sheet open={!!selectedDoor} onOpenChange={() => { setSelectedDoor(null); setHasSubmitted(false); }}>
        <SheetContent
          side="right"
          className="w-full md:max-w-2xl lg:max-w-3xl overflow-y-auto p-0
            md:inset-y-0 md:right-0 md:h-full md:border-l
            max-md:inset-x-0 max-md:bottom-0 max-md:h-[90vh] max-md:border-t max-md:rounded-t-2xl
            max-md:data-[state=closed]:slide-out-to-bottom max-md:data-[state=open]:slide-in-from-bottom"
        >
          {selectedDoor && (
            <>
              {/* Mobile drag handle */}
              <div className="md:hidden flex justify-center pt-2 pb-1">
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
              </div>

              <SheetHeader
                className="px-6 pt-4 md:pt-6 pb-6 border-b sticky top-0 backdrop-blur-lg z-10 shadow-sm"
                style={{
                  background: `linear-gradient(to right, ${calendar.brandColor || "#3B82F6"}10, transparent, ${calendar.brandColor || "#3B82F6"}10)`
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${calendar.brandColor || "#3B82F6"}, ${calendar.brandColor || "#3B82F6"}dd)`,
                      fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined
                    }}
                  >
                    {selectedDoor.doorNumber}
                  </div>
                  <div className="flex-1">
                    <SheetTitle
                      className="text-2xl md:text-3xl font-bold"
                      style={{
                        fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined,
                        color: calendar.brandColor || undefined
                      }}
                    >
                      Luke {selectedDoor.doorNumber}
                      {selectedDoor.title && ` - ${selectedDoor.title}`}
                    </SheetTitle>
                    <SheetDescription className="flex items-center gap-1 text-sm mt-1">
                      <IconCalendar className="h-3 w-3" />
                      {format(selectedDoor.openDate, "d. MMMM yyyy", { locale: nb })}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {hasSubmitted ? (
                /* Success UI with Share Buttons */
                <div className="px-6 py-12 flex flex-col items-center justify-center text-center space-y-8">
                  {/* Success Icon */}
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full shadow-lg"
                    style={{
                      backgroundColor: `${calendar.brandColor || "#3B82F6"}15`,
                    }}
                  >
                    <IconCircleCheck
                      className="h-12 w-12"
                      style={{ color: calendar.brandColor || "#3B82F6" }}
                    />
                  </div>

                  {/* Thank You Message */}
                  <div className="space-y-2">
                    <h3
                      className="text-2xl font-bold"
                      style={{
                        fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined,
                        color: calendar.brandColor || undefined
                      }}
                    >
                      Takk for din deltakelse!
                    </h3>
                    <p className="text-muted-foreground">
                      {calendar.thankYouMessage || "Deltakelsen er registrert! Lykke til! 🎉"}
                    </p>
                  </div>

                  {/* Promo Code Section */}
                  {calendar.promoCode && (
                    <div className="w-full max-w-sm space-y-3 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 dark:from-amber-950/30 dark:to-yellow-950/30 dark:border-amber-800">
                      <div className="flex items-center justify-center gap-2">
                        <IconGift className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <h4 className="font-semibold text-amber-800 dark:text-amber-200">Din rabattkode</h4>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <code className="text-2xl font-bold tracking-wider bg-white dark:bg-gray-900 px-4 py-2 rounded border-2 border-dashed border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100">
                          {calendar.promoCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(calendar.promoCode!);
                            toast.success("Rabattkode kopiert!");
                          }}
                          className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 dark:text-amber-300 dark:hover:text-amber-100 dark:hover:bg-amber-900/50"
                        >
                          <IconCopy className="h-4 w-4" />
                        </Button>
                      </div>
                      {calendar.promoCodeMessage && (
                        <p className="text-sm text-amber-700 dark:text-amber-300 text-center">
                          {calendar.promoCodeMessage}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Share Section */}
                  <div className="w-full max-w-sm space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-center gap-2">
                      <IconShare
                        className="h-5 w-5"
                        style={{ color: calendar.brandColor || "#3B82F6" }}
                      />
                      <h4 className="font-semibold">Del kalenderen med dine venner</h4>
                    </div>
                    <ShareTargetButtons
                      url={`${baseShareUrl}/c/${calendar.slug}`}
                      title={calendar.title}
                      description={calendar.description || `Sjekk ut denne kalenderen fra ${calendar.workspace.name}!`}
                      size="default"
                    />
                  </div>

                  {/* Close Button */}
                  <Button
                    variant="outline"
                    onClick={() => { setSelectedDoor(null); setHasSubmitted(false); }}
                    className="mt-4"
                  >
                    Lukk
                  </Button>
                </div>
              ) : (
              <>
              <div className="px-6 py-6 space-y-8 pb-32">
                {/* Product Section */}
                {selectedDoor.product && (
                  <section className="space-y-6 relative">
                    {/* Prize Badge */}
                    <div className="flex items-center gap-2">
                      <IconGift
                        className="h-6 w-6"
                        style={{ color: calendar.brandColor || "#3B82F6" }}
                      />
                      <span
                        className="text-sm font-bold uppercase tracking-wide"
                        style={{ color: calendar.brandColor || "#3B82F6" }}
                      >
                        Dagens premie
                      </span>
                    </div>

                    {selectedDoor.product.imageUrl && (
                      <div
                        className="relative w-full overflow-hidden rounded-2xl bg-muted shadow-2xl ring-2"
                        style={{
                          aspectRatio: "16 / 9",
                          ringColor: `${calendar.brandColor || "#3B82F6"}30`
                        }}
                      >
                        <BlurImage
                          src={selectedDoor.product.imageUrl}
                          alt={selectedDoor.product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 640px"
                          className="object-cover"
                        />
                        {selectedDoor.product.value && (
                          <div className="absolute top-4 right-4">
                            <Badge
                              className="text-base font-bold px-4 py-2 bg-white/95 shadow-lg backdrop-blur-sm border-2"
                              style={{
                                color: calendar.brandColor || "#3B82F6",
                                borderColor: calendar.brandColor || "#3B82F6"
                              }}
                            >
                              <IconGift className="h-4 w-4 mr-1" />
                              kr {selectedDoor.product.value.toLocaleString('nb-NO')}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className="space-y-3 rounded-2xl p-6 border-2 shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${calendar.brandColor || "#3B82F6"}05, transparent)`,
                        borderColor: `${calendar.brandColor || "#3B82F6"}30`
                      }}
                    >
                      <h3
                        className="text-2xl font-bold flex items-center gap-2"
                        style={{ fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined }}
                      >
                        <span className="text-2xl" role="img" aria-label="prize">🎁</span>
                        {selectedDoor.product.name}
                      </h3>
                      {selectedDoor.product.description && (
                        <p className="text-muted-foreground leading-relaxed text-base">
                          {selectedDoor.product.description}
                        </p>
                      )}
                    </div>
                  </section>
                )}

                {selectedDoor.winner ? (
                  <div className="rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 border-2 border-yellow-300 dark:border-yellow-700 shadow-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl" role="img" aria-label="trophy">🏆</span>
                      <div>
                        <h4 className="font-bold text-xl">Vinner trukket!</h4>
                        <p className="text-sm text-muted-foreground">
                          Denne konkurransen er avsluttet
                        </p>
                      </div>
                    </div>
                    {selectedDoor.winner.isPublic ? (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold bg-white/70 dark:bg-black/20 p-3 rounded-lg">
                          🎉 Gratulerer til {selectedDoor.winner.lead.name || selectedDoor.winner.lead.email}!
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tusen takk til alle som deltok – følg med for flere premier.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-medium bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                          Vinneren er trukket og kontaktet direkte.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Arrangøren har valgt å ikke annonsere vinneren offentlig.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Quiz Section */}
                    {selectedDoor.enableQuiz && selectedDoor.questions.length > 0 && (
                      <section
                        className="rounded-2xl p-6 border-2 shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${calendar.brandColor || "#3B82F6"}08, ${calendar.brandColor || "#3B82F6"}03)`,
                          borderColor: `${calendar.brandColor || "#3B82F6"}30`
                        }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl" role="img" aria-label="quiz">🧠</span>
                          <h4
                            className="text-xl font-bold"
                            style={{
                              fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined,
                              color: calendar.brandColor || undefined
                            }}
                          >
                            Quiz-tid!
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">
                          Svar på spørsmålene under for å kvalifisere deg til trekningen ✨
                        </p>
                        <DoorQuizSection
                          questions={selectedDoor.questions}
                          answers={quizAnswers}
                          onAnswerChange={handleQuizAnswerChange}
                        />
                      </section>
                    )}

                    {/* Contact Form */}
                    <section
                      className="rounded-2xl p-6 border-2 shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${calendar.brandColor || "#3B82F6"}08, transparent)`,
                        borderColor: `${calendar.brandColor || "#3B82F6"}30`
                      }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl" role="img" aria-label="celebration">✨</span>
                        <h4
                          className="text-xl font-bold"
                          style={{
                            fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined,
                            color: calendar.brandColor || undefined
                          }}
                        >
                          Delta og vinn!
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-6">
                        Fyll ut skjemaet under for å være med i trekningen 🎲
                      </p>
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
                    </section>

                    {/* GDPR Consent Section */}
                    <section className="rounded-xl bg-muted/30 p-5 border space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg" role="img" aria-label="shield">🔒</span>
                        <h5 className="font-semibold text-sm">Personvern og samtykke</h5>
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms"
                          checked={consents.terms}
                          onCheckedChange={(checked) => setConsents({ ...consents, terms: checked as boolean })}
                        />
                        <div className="flex-1">
                          <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                            Jeg godtar{" "}
                            <a
                              href={calendar.termsUrl || "/legal/vilkar"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              vilkårene for konkurransen
                              <IconExternalLink className="h-3 w-3" />
                            </a>
                            {" "}
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
                            <a
                              href={calendar.privacyPolicyUrl || "/legal/personvern"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              personvernerklæringen
                              <IconExternalLink className="h-3 w-3" />
                            </a>
                            {" "}
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

                      <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                        Dine opplysninger behandles i henhold til personvernreglene. Du kan når som helst trekke tilbake ditt samtykke.
                      </p>
                    </section>

                    {/* Share Section */}
                    {shareUrl && (
                      <section
                        className="space-y-4 rounded-2xl border-2 border-dashed p-6 text-left shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${calendar.brandColor || "#3B82F6"}08, ${calendar.brandColor || "#3B82F6"}03)`,
                          borderColor: `${calendar.brandColor || "#3B82F6"}40`
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl" role="img" aria-label="share">
                            🎉
                          </span>
                          <h3
                            className="text-lg font-bold"
                            style={{
                              fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined,
                              color: calendar.brandColor || undefined
                            }}
                          >
                            Del med venner!
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Spre gleden! Jo flere som deltar, jo morsommere blir det.
                        </p>
                        <div className="flex items-center gap-2 rounded-lg bg-background p-3 border">
                          <span className="truncate text-sm" title={shareUrl}>
                            {shareUrl}
                          </span>
                          <ShareUrlCopyButton url={shareUrl} />
                        </div>
                        <ShareTargetButtons url={shareUrl} title={shareTitle} description={shareDescription} size="default" />
                      </section>
                    )}

                  </div>
                )}
              </div>

              {/* Sticky Footer with Submit Button */}
              {!selectedDoor.winner && (
                <SheetFooter
                  className="sticky bottom-0 border-t-2 px-6 py-5 mt-auto flex-row justify-between items-center shadow-2xl backdrop-blur-lg"
                  style={{
                    background: `linear-gradient(to right, ${calendar.brandColor || "#3B82F6"}05, transparent, ${calendar.brandColor || "#3B82F6"}05)`,
                    borderColor: `${calendar.brandColor || "#3B82F6"}30`
                  }}
                >
                  <div className="flex items-center gap-2">
                    <IconGift
                      className="h-5 w-5"
                      style={{ color: calendar.brandColor || "#3B82F6" }}
                    />
                    <p className="text-sm font-medium">
                      {selectedDoor._count.entries} {selectedDoor._count.entries === 1 ? "deltakelse" : "deltakelser"}
                    </p>
                  </div>
                  <Button
                    onClick={handleSubmitEntry}
                    disabled={isSubmitting}
                    className="min-w-[160px] shadow-2xl hover:scale-105 hover:shadow-3xl transition-all font-bold text-white"
                    style={{
                      backgroundColor: calendar.brandColor || "#3B82F6",
                      fontFamily: calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined
                    }}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Sender...
                      </>
                    ) : (
                      <>
                        <IconGift className="mr-2 h-5 w-5" />
                        {calendar.buttonText || "Send inn"}
                      </>
                    )}
                  </Button>
                </SheetFooter>
              )}
              </>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
      </div>
    </>
  );
}
