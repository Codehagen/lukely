import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconUsers, IconGift, IconTrophy, IconCalendar, IconExternalLink, IconSettings } from "@tabler/icons-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

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
    return <div>Fant ingen arbeidsområde</div>;
  }

  const calendar = await getCalendar(id, userWithWorkspace.defaultWorkspaceId);

  if (!calendar) {
    notFound();
  }

  const totalEntries = calendar.doors.reduce((sum, door) => sum + door._count.entries, 0);
  const winnersSelected = calendar.doors.filter((door) => door.winner).length;
  const doorsWithProducts = calendar.doors.filter((door) => door.product).length;

  const statusLabels: Record<string, string> = {
    DRAFT: "KLADD",
    SCHEDULED: "PLANLAGT",
    ACTIVE: "AKTIV",
    COMPLETED: "FULLFØRT",
    ARCHIVED: "ARKIVERT",
  };

  const typeLabels: Record<string, string> = {
    CHRISTMAS: "Jul",
    VALENTINE: "Valentin",
    EASTER: "Påske",
    CUSTOM: "Tilpasset",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-500";
      case "SCHEDULED":
        return "bg-blue-500";
      case "ACTIVE":
        return "bg-green-500";
      case "COMPLETED":
        return "bg-purple-500";
      case "ARCHIVED":
        return "bg-gray-400";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{calendar.title}</h2>
            <Badge className={getStatusColor(calendar.status)}>
              {statusLabels[calendar.status] || calendar.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {format(calendar.startDate, "d. MMM yyyy", { locale: nb })} - {format(calendar.endDate, "d. MMM yyyy", { locale: nb })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/c/${calendar.slug}`} target="_blank">
            <Button variant="outline">
              <IconExternalLink className="mr-2 h-4 w-4" />
              Vis offentlig side
            </Button>
          </Link>
          <Link href={`/dashboard/calendars/${calendar.id}/settings`}>
            <Button variant="outline">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Totalt antall leads</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Totalt antall deltakelser</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Produkter lagt til</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Valgte vinnere</CardTitle>
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
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-lg font-semibold">{typeLabels[calendar.type] || calendar.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Antall luker</p>
                  <p className="text-lg font-semibold">{calendar.doorCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Offentlig URL</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Profilfarge</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: calendar.brandColor || "#3B82F6" }}
                    />
                    <p className="text-lg font-semibold">{calendar.brandColor || "#3B82F6"}</p>
                  </div>
                </div>
              </div>

              {calendar.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Beskrivelse</p>
                  <p className="text-muted-foreground">{calendar.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Siste aktivitet</CardTitle>
              <CardDescription>Nyeste deltakelser og vinnervalg</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Aktivitetslogg kommer snart ...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Administrer produkter</CardTitle>
                <CardDescription>Legg til og rediger produkter for hver luke</CardDescription>
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
                <CardDescription>Se alle innsamlede leads og eksporter data</CardDescription>
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
                <CardTitle>Offentlig side</CardTitle>
                <CardDescription>Se kalenderen slik brukerne opplever den</CardDescription>
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
