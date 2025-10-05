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

  const calendar = await getCalendar(params.id, userWithWorkspace.defaultWorkspaceId);

  if (!calendar) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calendar Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage settings for {calendar.title}
        </p>
      </div>

      <CalendarSettings calendar={calendar} />
    </div>
  );
}
