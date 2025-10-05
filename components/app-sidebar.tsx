"use client"

import * as React from "react"
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
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashbord",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Kalendere",
      url: "/dashboard/calendars",
      icon: IconCalendar,
    },
    {
      title: "Analyser",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Prosjekter",
      url: "#",
      icon: IconFolder,
    },
    {
      title: "Team",
      url: "#",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Innsamling",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Aktive forslag",
          url: "#",
        },
        {
          title: "Arkivert",
          url: "#",
        },
      ],
    },
    {
      title: "Forslag",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Aktive forslag",
          url: "#",
        },
        {
          title: "Arkivert",
          url: "#",
        },
      ],
    },
    {
      title: "Prompt-maler",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Aktive forslag",
          url: "#",
        },
        {
          title: "Arkivert",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Innstillinger",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Få hjelp",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Søk",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Databibliotek",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Rapporter",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Teksthjelp",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; image?: string | null } | null
}) {
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
                <span className="text-base font-semibold">Acme AS</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  )
}
