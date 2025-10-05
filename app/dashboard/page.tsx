import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/app/actions/user";
import prisma from "@/lib/prisma";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBriefcase, IconCalendar, IconUsers, IconTrophy } from "@tabler/icons-react";

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
      <div className="container py-8">
        <Empty className="min-h-[600px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconBriefcase className="h-8 w-8" />
            </EmptyMedia>
            <EmptyTitle>No Workspace Found</EmptyTitle>
            <EmptyDescription>
              You need to create a workspace before you can start creating calendars and managing giveaways.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/dashboard/workspace/new">
              <Button size="lg">
                <IconBriefcase className="mr-2 h-4 w-4" />
                Create Your Workspace
              </Button>
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const workspace = userWithWorkspace.defaultWorkspace;

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
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user.name || user.email}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Calendars</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Winners</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
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
              <CardTitle>Recent Calendars</CardTitle>
              <CardDescription>Your latest calendar campaigns</CardDescription>
            </div>
            <Link href="/dashboard/calendars">
              <Button variant="outline">View All</Button>
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
                <EmptyTitle className="text-lg">No Calendars Yet</EmptyTitle>
                <EmptyDescription>
                  Get started by creating your first giveaway calendar
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link href="/dashboard/calendars/new">
                  <Button>
                    <IconCalendar className="mr-2 h-4 w-4" />
                    Create Calendar
                  </Button>
                </Link>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="space-y-4">
              {workspace.calendars.map((calendar) => (
                <Link
                  key={calendar.id}
                  href={`/dashboard/calendars/${calendar.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: calendar.brandColor + "20" }}
                      >
                        <IconCalendar
                          className="h-6 w-6"
                          style={{ color: calendar.brandColor || undefined }}
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{calendar.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {calendar._count.leads} leads • {calendar._count.doors} doors
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{calendar.status}</p>
                      <p className="text-xs text-muted-foreground">{calendar.type}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
