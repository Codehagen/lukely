import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "../actions/user";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Check if this session is impersonated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isImpersonated = Boolean(session?.session?.impersonatedBy);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user as any} />
      <SidebarInset>
        {isImpersonated && (
          <ImpersonationBanner
            impersonatedUserName={user?.name || user?.email || "ukjent bruker"}
          />
        )}
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
