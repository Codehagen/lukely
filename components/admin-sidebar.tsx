"use client";

import * as React from "react";
import {
  IconActivity,
  IconBuildingStore,
  IconLayoutDashboard,
  IconUsers,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";

const adminNavigation = [
  {
    title: "Oversikt",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: IconLayoutDashboard,
      },
      {
        title: "Analyser",
        href: "/admin/analytics",
        icon: IconActivity,
      },
    ],
  },
  {
    title: "Administrasjon",
    items: [
      {
        title: "Brukere",
        href: "/admin/users",
        icon: IconUsers,
      },
      {
        title: "Workspaces",
        href: "/admin/workspaces",
        icon: IconBuildingStore,
      },
    ],
  },
];

interface AdminSidebarProps {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
  } | null;
}

export function AdminSidebar({ user, ...props }: AdminSidebarProps & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <IconLayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Panel</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Lukely Platform
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {adminNavigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard">
                  <div className="flex items-center gap-2">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || user.email || "User"}
                        className="size-6 rounded-full"
                      />
                    ) : (
                      <div className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {user.name?.[0] || user.email?.[0] || "?"}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name || "Admin"}</span>
                      <span className="text-xs text-muted-foreground">
                        Tilbake til dashboard
                      </span>
                    </div>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
