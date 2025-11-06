"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/admin/data-table-column-header"
import { ImpersonateButton } from "@/components/admin/impersonate-button"
import { IconBuildingStore, IconCalendar } from "@tabler/icons-react"

export type UserData = {
  id: string
  email: string
  name: string | null
  role: string
  emailVerified: boolean
  image: string | null
  createdAt: Date
  workspaceCount: number
  calendarCount: number
  workspaces: {
    id: string
    name: string
    status: string
    role: string
    calendarCount: number
  }[]
}

export const columns: ColumnDef<UserData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bruker" />
    ),
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || user.email}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
              {user.name?.[0] || user.email?.[0] || "?"}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium">{user.name || "Ingen navn"}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rolle" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return (
        <Badge variant={role === "ADMIN" ? "default" : "secondary"}>
          {role === "ADMIN" ? "Admin" : "Bruker"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "emailVerified",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const verified = row.getValue("emailVerified") as boolean
      return (
        <Badge variant={verified ? "secondary" : "outline"} className="text-xs">
          {verified ? "Verifisert" : "Ikke verifisert"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as boolean
      return value.includes(String(rowValue))
    },
  },
  {
    accessorKey: "workspaceCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Workspaces" />
    ),
    cell: ({ row }) => {
      const count = row.getValue("workspaceCount") as number
      return (
        <div className="flex items-center gap-2">
          <IconBuildingStore className="h-4 w-4 text-muted-foreground" />
          <span>{count}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "calendarCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kalendere" />
    ),
    cell: ({ row }) => {
      const count = row.getValue("calendarCount") as number
      return (
        <div className="flex items-center gap-2">
          <IconCalendar className="h-4 w-4 text-muted-foreground" />
          <span>{count}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registrert" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return (
        <span className="text-muted-foreground">
          {new Date(date).toLocaleDateString("no-NO")}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
      if (user.role === "ADMIN") {
        return null
      }
      return (
        <ImpersonateButton
          userId={user.id}
          userName={user.name || user.email}
        />
      )
    },
  },
]
