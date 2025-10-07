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
  IconDoorEnter,
  IconDotsVertical,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarStatusSwitcher } from "@/components/calendar-status-switcher";
import { CalendarQuickBranding } from "@/components/calendar-quick-branding";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
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

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <ButtonGroup>
            <Link href={`/dashboard/calendars/${calendar.id}/doors`}>
              <Button variant="outline" size="sm">
                <IconGift className="mr-2 h-4 w-4" />
                Luker
              </Button>
            </Link>
          </ButtonGroup>
          <ButtonGroup>
            <Link href={`/dashboard/calendars/${calendar.id}/winners`}>
              <Button variant="outline" size="sm">
                <IconTrophy className="mr-2 h-4 w-4" />
                Velg vinnere
              </Button>
            </Link>
          </ButtonGroup>
          <ButtonGroup>
            <Link href={`/dashboard/calendars/${calendar.id}/settings`}>
              <Button variant="outline" size="sm">
                <IconSettings className="mr-2 h-4 w-4" />
                Innstillinger
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label="More Options">
                  <IconDotsVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href={`/c/${calendar.slug}`} target="_blank">
                      <IconExternalLink className="mr-2 h-4 w-4" />
                      Forhåndsvis
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/calendars/${calendar.id}/analytics`}>
                      <IconChartBar className="mr-2 h-4 w-4" />
                      Analyser
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/calendars/${calendar.id}/leads`}>
                      <IconUsers className="mr-2 h-4 w-4" />
                      Vis leads
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
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
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Calendar Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Kalenderdetaljer</CardTitle>
                  <Badge variant="secondary" className="gap-1.5">
                    <IconCalendar className="h-3.5 w-3.5" />
                    {typeLabels[calendar.type] || calendar.type}
                  </Badge>
                </div>
                <CardDescription>
                  {format(calendar.startDate, "d. MMMM yyyy", { locale: nb })} - {format(calendar.endDate, "d. MMMM yyyy", { locale: nb })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Description */}
                {calendar.description && (
                  <>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {calendar.description}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Key Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <IconGift className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Antall luker</p>
                        <p className="text-lg font-semibold">{calendar.doorCount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Produkter lagt til</p>
                      <p className="text-lg font-semibold">
                        {doorsWithProducts}/{calendar._count.doors}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Public URL */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Offentlig URL</p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/c/${calendar.slug}`}
                      target="_blank"
                      className="flex items-center gap-1.5 text-sm font-mono text-blue-600 hover:underline"
                    >
                      {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/c/{calendar.slug}
                      <IconExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <CopyUrlButton
                    url={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/c/${calendar.slug}`}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Branding */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Merkevare</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-full border-2 shadow-sm"
                        style={{
                          backgroundColor: calendar.brandColor || "#3B82F6",
                        }}
                      />
                      <div>
                        <p className="text-xs text-muted-foreground">Profilfarge</p>
                        <p className="font-mono text-sm font-semibold">
                          {calendar.brandColor || "#3B82F6"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Activity Timeline */}
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
          </div>
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
      </Tabs>
    </div>
  );
}
