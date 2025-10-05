import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/user";
import DoorManagement from "@/components/door-management";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";

async function getCalendarWithDoors(calendarId: string, workspaceId: string) {
  return await prisma.calendar.findFirst({
    where: {
      id: calendarId,
      workspaceId,
    },
    include: {
      doors: {
        include: {
          product: true,
          _count: {
            select: {
              entries: true,
            },
          },
        },
        orderBy: {
          doorNumber: "asc",
        },
      },
    },
  });
}

export default async function DoorsPage({
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
        <WorkspaceEmptyState description="Opprett et arbeidsområde for å administrere luker og produkter." />
      </div>
    );
  }

  const calendar = await getCalendarWithDoors(
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
          <h2 className="text-3xl font-bold tracking-tight">Administrer luker og produkter</h2>
          <p className="text-muted-foreground">
            Konfigurer produkter for hver luke i {calendar.title}
          </p>
        </div>
      </div>

      <DoorManagement calendar={calendar} />
    </div>
  );
}
