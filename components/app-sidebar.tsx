"use client";

import * as React from "react";
import {
  IconCalendar,
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; image?: string | null } | null;
}) {
  const t = useTranslations('Common.nav');

  const navMain = [
    {
      title: t('dashboard'),
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: t('calendars'),
      url: "/dashboard/calendars",
      icon: IconCalendar,
    },
    {
      title: t('leads'),
      url: "/dashboard/leads",
      icon: IconUsers,
    },
    {
      title: t('analytics'),
      url: "/dashboard/analytics",
      icon: IconChartBar,
    },
  ];

  const navSecondary = [
    {
      title: t('settings'),
      url: "/dashboard/innstillinger",
      icon: IconSettings,
    },
    {
      title: t('getHelp'),
      url: "#",
      icon: IconHelp,
    },
    {
      title: t('search'),
      url: "#",
      icon: IconSearch,
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Lukely</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
