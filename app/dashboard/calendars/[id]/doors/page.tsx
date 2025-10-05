import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/user";
import DoorManagement from "@/components/door-management";

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

  const calendar = await getCalendarWithDoors(
    params.id,
    userWithWorkspace.defaultWorkspaceId
  );

  if (!calendar) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Doors & Products</h1>
        <p className="text-muted-foreground mt-2">
          Configure products for each door in {calendar.title}
        </p>
      </div>

      <DoorManagement calendar={calendar} />
    </div>
  );
}
