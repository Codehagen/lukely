"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconLock, IconGift, IconCalendar, IconDeviceDesktop, IconDeviceMobile, IconDeviceTablet, IconCheck } from "@tabler/icons-react";
import { format, addDays, isPast, isToday } from "date-fns";
import { nb } from "date-fns/locale";
import { useGoogleFont } from "@/hooks/use-google-font";
import { getFontFamilyValue } from "@/lib/google-fonts";
import { DotPattern } from "@/components/dot-pattern";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LandingHighlight } from "./calendar-form-steps/step-landing-content";

type CalendarFormatOption = "landing" | "quiz" | "";

interface CalendarPreviewFormData {
  calendarFormat?: CalendarFormatOption;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  doorCount: number;
  brandColor: string;
  brandFont?: string;
  logo?: string;
  landingHeroTitle?: string;
  landingHeroSubtitle?: string;
  landingHeroDescription?: string;
  landingPrimaryActionLabel?: string;
  landingPrimaryActionUrl?: string;
  landingSecondaryActionLabel?: string;
  landingSecondaryActionUrl?: string;
  landingHighlights?: LandingHighlight[];
  landingShowLeadForm?: boolean;
}

interface CalendarPreviewProps {
  formData: CalendarPreviewFormData;
}

type DeviceType = "desktop" | "mobile" | "tablet";

export default function CalendarPreview({ formData }: CalendarPreviewProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

  // Load brand font dynamically
  useGoogleFont(formData.brandFont);

  const accentColor = formData.brandColor || "#3B82F6";
  const isLandingFormat = formData.calendarFormat === "landing";

  const deviceClass = useMemo(() => {
    switch (deviceType) {
      case "mobile":
        return "max-w-[375px] mx-auto";
      case "tablet":
        return "max-w-[768px] mx-auto";
      default:
        return "w-full";
    }
  }, [deviceType]);

  const scaleClass = useMemo(() => {
    switch (deviceType) {
      case "mobile":
        return "scale-[0.85] origin-top";
      case "tablet":
        return "scale-[0.9] origin-top";
      default:
        return "";
    }
  }, [deviceType]);

  const previewContent = isLandingFormat ? (
    <LandingPreviewContent formData={formData} accentColor={accentColor} />
  ) : (
    <QuizPreviewContent formData={formData} accentColor={accentColor} />
  );

  return (
    <div className="sticky top-6 space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <IconCalendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Forhåndsvisning</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={deviceType === "desktop" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setDeviceType("desktop")}
            className="h-8 w-8 p-0"
          >
            <IconDeviceDesktop className="h-4 w-4" />
          </Button>
          <Button
            variant={deviceType === "tablet" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setDeviceType("tablet")}
            className="h-8 w-8 p-0"
          >
            <IconDeviceTablet className="h-4 w-4" />
          </Button>
          <Button
            variant={deviceType === "mobile" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setDeviceType("mobile")}
            className="h-8 w-8 p-0"
          >
            <IconDeviceMobile className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-muted/30 overflow-hidden">
        <div className={`${deviceClass} overflow-hidden bg-background transition-all duration-300`}>
          <div className={scaleClass}>{previewContent}</div>
        </div>
      </div>
    </div>
  );
}

function QuizPreviewContent({ formData, accentColor }: { formData: CalendarPreviewFormData; accentColor: string }) {
  const fontFamily = formData.brandFont ? getFontFamilyValue(formData.brandFont) : undefined;
  const doorCount = Math.max(formData.doorCount || 0, 1);

  const mockDoors = useMemo(() => {
    return Array.from({ length: doorCount }, (_, i) => ({
      id: `mock-${i + 1}`,
      doorNumber: i + 1,
      openDate: addDays(formData.startDate, i),
      entries: Math.floor(Math.random() * 50),
    }));
  }, [doorCount, formData.startDate]);

  const { totalDoors, openedDoors, totalEntries, todaysDoor } = useMemo(() => {
    let opened = 0;
    let entries = 0;
    let today: (typeof mockDoors)[number] | undefined;

    for (const door of mockDoors) {
      const isOpen = isPast(door.openDate) || isToday(door.openDate);
      if (isOpen) {
        opened += 1;
      }
      entries += door.entries;
      if (!today && isToday(door.openDate)) {
        today = door;
      }
    }

    return {
      totalDoors: mockDoors.length,
      openedDoors: opened,
      totalEntries: entries,
      todaysDoor: today,
    };
  }, [mockDoors]);

  return (
    <div
      className="min-h-[600px]"
      style={{ background: `linear-gradient(to bottom, ${accentColor}15, transparent)` }}
    >
      <header className="border-b bg-background/95 backdrop-blur-lg shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg"
                style={{
                  backgroundColor: accentColor,
                  fontFamily,
                }}
              >
                {(formData.title || "K").charAt(0).toUpperCase()}
              </div>
              <div>
                <h1
                  className="text-lg font-bold tracking-tight"
                  style={{ fontFamily, color: accentColor }}
                >
                  {formData.title || "Velg en mal for å starte"}
                </h1>
                <p className="text-xs text-muted-foreground">Din bedrift</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-xs px-2 py-0.5"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              {format(formData.startDate, "d. MMM", { locale: nb })} - {format(formData.endDate, "d. MMM", { locale: nb })}
            </Badge>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}05 50%, transparent 100%)`,
          }}
        />
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
          className="opacity-30 [mask-image:radial-gradient(circle_at_center,white,transparent)]"
          style={{ color: accentColor }}
        />
        <div className="relative px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2
              className="text-3xl font-bold mb-4 leading-tight"
              style={{
                fontFamily,
                backgroundImage: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Vinn fantastiske premier hver dag!
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">
              {formData.description || "Velg en mal for å se forhåndsvisning av kalenderen din"}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {totalDoors} luker å åpne
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 max-w-xl mx-auto">
              <div
                className="rounded-xl border-2 bg-background/80 backdrop-blur-sm p-4 shadow-lg"
                style={{ borderColor: `${accentColor}40` }}
              >
                <div className="text-2xl font-bold mb-1" style={{ fontFamily, color: accentColor }}>
                  {openedDoors}/{totalDoors}
                </div>
                <div className="text-xs text-muted-foreground font-medium">Luker åpnet</div>
              </div>
              <div
                className="rounded-xl border-2 bg-background/80 backdrop-blur-sm p-4 shadow-lg"
                style={{ borderColor: `${accentColor}40` }}
              >
                <div className="text-2xl font-bold mb-1" style={{ fontFamily, color: accentColor }}>
                  {totalEntries.toLocaleString("nb-NO")}
                </div>
                <div className="text-xs text-muted-foreground font-medium">Deltakelser</div>
              </div>
            </div>

            {todaysDoor && (
              <Button
                size="sm"
                className="text-sm px-6 h-9 font-bold shadow-xl"
                style={{ backgroundColor: accentColor, fontFamily }}
              >
                <IconGift className="mr-2 h-4 w-4" />
                Åpne dagens luke nå!
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="px-4 py-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-2" style={{ fontFamily, color: accentColor }}>
            Alle luker
          </h3>
          <p className="text-muted-foreground text-sm">Åpne en luke hver dag og delta i trekningen</p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {mockDoors.slice(0, 12).map((door) => {
            const isOpen = isPast(door.openDate) || isToday(door.openDate);
            const isTodaysDoor = todaysDoor?.id === door.id;

            return (
              <Card
                key={door.id}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  !isOpen ? "opacity-50" : ""
                } ${isTodaysDoor ? "ring-2 ring-offset-2" : ""} relative overflow-hidden`}
                style={{
                  borderColor: isOpen ? accentColor : undefined,
                  ringColor: isTodaysDoor ? accentColor : undefined,
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, transparent)` }}
                />

                <CardContent className="relative p-3 flex flex-col items-center justify-center aspect-square">
                  {!isOpen ? (
                    <>
                      <IconLock className="h-6 w-6 text-muted-foreground mb-1" />
                      <p className="text-xl font-bold" style={{ fontFamily }}>
                        {door.doorNumber}
                      </p>
                      <p className="text-[10px] text-muted-foreground text-center">
                        {format(door.openDate, "d. MMM", { locale: nb })}
                      </p>
                    </>
                  ) : (
                    <>
                      <IconGift className="h-6 w-6 mb-1" style={{ color: accentColor }} />
                      <p className="text-xl font-bold" style={{ fontFamily, color: accentColor }}>
                        {door.doorNumber}
                      </p>
                      <p className="text-[10px] text-muted-foreground text-center">
                        {door.entries} {door.entries === 1 ? "deltakelse" : "deltakelser"}
                      </p>
                    </>
                  )}

                  {isTodaysDoor && (
                    <div
                      className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white shadow-lg"
                      style={{ backgroundColor: accentColor }}
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

      <div className="border-t bg-muted/30">
        <div className="px-4 py-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily, color: accentColor }}>
              Hvordan fungerer det?
            </h3>
            <p className="text-muted-foreground text-sm">Tre enkle steg til din vinnerpremie</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {["Åpne en luke", "Fyll ut skjema", "Vinn premier"].map((title, index) => (
              <div className="text-center" key={title}>
                <div
                  className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  {index + 1}
                </div>
                <h4 className="text-sm font-bold mb-1" style={{ fontFamily }}>
                  {title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {index === 0
                    ? "Klikk på dagens luke"
                    : index === 1
                    ? "Registrer deg"
                    : "Lykke til!"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingPreviewContent({ formData, accentColor }: { formData: CalendarPreviewFormData; accentColor: string }) {
  const fontFamily = formData.brandFont ? getFontFamilyValue(formData.brandFont) : undefined;
  const heroTitle = (formData.landingHeroTitle || "Bygg forventninger og samle leads").trim();
  const heroSubtitle = (formData.landingHeroSubtitle || "").trim();
  const heroDescription = (
    formData.landingHeroDescription ||
    formData.description ||
    "Del nyheter, kampanjer og eksklusive tilbud på et øyeblikk."
  ).trim();
  const primaryCta = (formData.landingPrimaryActionLabel || "Start kampanjen").trim();
  const secondaryCta = (formData.landingSecondaryActionLabel || "").trim();
  const highlights = (formData.landingHighlights || []).filter((highlight) =>
    (highlight.title || "").trim().length > 0 || (highlight.description || "").trim().length > 0
  );
  const showLeadForm = formData.landingShowLeadForm ?? true;
  const badgeLabel = "Landingsside";

  return (
    <div
      className="min-h-[600px] flex flex-col"
      style={{ background: `linear-gradient(to bottom right, ${accentColor}12, transparent)` }}
    >
      <header className="border-b bg-background/95 backdrop-blur-lg shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: accentColor, fontFamily }}
            >
              {(formData.title || "K").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily, color: accentColor }}>
                {formData.title || "Din kampanje"}
              </h1>
              <p className="text-xs text-muted-foreground">Tilpasset landingsside</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs px-2 py-0.5" style={{ borderColor: accentColor, color: accentColor }}>
            {badgeLabel}
          </Badge>
        </div>
      </header>

      <section className="relative overflow-hidden border-b">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${accentColor}20 0%, transparent 100%)` }}
        />
        <DotPattern
          width={24}
          height={24}
          cx={1}
          cy={1}
          cr={1}
          className="opacity-30 [mask-image:radial-gradient(circle_at_center,white,transparent)]"
          style={{ color: accentColor }}
        />
        <div className="relative px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2
              className="text-3xl font-bold mb-4 leading-tight"
              style={{
                fontFamily,
                backgroundImage: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {heroTitle}
            </h2>
            {heroSubtitle && (
              <p className="text-base text-muted-foreground mb-4 max-w-2xl mx-auto">
                {heroSubtitle}
              </p>
            )}
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">
              {heroDescription}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <Button
                size="sm"
                className="h-9 px-6 text-sm font-semibold shadow-md"
                style={{ backgroundColor: accentColor, fontFamily }}
              >
                {primaryCta}
              </Button>
              {secondaryCta && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-6 text-sm font-semibold"
                  style={{
                    borderColor: accentColor,
                    color: accentColor,
                    fontFamily,
                  }}
                >
                  {secondaryCta}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 space-y-6">
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-bold" style={{ fontFamily, color: accentColor }}>
            Dette får du
          </h3>
          <p className="text-sm text-muted-foreground">
            Fremhev fordelene for å øke konverteringen.
          </p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(highlights.length > 0 ? highlights : [{ title: "Del verdifull innsikt", description: "Bruk høydepunkter til å forklare verdiforslaget ditt." }]).map(
            (highlight, index) => (
              <li
                key={`highlight-${index}-${highlight.title}`}
                className="rounded-xl border bg-background/80 p-4 shadow-sm"
                style={{ borderColor: `${accentColor}25` }}
              >
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: accentColor }}>
                  <IconCheck className="h-4 w-4" />
                  {highlight.title || `Høydepunkt ${index + 1}`}
                </div>
                {highlight.description && (
                  <p className="text-sm text-muted-foreground mt-2">{highlight.description}</p>
                )}
              </li>
            )
          )}
        </ul>

        {showLeadForm ? (
          <Card className="border-dashed border-2 border-muted-foreground/30 bg-background/70">
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold" style={{ fontFamily }}>
                  Eksempel på leadskjema
                </h4>
                <p className="text-xs text-muted-foreground">
                  Tilpasses med dine felter når du publiserer landingssiden.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Navn</Label>
                  <Input value="Ola Nordmann" readOnly className="text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">E-post</Label>
                  <Input value="ola@bedrift.no" readOnly className="text-sm" />
                </div>
              </div>
              <Button disabled className="w-full h-9 text-sm font-semibold" style={{ backgroundColor: accentColor }}>
                Send inn (eksempel)
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-dashed border-muted-foreground/40 bg-background/70">
            <CardContent className="p-5">
              <p className="text-sm font-semibold" style={{ fontFamily }}>
                Leadskjema deaktivert
              </p>
              <p className="text-xs text-muted-foreground">
                Aktiver skjema for å samle leads direkte fra landingssiden.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
