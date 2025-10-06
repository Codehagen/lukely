import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/app/actions/user";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { IconCalendar, IconUsers, IconTrophy } from "@tabler/icons-react";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userWithWorkspace = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      defaultWorkspace: {
        include: {
          calendars: {
            include: {
              _count: {
                select: {
                  leads: true,
                  doors: true,
                },
              },
            },
            take: 5,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  // No workspace - show empty state
  if (!userWithWorkspace?.defaultWorkspaceId) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <WorkspaceEmptyState
          description="Du må opprette et arbeidsområde før du kan lage kalendere og administrere konkurranser."
          actionLabel="Opprett arbeidsområdet ditt"
        />
      </div>
    );
  }

  const workspace = userWithWorkspace.defaultWorkspace;

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

  // Get total stats
  const totalLeads = await prisma.lead.count({
    where: {
      calendar: {
        workspaceId: workspace.id,
      },
    },
  });

  const totalWinners = await prisma.winner.count({
    where: {
      door: {
        calendar: {
          workspaceId: workspace.id,
        },
      },
    },
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashbord</h2>
          <p className="text-muted-foreground">
            Velkommen tilbake, {user.name || user.email}!
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Totalt antall kalendere</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">{workspace.calendars.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Totalt antall leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconUsers className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">{totalLeads}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Totalt antall vinnere</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconTrophy className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">{totalWinners}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktive kampanjer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">
                {workspace.calendars.filter(c => c.status === "ACTIVE").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calendars */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Siste kalendere</CardTitle>
              <CardDescription>Dine nyeste kalenderkampanjer</CardDescription>
            </div>
            <Link href="/dashboard/calendars">
              <Button variant="outline">Se alle</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {workspace.calendars.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconCalendar className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle className="text-lg">Ingen kalendere ennå</EmptyTitle>
                <EmptyDescription>
                  Kom i gang ved å lage din første konkurransekalender
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
            <ItemGroup className="gap-3">
              {workspace.calendars.map((calendar) => {
                const statusLabel = statusLabels[calendar.status] || calendar.status;
                const typeLabel = typeLabels[calendar.type] || calendar.type;

                return (
                  <Item
                    key={calendar.id}
                    asChild
                    variant="outline"
                    className="hover:border-primary transition-colors"
                  >
                    <Link href={`/dashboard/calendars/${calendar.id}`}>
                      <ItemMedia
                        className="w-12 h-12 rounded-lg"
                        style={{
                          backgroundColor: `${calendar.brandColor || "#3B82F6"}20`,
                        }}
                      >
                        <IconCalendar
                          className="h-6 w-6"
                          style={{ color: calendar.brandColor || undefined }}
                        />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle className="font-semibold">
                          {calendar.title}
                        </ItemTitle>
                        <ItemDescription>
                          {calendar._count.leads} leads • {calendar._count.doors} luker
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions className="ml-auto flex flex-col items-end gap-0.5 text-right">
                        <span className="text-sm font-medium">{statusLabel}</span>
                        <span className="text-xs text-muted-foreground">{typeLabel}</span>
                      </ItemActions>
                    </Link>
                  </Item>
                );
              })}
            </ItemGroup>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
