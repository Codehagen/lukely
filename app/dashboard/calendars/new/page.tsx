import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/user";
import prisma from "@/lib/prisma";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import NewCalendarForm from "./new-calendar-form";

export default async function NewCalendarPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userWithWorkspace = await prisma.user.findUnique({
    where: { id: user.id },
    include: { defaultWorkspace: true },
  });

  // No workspace - show empty state
  if (!userWithWorkspace?.defaultWorkspaceId) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <WorkspaceEmptyState
          description="Du må opprette et arbeidsområde før du kan lage kalendere."
          actionLabel="Opprett arbeidsområde"
        />
      </div>
    );
  }

  return <NewCalendarForm />;
}
