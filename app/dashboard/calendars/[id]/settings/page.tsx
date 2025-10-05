import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/user";
import CalendarSettings from "@/components/calendar-settings";

async function getCalendar(calendarId: string, workspaceId: string) {
  return await prisma.calendar.findFirst({
    where: {
      id: calendarId,
      workspaceId,
    },
  });
}

export default async function SettingsPage({
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
    return <div>Fant ingen arbeidsområde</div>;
  }

  const calendar = await getCalendar(id, userWithWorkspace.defaultWorkspaceId);

  if (!calendar) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kalenderinnstillinger</h2>
          <p className="text-muted-foreground">
            Administrer innstillinger for {calendar.title}
          </p>
        </div>
      </div>

      <CalendarSettings calendar={calendar} />
    </div>
  );
}
