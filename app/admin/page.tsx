import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconUsers, IconBuildingStore, IconCalendar, IconMail, IconClock } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WorkspaceStatus, CalendarStatus } from "@/app/generated/prisma";

export default async function AdminDashboardPage() {
  // Fetch platform statistics
  const [
    totalUsers,
    totalWorkspaces,
    pendingWorkspaces,
    approvedWorkspaces,
    totalCalendars,
    activeCalendars,
    totalLeads,
    recentUsers,
    recentWorkspaces,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.workspace.count({ where: { status: WorkspaceStatus.PENDING } }),
    prisma.workspace.count({ where: { status: WorkspaceStatus.APPROVED } }),
    prisma.calendar.count(),
    prisma.calendar.count({ where: { status: CalendarStatus.ACTIVE } }),
    prisma.lead.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    }),
    prisma.workspace.findMany({
      take: 5,
      where: { status: WorkspaceStatus.PENDING },
      orderBy: { submittedAt: "desc" },
      include: {
        members: {
          where: { role: "OWNER" },
          include: { user: true },
        },
      },
    }),
  ]);

  const stats = [
    {
      title: "Totale Brukere",
      value: totalUsers,
      icon: IconUsers,
      href: "/admin/users",
      description: "Alle registrerte brukere",
    },
    {
      title: "Workspaces",
      value: `${approvedWorkspaces} / ${totalWorkspaces}`,
      icon: IconBuildingStore,
      href: "/admin/workspaces",
      description: `${pendingWorkspaces} avventer godkjenning`,
      highlight: pendingWorkspaces > 0,
    },
    {
      title: "Kalendere",
      value: `${activeCalendars} / ${totalCalendars}`,
      icon: IconCalendar,
      href: "/admin/analytics",
      description: "Aktive kalendere",
    },
    {
      title: "Totale Leads",
      value: totalLeads,
      icon: IconMail,
      href: "/admin/analytics",
      description: "På tvers av alle kalendere",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Oversikt over plattformen
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className={`transition-colors hover:bg-muted/50 ${stat.highlight ? "border-yellow-500" : ""}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.highlight ? "text-yellow-600 font-medium" : "text-muted-foreground"}`}>
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pending Workspaces Alert */}
      {pendingWorkspaces > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconClock className="h-5 w-5" />
              {pendingWorkspaces} Workspace{pendingWorkspaces > 1 ? "r" : ""} Avventer Godkjenning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {recentWorkspaces.map((workspace) => (
                <div key={workspace.id} className="flex items-center justify-between rounded-lg border bg-background p-3">
                  <div>
                    <p className="font-medium">{workspace.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Eier: {workspace.members[0]?.user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(workspace.submittedAt).toLocaleDateString("no-NO")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild>
              <Link href="/admin/workspaces">
                Se alle ventende workspaces →
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Nylig Registrerte Brukere</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{user.name || "Ingen navn"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("no-NO")}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="mt-4 w-full">
            <Link href="/admin/users">
              Se alle brukere →
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
