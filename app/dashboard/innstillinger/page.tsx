import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/user";
import { getUserProfile, getUserNotificationPreferences } from "@/app/actions/settings";
import { getCurrentWorkspace, getUserWorkspaces } from "@/app/actions/workspace-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsProfile from "@/components/settings-profile";
import SettingsWorkspace from "@/components/settings-workspace";
import SettingsTeam from "@/components/settings-team";
import SettingsNotifications from "@/components/settings-notifications";
import SettingsAccount from "@/components/settings-account";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch all data in parallel
  const [userProfile, notificationPreferences, currentWorkspace, userWorkspaces] =
    await Promise.all([
      getUserProfile(),
      getUserNotificationPreferences(),
      getCurrentWorkspace(),
      getUserWorkspaces(),
    ]);

  if (!userProfile) {
    redirect("/sign-in");
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Innstillinger</h2>
          <p className="text-muted-foreground">
            Administrer kontoen din, arbeidsområder og team
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="workspace">Arbeidsområde</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Varsler</TabsTrigger>
          <TabsTrigger value="account">Konto</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <SettingsProfile user={userProfile} />
        </TabsContent>

        <TabsContent value="workspace" className="space-y-6">
          <SettingsWorkspace
            workspace={currentWorkspace}
            userWorkspaces={userWorkspaces}
          />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <SettingsTeam workspace={currentWorkspace} currentUserId={user.id} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <SettingsNotifications
            preferences={
              notificationPreferences || {
                emailCalendarActivity: true,
                emailWinnerSelected: true,
                emailNewLeads: true,
                emailWeeklySummary: true,
              }
            }
          />
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <SettingsAccount />
        </TabsContent>
      </Tabs>
    </div>
  );
}
