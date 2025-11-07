"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DotPattern } from "@/components/dot-pattern";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { useGoogleFont } from "@/hooks/use-google-font";
import { getFontFamilyValue } from "@/lib/google-fonts";
import { IconCheck, IconArrowRight, IconExternalLink } from "@tabler/icons-react";

export interface LandingHighlight {
  title?: string | null;
  description?: string | null;
}

interface PublicLandingProps {
  calendar: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    format: string;
    status: string;
    brandColor: string | null;
    brandFont: string | null;
    logo: string | null;
    landingHeroTitle: string | null;
    landingHeroSubtitle: string | null;
    landingHeroDescription: string | null;
    landingPrimaryActionLabel: string | null;
    landingPrimaryActionUrl: string | null;
    landingSecondaryActionLabel: string | null;
    landingSecondaryActionUrl: string | null;
    landingHighlights: LandingHighlight[] | null;
    landingShowLeadForm: boolean;
    landingPrizeImage: string | null;
    requireEmail: boolean;
    requireName: boolean;
    requirePhone: boolean;
    termsUrl: string | null;
    privacyPolicyUrl: string | null;
    thankYouMessage: string | null;
    workspace: {
      name: string;
      image: string | null;
    };
  };
}

export function PublicLanding({ calendar }: PublicLandingProps) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accentColor = calendar.brandColor || "#2563EB";
  const fontFamily = calendar.brandFont ? getFontFamilyValue(calendar.brandFont) : undefined;

  useGoogleFont(calendar.brandFont);

  const highlights = useMemo(() => {
    if (!calendar.landingHighlights) return [] as LandingHighlight[];
    return calendar.landingHighlights.filter((highlight) => {
      const title = (highlight.title || "").trim();
      const description = (highlight.description || "").trim();
      return Boolean(title || description);
    });
  }, [calendar.landingHighlights]);


  const heroTitle = (calendar.landingHeroTitle || "Bygg forventninger og samle leads").trim();
  const heroSubtitle = (calendar.landingHeroSubtitle || "").trim();
  const heroDescription = (
    calendar.landingHeroDescription ||
    calendar.description ||
    "Del nyheter, kampanjer og eksklusive tilbud på et øyeblikk."
  ).trim();
  const primaryCtaLabel = (calendar.landingPrimaryActionLabel || "Registrer deg nå").trim();
  const secondaryCtaLabel = (calendar.landingSecondaryActionLabel || "").trim();

  const handleSubmit = async () => {
    if (calendar.requireEmail && !formData.email.trim()) {
      toast.error("E-post er påkrevd");
      return;
    }

    if (calendar.requireName && !formData.name.trim()) {
      toast.error("Navn er påkrevd");
      return;
    }

    if (calendar.requirePhone && !formData.phone.trim()) {
      toast.error("Telefonnummer er påkrevd");
      return;
    }

    if (!consents.terms) {
      toast.error("Du må godta vilkårene for å registrere deg");
      return;
    }

    if (!consents.privacy) {
      toast.error("Du må godta personvernerklæringen for å registrere deg");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarId: calendar.id,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          marketingConsent: consents.marketing,
          termsAccepted: consents.terms,
          privacyPolicyAccepted: consents.privacy,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Kunne ikke registrere lead" }));
        throw new Error(error.error || "Kunne ikke registrere lead");
      }

      toast.success(calendar.thankYouMessage || "Takk for interessen! Vi tar kontakt snart.");
      setFormData({ email: "", name: "", phone: "" });
      setConsents({ terms: false, privacy: false, marketing: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kunne ikke registrere lead";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryCtaButton = calendar.landingPrimaryActionUrl ? (
    <Button
      size="lg"
      className="h-12 px-8 text-base font-bold shadow-lg hover:shadow-xl transition-shadow"
      style={{ backgroundColor: accentColor, fontFamily }}
      asChild
    >
      <Link href={calendar.landingPrimaryActionUrl} target="_blank" rel="noreferrer">
        {primaryCtaLabel}
      </Link>
    </Button>
  ) : (
    <Button
      size="lg"
      className="h-12 px-8 text-base font-bold shadow-lg hover:shadow-xl transition-shadow"
      style={{ backgroundColor: accentColor, fontFamily }}
      onClick={() => {
        const formElement = document.getElementById("lead-form");
        if (formElement) {
          formElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }}
    >
      {primaryCtaLabel}
    </Button>
  );

  return (
    <>
      <AnalyticsTracker calendarId={calendar.id} />

      <div
        className="min-h-screen"
        style={{ background: `linear-gradient(to bottom, ${accentColor}12, transparent)` }}
      >
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
          <div className="container mx-auto max-w-6xl px-4 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              {calendar.logo ? (
                <div className="relative h-11 w-11 md:h-14 md:w-14 overflow-hidden rounded-xl shadow-lg bg-white dark:bg-white/10 border border-muted">
                  <Image
                    src={calendar.logo}
                    alt={calendar.title}
                    fill
                    sizes="(max-width: 768px) 48px, 56px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="h-11 w-11 md:h-14 md:w-14 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg md:text-2xl"
                  style={{ backgroundColor: accentColor, fontFamily }}
                >
                  {calendar.workspace.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{calendar.workspace.name}</span>
                <span className="text-lg md:text-xl font-semibold" style={{ fontFamily }}>
                  {calendar.title}
                </span>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex items-center gap-2" style={{ borderColor: accentColor, color: accentColor }}>
              <IconArrowRight className="h-3.5 w-3.5" /> Landingssiden er aktiv
            </Badge>
          </div>
        </header>

        <main>
          <section className="relative overflow-hidden border-b">
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${accentColor}25 0%, transparent 70%)` }}
            />
            <DotPattern
              width={28}
              height={28}
              cx={1}
              cy={1}
              cr={1}
              className="opacity-25 [mask-image:radial-gradient(circle_at_center,white,transparent)]"
              style={{ color: accentColor }}
            />
            <div className="relative py-14">
              <div className="container mx-auto max-w-4xl px-4 text-center">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily }}>
                      {heroTitle || "Bygg forventninger og samle leads"}
                    </h1>
                    {heroSubtitle && (
                      <p className="text-lg text-muted-foreground" style={{ fontFamily }}>
                        {heroSubtitle}
                      </p>
                    )}
                    <p className="text-sm md:text-base text-muted-foreground">
                      {heroDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {primaryCtaButton}
                    {secondaryCtaLabel && calendar.landingSecondaryActionUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10 px-6 text-sm font-semibold"
                        style={{ borderColor: accentColor, color: accentColor, fontFamily }}
                        asChild
                      >
                        <Link href={calendar.landingSecondaryActionUrl} target="_blank" rel="noreferrer">
                          {secondaryCtaLabel}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {calendar.landingPrizeImage && (
            <section className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily, color: accentColor }}>
                    🎁 Vinn denne premien!
                  </h2>
                  <p className="text-base text-muted-foreground">
                    Delta i konkurransen og du kan vinne
                  </p>
                </div>
                <Card className="border shadow-xl overflow-hidden bg-background max-w-2xl mx-auto">
                  <CardContent className="p-0">
                    <div className="relative w-full aspect-video">
                      <Image
                        src={calendar.landingPrizeImage}
                        alt="Premie"
                        fill
                        sizes="(max-width: 768px) 100vw, 672px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          <section className="container mx-auto max-w-6xl px-4 py-12 md:py-16 space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily, color: accentColor }}>
                Dette får du
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Alt du trenger å vite om hvorfor det er verdt å delta
              </p>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(highlights.length > 0 ? highlights : [{
                title: "Del verdifull innsikt",
                description: "Bruk høydepunkter til å forklare verdiforslaget ditt og hvorfor det er relevant nå.",
              }]).map((highlight, index) => (
                <li
                  key={`highlight-${index}`}
                  className="rounded-xl border bg-background/80 p-4 shadow-sm"
                  style={{ borderColor: `${accentColor}25` }}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: accentColor }}>
                    <IconCheck className="h-4 w-4" />
                    {(highlight.title || "").trim() || `Høydepunkt ${index + 1}`}
                  </div>
                  {highlight.description && (
                    <p className="text-sm text-muted-foreground mt-2">{highlight.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t bg-muted/40" id="lead-form">
            <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
              {calendar.landingShowLeadForm ? (
                <Card className="shadow-lg border border-muted-foreground/30 bg-background/95">
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="space-y-3 text-center">
                      <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily }}>
                        Delta nå – det tar kun 30 sekunder
                      </h2>
                      <p className="text-base text-muted-foreground">
                        Registrer deg og vær med i konkurransen. Gratis og uten forpliktelser.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <IconCheck className="h-4 w-4" style={{ color: accentColor }} />
                          100% gratis
                        </span>
                        <span className="flex items-center gap-1.5">
                          <IconCheck className="h-4 w-4" style={{ color: accentColor }} />
                          Sikker registrering
                        </span>
                        <span className="flex items-center gap-1.5">
                          <IconCheck className="h-4 w-4" style={{ color: accentColor }} />
                          GDPR-godkjent
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {calendar.requireName && (
                        <div className="space-y-2">
                          <Label htmlFor="landing-name" className="text-xs">Navn</Label>
                          <Input
                            id="landing-name"
                            placeholder="Ola Nordmann"
                            value={formData.name}
                            onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="landing-email" className="text-xs">E-post</Label>
                        <Input
                          id="landing-email"
                          type="email"
                          placeholder="ola@bedrift.no"
                          value={formData.email}
                          onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                        />
                      </div>
                      {calendar.requirePhone && (
                        <div className="space-y-2">
                          <Label htmlFor="landing-phone" className="text-xs">Telefon</Label>
                          <Input
                            id="landing-phone"
                            placeholder="+47 400 00 000"
                            value={formData.phone}
                            onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 text-xs text-muted-foreground">
                      <label className="flex items-start gap-2">
                        <Checkbox
                          checked={consents.terms}
                          onCheckedChange={(checked) =>
                            setConsents((prev) => ({ ...prev, terms: Boolean(checked) }))
                          }
                        />
                        <span className="flex-1">
                          Jeg godtar{" "}
                          <a
                            href={calendar.termsUrl || "/legal/vilkar"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline inline-flex items-center gap-1"
                          >
                            vilkårene
                            <IconExternalLink className="h-3 w-3" />
                          </a>
                          <span className="text-destructive">*</span>
                        </span>
                      </label>
                      <label className="flex items-start gap-2">
                        <Checkbox
                          checked={consents.privacy}
                          onCheckedChange={(checked) =>
                            setConsents((prev) => ({ ...prev, privacy: Boolean(checked) }))
                          }
                        />
                        <span className="flex-1">
                          Jeg har lest og godtar{" "}
                          <a
                            href={calendar.privacyPolicyUrl || "/legal/personvern"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline inline-flex items-center gap-1"
                          >
                            personvernerklæringen
                            <IconExternalLink className="h-3 w-3" />
                          </a>
                          <span className="text-destructive">*</span>
                        </span>
                      </label>
                      <label className="flex items-start gap-2">
                        <Checkbox
                          checked={consents.marketing}
                          onCheckedChange={(checked) =>
                            setConsents((prev) => ({ ...prev, marketing: Boolean(checked) }))
                          }
                        />
                        <span className="flex-1">Hold meg oppdatert om lignende kampanjer</span>
                      </label>
                    </div>

                    <Button
                      size="lg"
                      className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-shadow"
                      style={{ backgroundColor: accentColor, fontFamily }}
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sender..." : "Delta i konkurransen"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Dine data er trygge og behandles i henhold til GDPR
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-dashed border-muted-foreground/30 bg-background/90">
                  <CardContent className="p-6 md:p-8 space-y-4">
                    <h2 className="text-xl font-semibold" style={{ fontFamily }}>
                      Registrering er for øyeblikket stengt
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Denne kampanjen samler ikke inn leads akkurat nå. Ta kontakt om du vil vite mer.
                    </p>
                    {calendar.landingPrimaryActionUrl && (
                      <Button
                        className="w-full h-11 text-sm font-semibold"
                        variant="outline"
                        style={{ borderColor: accentColor, color: accentColor, fontFamily }}
                        asChild
                      >
                        <Link href={calendar.landingPrimaryActionUrl} target="_blank" rel="noreferrer">
                          {primaryCtaLabel}
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
