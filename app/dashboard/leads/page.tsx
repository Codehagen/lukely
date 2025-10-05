import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/user";
import prisma from "@/lib/prisma";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";

async function getLeads(workspaceId: string) {
  const leads = await prisma.lead.findMany({
    where: {
      calendar: {
        workspaceId,
      },
    },
    include: {
      calendar: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      entries: {
        include: {
          door: {
            select: {
              doorNumber: true,
            },
          },
        },
      },
      wins: {
        include: {
          door: {
            select: {
              doorNumber: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform data for the table
  return leads.map((lead) => ({
    id: lead.id,
    email: lead.email,
    name: lead.name,
    phone: lead.phone,
    createdAt: lead.createdAt,
    calendar: lead.calendar,
    entriesCount: lead.entries.length,
    doorNumbers: lead.entries.map((e) => e.door.doorNumber),
    winsCount: lead.wins.length,
    winningDoors: lead.wins.map((w) => w.door.doorNumber),
  }));
}

export default async function LeadsPage() {
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
        <WorkspaceEmptyState description="Opprett et arbeidsområde for å se leads fra kalenderne dine." />
      </div>
    );
  }

  const leads = await getLeads(userWithWorkspace.defaultWorkspaceId);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
          <p className="text-muted-foreground">
            Alle leads på tvers av kalendere
          </p>
        </div>
      </div>

      <DataTable columns={columns} data={leads} />
    </div>
  );
}
