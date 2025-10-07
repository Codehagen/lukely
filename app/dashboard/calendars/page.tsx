import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/user";
import { redirect } from "next/navigation";
import { IconCalendar, IconUsers, IconGift } from "@tabler/icons-react";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

async function getCalendars(workspaceId: string) {
  return await prisma.calendar.findMany({
    where: {
      workspaceId,
    },
    include: {
      _count: {
        select: {
          leads: true,
          doors: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function CalendarsPage() {
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
        <WorkspaceEmptyState description="Opprett et arbeidsområde før du kan lage kalendere." />
      </div>
    );
  }

  const calendars = await getCalendars(userWithWorkspace.defaultWorkspaceId);

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
    LANDING_PAGE: "Landingside",
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
          <h2 className="text-3xl font-bold tracking-tight">Kalendere</h2>
          <p className="text-muted-foreground">
            Administrer konkurransekalenderne dine og følg resultatene
          </p>
        </div>
        <Link href="/dashboard/calendars/new">
          <Button>
            <IconCalendar className="mr-2 h-4 w-4" />
            Opprett kalender
          </Button>
        </Link>
      </div>

      {calendars.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconCalendar className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Ingen kalendere ennå</EmptyTitle>
            <EmptyDescription>
              Kom i gang ved å lage din første konkurransekalender.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/dashboard/calendars/new">
              <Button>
                <IconCalendar className="mr-2 h-4 w-4" />
                Opprett kalender
              </Button>
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {calendars.map((calendar) => (
            <Link key={calendar.id} href={`/dashboard/calendars/${calendar.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{calendar.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">
                        {calendar.description || "Ingen beskrivelse"}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(calendar.status)}>
                      {statusLabels[calendar.status] || calendar.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium">{typeLabels[calendar.type] || calendar.type}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Datoer</span>
                      <span className="font-medium">
                        {format(calendar.startDate, "d. MMM", { locale: nb })} - {format(calendar.endDate, "d. MMM yyyy", { locale: nb })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <IconGift className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-2xl font-bold">{calendar._count.doors}</p>
                          <p className="text-xs text-muted-foreground">Luker</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconUsers className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-2xl font-bold">{calendar._count.leads}</p>
                          <p className="text-xs text-muted-foreground">Leads</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
