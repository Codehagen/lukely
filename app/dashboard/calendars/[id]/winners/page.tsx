import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/user";
import WinnerSelection from "@/components/winner-selection";

async function getCalendarWithWinners(calendarId: string, workspaceId: string) {
  return await prisma.calendar.findFirst({
    where: {
      id: calendarId,
      workspaceId,
    },
    include: {
      doors: {
        include: {
          product: true,
          winner: {
            include: {
              lead: true,
            },
          },
          entries: {
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
        orderBy: {
          doorNumber: "asc",
        },
      },
    },
  });
}

export default async function WinnersPage({
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

  const calendar = await getCalendarWithWinners(
    params.id,
    userWithWorkspace.defaultWorkspaceId
  );

  if (!calendar) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Winner Selection</h1>
        <p className="text-muted-foreground mt-2">
          Select and manage winners for {calendar.title}
        </p>
      </div>

      <WinnerSelection calendar={calendar} />
    </div>
  );
}
