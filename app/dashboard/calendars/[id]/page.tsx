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
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userWithWorkspace = await prisma.user.findUnique({
    where: { id: user.id },
    include: { defaultWorkspace: true },
  });

  if (!userWithWorkspace?.defaultWorkspaceId) {
    return <div>No workspace found</div>;
  }

  const calendar = await getCalendar(params.id, userWithWorkspace.defaultWorkspaceId);

  if (!calendar) {
    notFound();
  }

  const totalEntries = calendar.doors.reduce((sum, door) => sum + door._count.entries, 0);
  const winnersSelected = calendar.doors.filter((door) => door.winner).length;
  const doorsWithProducts = calendar.doors.filter((door) => door.product).length;

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
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{calendar.title}</h1>
            <Badge className={getStatusColor(calendar.status)}>{calendar.status}</Badge>
          </div>
          <p className="text-muted-foreground">
            {format(calendar.startDate, "MMM d, yyyy")} - {format(calendar.endDate, "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/c/${calendar.slug}`} target="_blank">
            <Button variant="outline">
              <IconExternalLink className="mr-2 h-4 w-4" />
              View Public Page
            </Button>
          </Link>
          <Link href={`/dashboard/calendars/${calendar.id}/settings`}>
            <Button variant="outline">
              <IconSettings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Entries</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Products Added</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Winners Selected</CardTitle>
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
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-lg font-semibold">{calendar.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Number of Doors</p>
                  <p className="text-lg font-semibold">{calendar.doorCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Public URL</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Brand Color</p>
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
                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                  <p className="text-muted-foreground">{calendar.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest entries and winner selections</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Activity feed coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Manage Products</CardTitle>
                <CardDescription>Add and edit products for each door</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/calendars/${calendar.id}/doors`}>
                  <Button className="w-full">
                    <IconGift className="mr-2 h-4 w-4" />
                    Go to Doors
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Winners</CardTitle>
                <CardDescription>Pick winners for open doors</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/calendars/${calendar.id}/winners`}>
                  <Button className="w-full">
                    <IconTrophy className="mr-2 h-4 w-4" />
                    Manage Winners
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>View Leads</CardTitle>
                <CardDescription>See all captured leads and export data</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/calendars/${calendar.id}/leads`}>
                  <Button className="w-full">
                    <IconUsers className="mr-2 h-4 w-4" />
                    View Leads
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Public Page</CardTitle>
                <CardDescription>View your calendar as users see it</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/c/${calendar.slug}`} target="_blank">
                  <Button className="w-full" variant="outline">
                    <IconExternalLink className="mr-2 h-4 w-4" />
                    Open Public Page
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
