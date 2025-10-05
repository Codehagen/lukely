import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/user";
import LeadsManagement from "@/components/leads-management";

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

  const calendar = await getCalendarWithLeads(
    params.id,
    userWithWorkspace.defaultWorkspaceId
  );

  if (!calendar) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Leads Management</h1>
        <p className="text-muted-foreground mt-2">
          View and export leads captured from {calendar.title}
        </p>
      </div>

      <LeadsManagement calendar={calendar} />
    </div>
  );
}
