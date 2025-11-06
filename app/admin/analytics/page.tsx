import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkspaceStatus, CalendarStatus } from "@/app/generated/prisma";

export default async function AdminAnalyticsPage() {
  // Get date ranges
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch analytics data
  const [
    totalUsers,
    usersLast7Days,
    usersLast30Days,
    totalWorkspaces,
    approvedWorkspaces,
    pendingWorkspaces,
    totalCalendars,
    activeCalendars,
    totalLeads,
    leadsLast7Days,
    leadsLast30Days,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: last7Days } } }),
    prisma.user.count({ where: { createdAt: { gte: last30Days } } }),
    prisma.workspace.count(),
    prisma.workspace.count({ where: { status: WorkspaceStatus.APPROVED } }),
    prisma.workspace.count({ where: { status: WorkspaceStatus.PENDING } }),
    prisma.calendar.count(),
    prisma.calendar.count({ where: { status: CalendarStatus.ACTIVE } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: last7Days } } }),
    prisma.lead.count({ where: { createdAt: { gte: last30Days } } }),
  ]);

  const metrics = [
    {
      section: "Brukere",
      items: [
        { label: "Totale brukere", value: totalUsers },
        { label: "Nye siste 7 dager", value: usersLast7Days },
        { label: "Nye siste 30 dager", value: usersLast30Days },
        {
          label: "Vekst (30d)",
          value: totalUsers > 0 ? `${Math.round((usersLast30Days / totalUsers) * 100)}%` : "N/A",
        },
      ],
    },
    {
      section: "Workspaces",
      items: [
        { label: "Totale workspaces", value: totalWorkspaces },
        { label: "Godkjente", value: approvedWorkspaces },
        { label: "Avventer godkjenning", value: pendingWorkspaces, highlight: pendingWorkspaces > 0 },
        {
          label: "Godkjenningsrate",
          value: totalWorkspaces > 0 ? `${Math.round((approvedWorkspaces / totalWorkspaces) * 100)}%` : "N/A",
        },
      ],
    },
    {
      section: "Kalendere",
      items: [
        { label: "Totale kalendere", value: totalCalendars },
        { label: "Aktive kalendere", value: activeCalendars },
        {
          label: "Gjennomsnitt per workspace",
          value: approvedWorkspaces > 0 ? (totalCalendars / approvedWorkspaces).toFixed(1) : "0",
        },
        {
          label: "Aktiveringsrate",
          value: totalCalendars > 0 ? `${Math.round((activeCalendars / totalCalendars) * 100)}%` : "N/A",
        },
      ],
    },
    {
      section: "Leads",
      items: [
        { label: "Totale leads", value: totalLeads },
        { label: "Nye siste 7 dager", value: leadsLast7Days },
        { label: "Nye siste 30 dager", value: leadsLast30Days },
        {
          label: "Gjennomsnitt per kalender",
          value: activeCalendars > 0 ? (totalLeads / activeCalendars).toFixed(1) : "0",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analyser</h2>
        <p className="text-muted-foreground">
          Plattformstatistikk og vekstanalyse
        </p>
      </div>

      {metrics.map((section) => (
        <div key={section.section} className="space-y-3">
          <h3 className="text-lg font-semibold">{section.section}</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {section.items.map((item) => (
              <Card key={item.label} className={item.highlight ? "border-yellow-500" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${item.highlight ? "text-yellow-600" : ""}`}>
                    {item.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
