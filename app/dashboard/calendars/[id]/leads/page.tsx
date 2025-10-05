import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/user";
import LeadsManagement from "@/components/leads-management";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";

async function getCalendarWithLeads(calendarId: string, workspaceId: string) {
  return await prisma.calendar.findFirst({
    where: {
      id: calendarId,
      workspaceId,
    },
    include: {
      leads: {
        include: {
          entries: {
            include: {
              door: {
                include: {
                  product: true,
                },
              },
            },
          },
          wins: {
            include: {
              door: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      doors: {
        include: {
          product: true,
        },
        orderBy: {
          doorNumber: "asc",
        },
      },
    },
  });
}

export default async function LeadsPage({
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
        <WorkspaceEmptyState description="Opprett et arbeidsområde for å administrere leads." />
      </div>
    );
  }

  const calendar = await getCalendarWithLeads(
    id,
    userWithWorkspace.defaultWorkspaceId
  );

  if (!calendar) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lead-administrasjon</h2>
          <p className="text-muted-foreground">
            Se og eksporter leads som er samlet inn fra {calendar.title}
          </p>
        </div>
      </div>

      <LeadsManagement calendar={calendar} />
    </div>
  );
}
