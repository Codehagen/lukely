import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconUsers,
  IconGift,
  IconTrophy,
  IconCalendar,
  IconExternalLink,
  IconSettings,
  IconChartBar,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarStatusSwitcher } from "@/components/calendar-status-switcher";
import { CalendarQuickBranding } from "@/components/calendar-quick-branding";
import { CopyUrlButton } from "@/components/copy-url-button";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import { CalendarActivityTimeline } from "@/components/calendar-activity-timeline";

async function getCalendar(calendarId: string, workspaceId: string) {
  return await prisma.calendar.findFirst({
    where: {
      id: calendarId,
      workspaceId,
    },
    include: {
      _count: {
        select: {
          leads: true,
          doors: true,
        },
      },
      doors: {
        include: {
          product: true,
          winner: {
            include: {
              lead: true,
            },
          },
          _count: {
            select: {
              entries: true,
            },
          },
        },
      },
    },
  });
}

export default async function CalendarOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userWithWorkspace = await prisma.user.findUnique({
    where: { id: user.id },
    include: { defaultWorkspace: true },
  });

  if (!userWithWorkspace?.defaultWorkspaceId) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <WorkspaceEmptyState description="Opprett et arbeidsområde for å få tilgang til kalenderdetaljer." />
      </div>
    );
  }

  const calendar = await getCalendar(id, userWithWorkspace.defaultWorkspaceId);

  if (!calendar) {
    notFound();
  }

  const totalEntries = calendar.doors.reduce(
    (sum, door) => sum + door._count.entries,
    0
  );
  const winnersSelected = calendar.doors.filter((door) => door.winner).length;
  const doorsWithProducts = calendar.doors.filter(
    (door) => door.product
  ).length;

  const typeLabels: Record<string, string> = {
    CHRISTMAS: "Jul",
    VALENTINE: "Valentin",
    EASTER: "Påske",
    CUSTOM: "Tilpasset",
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">
              {calendar.title}
            </h2>
            <CalendarStatusSwitcher
              calendarId={calendar.id}
              currentStatus={calendar.status}
            />
          </div>
          <p className="text-muted-foreground mt-1">
            {format(calendar.startDate, "d. MMM yyyy", { locale: nb })} -{" "}
            {format(calendar.endDate, "d. MMM yyyy", { locale: nb })}
          </p>
        </div>
        <div className="flex gap-2">
          <CopyUrlButton url={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/c/${calendar.slug}`} />
          <Link href={`/c/${calendar.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <IconExternalLink className="mr-2 h-4 w-4" />
              Forhåndsvis
            </Button>
          </Link>
          <Link href={`/dashboard/calendars/${calendar.id}/settings`}>
            <Button variant="outline" size="sm">
              <IconSettings className="mr-2 h-4 w-4" />
              Innstillinger
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totalt antall leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconUsers className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">{calendar._count.leads}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totalt antall deltakelser
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">{totalEntries}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produkter lagt til
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconGift className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">
                {doorsWithProducts}/{calendar._count.doors}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valgte vinnere
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconTrophy className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">
                {winnersSelected}/{calendar._count.doors}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="branding">Merkevare</TabsTrigger>
          <TabsTrigger value="quick-actions">Hurtighandlinger</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kalenderdetaljer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Type
                  </p>
                  <p className="text-lg font-semibold">
                    {typeLabels[calendar.type] || calendar.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Antall luker
                  </p>
                  <p className="text-lg font-semibold">{calendar.doorCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Offentlig URL
                  </p>
                  <Link
                    href={`/c/${calendar.slug}`}
                    target="_blank"
                    className="text-lg font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    /c/{calendar.slug}
                    <IconExternalLink className="h-4 w-4" />
                  </Link>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Profilfarge
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{
                        backgroundColor: calendar.brandColor || "#3B82F6",
                      }}
                    />
                    <p className="text-lg font-semibold">
                      {calendar.brandColor || "#3B82F6"}
                    </p>
                  </div>
                </div>
              </div>

              {calendar.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Beskrivelse
                  </p>
                  <p className="text-muted-foreground">
                    {calendar.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Siste aktivitet</CardTitle>
              <CardDescription>
                Nyeste deltakelser og vinnervalg
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarActivityTimeline calendarId={calendar.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <CalendarQuickBranding
            calendar={{
              id: calendar.id,
              brandColor: calendar.brandColor,
              logo: calendar.logo,
              bannerImage: calendar.bannerImage,
              buttonText: calendar.buttonText || null,
              thankYouMessage: calendar.thankYouMessage || null,
            }}
          />
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Administrer produkter</CardTitle>
                <CardDescription>
                  Legg til og rediger produkter for hver luke
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/calendars/${calendar.id}/doors`}>
                  <Button className="w-full">
                    <IconGift className="mr-2 h-4 w-4" />
                    Gå til luker
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Velg vinnere</CardTitle>
                <CardDescription>Trekk vinnere for åpne luker</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/calendars/${calendar.id}/winners`}>
                  <Button className="w-full">
                    <IconTrophy className="mr-2 h-4 w-4" />
                    Administrer vinnere
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vis leads</CardTitle>
                <CardDescription>
                  Se alle innsamlede leads og eksporter data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/calendars/${calendar.id}/leads`}>
                  <Button className="w-full">
                    <IconUsers className="mr-2 h-4 w-4" />
                    Vis leads
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analyser</CardTitle>
                <CardDescription>
                  Se detaljert kampanjeytelse og statistikk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/calendars/${calendar.id}/analytics`}>
                  <Button className="w-full">
                    <IconChartBar className="mr-2 h-4 w-4" />
                    Se analyser
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Offentlig side</CardTitle>
                <CardDescription>
                  Se kalenderen slik brukerne opplever den
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/c/${calendar.slug}`} target="_blank">
                  <Button className="w-full" variant="outline">
                    <IconExternalLink className="mr-2 h-4 w-4" />
                    Åpne offentlig side
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
