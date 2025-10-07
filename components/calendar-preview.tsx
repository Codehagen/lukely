"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconLock, IconGift, IconCalendar, IconDeviceDesktop, IconDeviceMobile, IconDeviceTablet } from "@tabler/icons-react";
import { format, addDays, isPast, isToday } from "date-fns";
import { nb } from "date-fns/locale";
import { useGoogleFont } from "@/hooks/use-google-font";
import { getFontFamilyValue } from "@/lib/google-fonts";
import { DotPattern } from "@/components/dot-pattern";

interface CalendarPreviewProps {
  formData: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    doorCount: number;
    brandColor: string;
    brandFont?: string;
    logo?: string;
  };
}

type DeviceType = "desktop" | "mobile" | "tablet";

export default function CalendarPreview({ formData }: CalendarPreviewProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

  // Load brand font dynamically
  useGoogleFont(formData.brandFont);

  // Generate mock doors based on doorCount
  const mockDoors = useMemo(() => {
    return Array.from({ length: formData.doorCount }, (_, i) => ({
      id: `mock-${i + 1}`,
      doorNumber: i + 1,
      openDate: addDays(formData.startDate, i),
      title: null,
      description: null,
      entries: Math.floor(Math.random() * 50),
    }));
  }, [formData.doorCount, formData.startDate]);

  const isDoorOpen = (door: typeof mockDoors[0]) => {
    const now = new Date();
    return isPast(door.openDate) || isToday(door.openDate);
  };

  // Calculate stats
  const totalDoors = mockDoors.length;
  const openedDoors = mockDoors.filter((door) => isDoorOpen(door)).length;
  const totalEntries = mockDoors.reduce((sum, door) => sum + door.entries, 0);
  const todaysDoor = mockDoors.find((door) => isToday(door.openDate));

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

  return (
    <div className="sticky top-6 space-y-4">
      {/* Preview Header */}
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

      {/* Preview Container */}
      <div className="border rounded-lg bg-muted/30 overflow-hidden">
        <div className={`${deviceClass} overflow-hidden bg-background transition-all duration-300`}>
          <div className={scaleClass}>
            <div className="min-h-[600px]" style={{
              background: `linear-gradient(to bottom, ${formData.brandColor || "#3B82F6"}15, transparent)`
            }}>
              {/* Header */}
              <header className="border-b bg-background/95 backdrop-blur-lg shadow-sm">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {formData.logo ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-lg bg-white dark:bg-white/10 p-2 border border-gray-100 dark:border-gray-800">
                          <Image
                            src={formData.logo}
                            alt={formData.title || "Calendar"}
                            fill
                            sizes="40px"
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div
                          className="h-10 w-10 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg"
                          style={{
                            backgroundColor: formData.brandColor || "#3B82F6",
                            fontFamily: formData.brandFont ? getFontFamilyValue(formData.brandFont) : undefined
                          }}
                        >
                          {(formData.title || "K").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h1
                          className="text-lg font-bold tracking-tight"
                          style={{
                            fontFamily: formData.brandFont ? getFontFamilyValue(formData.brandFont) : undefined,
                            color: formData.brandColor || undefined
                          }}
                        >
                          {formData.title || "Velg en mal for å starte"}
                        </h1>
                        <p className="text-xs text-muted-foreground">Din bedrift</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-0.5"
                      style={{
                        borderColor: formData.brandColor || undefined,
                        color: formData.brandColor || undefined
                      }}
                    >
                      {format(formData.startDate, "d. MMM", { locale: nb })} - {format(formData.endDate, "d. MMM", { locale: nb })}
                    </Badge>
                  </div>
                </div>
              </header>

              {/* Hero Section */}
              <section className="relative overflow-hidden border-b">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${formData.brandColor || "#3B82F6"}20 0%, ${formData.brandColor || "#3B82F6"}05 50%, transparent 100%)`
                  }}
                />
                <DotPattern
                  width={20}
                  height={20}
                  cx={1}
                  cy={1}
                  cr={1}
                  className="opacity-30 [mask-image:radial-gradient(circle_at_center,white,transparent)]"
                  style={{ color: formData.brandColor || "#3B82F6" }}
                />
                <div className="relative px-4 py-12">
                  <div className="max-w-4xl mx-auto text-center">
                    <h2
                      className="text-3xl font-bold mb-4 leading-tight"
                      style={{
                        fontFamily: formData.brandFont ? getFontFamilyValue(formData.brandFont) : undefined,
                        backgroundImage: `linear-gradient(135deg, ${formData.brandColor || "#3B82F6"}, ${formData.brandColor || "#3B82F6"}99)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                      }}
                    >
                      Vinn fantastiske premier hver dag!
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">
                      {formData.description || "Velg en mal for å se forhåndsvisning av kalenderen din"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      {totalDoors} lukere å åpne
                    </p>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-6 max-w-xl mx-auto">
                      <div
                        className="rounded-xl border-2 bg-background/80 backdrop-blur-sm p-4 shadow-lg"
                        style={{ borderColor: `${formData.brandColor || "#3B82F6"}40` }}
                      >
                        <div
                          className="text-2xl font-bold mb-1"
                          style={{
                            fontFamily: formData.brandFont ? getFontFamilyValue(formData.brandFont) : undefined,
                            color: formData.brandColor || undefined
                          }}
                        >
                          {openedDoors}/{totalDoors}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Lukere åpnet</div>
                      </div>
                      <div
                        className="rounded-xl border-2 bg-background/80 backdrop-blur-sm p-4 shadow-lg"
                        style={{ borderColor: `${formData.brandColor || "#3B82F6"}40` }}
                      >
                        <div
                          className="text-2xl font-bold mb-1"
                          style={{
                            fontFamily: formData.brandFont ? getFontFamilyValue(formData.brandFont) : undefined,
                            color: formData.brandColor || undefined
                          }}
                        >
                          {totalEntries.toLocaleString('nb-NO')}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Deltakelser</div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    {todaysDoor && (
                      <Button
                        size="sm"
                        className="text-sm px-6 h-9 font-bold shadow-xl"
                        style={{
                          backgroundColor: formData.brandColor || "#3B82F6",
                          fontFamily: formData.brandFont ? getFontFamilyValue(formData.brandFont) : undefined
                        }}
                      >
                        <IconGift className="mr-2 h-4 w-4" />
                        Åpne dagens luke nå!
                      </Button>
                    )}
                  </div>
                </div>
              </section>

              {/* Calendar Grid */}
              <div className="px-4 py-8">
                <div className="text-center mb-6">
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{
                      fontFamily: formData.brandFont ? getFontFamilyValue(formData.brandFont) : undefined,
                      color: formData.brandColor || undefined
                    }}
                  >
                    Alle luker
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Åpne en luke hver dag og delta i trekningen
                  </p>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {mockDoors.slice(0, 12).map((door) => {
                    const isOpen = isDoorOpen(door);
                    const isTodaysDoor = todaysDoor?.id === door.id;

                    return (
                      <Card
                        key={door.id}
                        className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          !isOpen ? "opacity-50" : ""
                        } ${
                          isTodaysDoor ? "ring-2 ring-offset-2" : ""
                        } relative overflow-hidden`}
                        style={{
                          borderColor: isOpen ? formData.brandColor || undefined : undefined,
                          ringColor: isTodaysDoor ? formData.brandColor || undefined : undefined,
                        }}
                      >
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${formData.brandColor || "#3B82F6"}, transparent)`
                          }}
                        />

                        <CardContent className="relative p-3 flex flex-col items-center justify-center aspect-square">
                          {!isOpen ? (
                            <>
                              <IconLock className="h-6 w-6 text-muted-foreground mb-1" />
                              <p
                                className="text-xl font-bold"
                                style={{ fontFamily: formData.brandFont ? getFontFamilyValue(formData.brandFont) : undefined }}
                              >
                                {door.doorNumber}
                              </p>
                              <p className="text-[10px] text-muted-foreground text-center">
                                {format(door.openDate, "d. MMM", { locale: nb })}
                              </p>
                            </>
                          ) : (
                            <>
                              <IconGift
                                className="h-6 w-6 mb-1"
                                style={{ color: formData.brandColor || undefined }}
                              />
                              <p
                                className="text-xl font-bold"
                                style={{
                                  fontFamily: formData.brandFont ? getFontFamilyValue(formData.brandFont) : undefined,
                                  color: formData.brandColor || undefined
                                }}
                              >
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
                              style={{ backgroundColor: formData.brandColor || "#3B82F6" }}
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
                <div className="px-4 py-8">
                  <div className="text-center mb-6">
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{
                        fontFamily: formData.brandFont ? getFontFamilyValue(formData.brandFont) : undefined,
                        color: formData.brandColor || undefined
                      }}
                    >
                      Hvordan fungerer det?
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Tre enkle steg til din vinnerpremie
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div
                        className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg"
                        style={{ backgroundColor: formData.brandColor || "#3B82F6" }}
                      >
                        1
                      </div>
                      <h4
                        className="text-sm font-bold mb-1"
                        style={{ fontFamily: formData.brandFont ? getFontFamilyValue(formData.brandFont) : undefined }}
                      >
                        Åpne en luke
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Klikk på dagens luke
                      </p>
                    </div>

                    <div className="text-center">
                      <div
                        className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg"
                        style={{ backgroundColor: formData.brandColor || "#3B82F6" }}
                      >
                        2
                      </div>
                      <h4
                        className="text-sm font-bold mb-1"
                        style={{ fontFamily: formData.brandFont ? getFontFamilyValue(formData.brandFont) : undefined }}
                      >
                        Fyll ut skjema
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Registrer deg
                      </p>
                    </div>

                    <div className="text-center">
                      <div
                        className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg"
                        style={{ backgroundColor: formData.brandColor || "#3B82F6" }}
                      >
                        3
                      </div>
                      <h4
                        className="text-sm font-bold mb-1"
                        style={{ fontFamily: formData.brandFont ? getFontFamilyValue(formData.brandFont) : undefined }}
                      >
                        Vinn premier
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Lykke til!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
