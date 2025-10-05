import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/user";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconCalendar,
  IconChartBar,
  IconEye,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getWorkspaceAnalytics(workspaceId: string) {
  // Get all calendars for this workspace
  const calendars = await prisma.calendar.findMany({
    where: { workspaceId },
    include: {
      _count: {
        select: {
          leads: true,
          views: true,
          doors: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate totals
  const totalLeads = calendars.reduce((sum, cal) => sum + cal._count.leads, 0);
  const totalViews = calendars.reduce((sum, cal) => sum + cal._count.views, 0);
  const totalCalendars = calendars.length;

  return {
    calendars,
    totals: {
      totalLeads,
      totalViews,
      totalCalendars,
    },
  };
}

export default async function AnalyticsPage() {
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

  const { calendars, totals } = await getWorkspaceAnalytics(
    userWithWorkspace.defaultWorkspaceId
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analyser</h2>
        <p className="text-muted-foreground">
          Oversikt over alle kampanjer og deres ytelse
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totalt antall kalendere
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">{totals.totalCalendars}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totale visninger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconEye className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">{totals.totalViews}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totale leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconUsers className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">{totals.totalLeads}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendars List */}
      <Card>
        <CardHeader>
          <CardTitle>Kalender-ytelse</CardTitle>
          <CardDescription>
            Detaljert oversikt over hver kalender
          </CardDescription>
        </CardHeader>
        <CardContent>
          {calendars.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <IconChartBar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ingen kalendere funnet</p>
              <p className="text-sm mt-2">
                Opprett din første kalender for å se analyser
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {calendars.map((calendar) => (
                <div
                  key={calendar.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{calendar.title}</h3>
                    <div className="flex gap-6 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <IconEye className="h-4 w-4" />
                        <span>{calendar._count.views} visninger</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconUsers className="h-4 w-4" />
                        <span>{calendar._count.leads} leads</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconCalendar className="h-4 w-4" />
                        <span>{calendar._count.doors} luker</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/dashboard/calendars/${calendar.id}/analytics`}>
                    <Button variant="outline" size="sm">
                      <IconChartBar className="mr-2 h-4 w-4" />
                      Se analyser
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
