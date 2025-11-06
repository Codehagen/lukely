"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/admin/data-table"
import { columns, WorkspaceData } from "./columns"
import { IconClock, IconCheck, IconX, IconBan } from "@tabler/icons-react"

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const response = await fetch("/api/admin/workspaces")
        if (!response.ok) throw new Error("Failed to fetch workspaces")
        const data = await response.json()
        setWorkspaces(data)
      } catch (error) {
        console.error("Error fetching workspaces:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkspaces()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workspaces</h2>
          <p className="text-muted-foreground">
            Administrer og godkjenn workspaces
          </p>
        </div>
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground">Laster...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Workspaces</h2>
        <p className="text-muted-foreground">
          Administrer og godkjenn workspaces
        </p>
      </div>

      <DataTable
        columns={columns}
        data={workspaces}
        searchKey="name"
        searchPlaceholder="Søk etter workspace-navn..."
        filterConfig={[
          {
            columnId: "status",
            title: "Status",
            options: [
              {
                label: "Avventer",
                value: "PENDING",
                icon: IconClock,
              },
              {
                label: "Godkjent",
                value: "APPROVED",
                icon: IconCheck,
              },
              {
                label: "Avvist",
                value: "REJECTED",
                icon: IconX,
              },
              {
                label: "Suspendert",
                value: "SUSPENDED",
                icon: IconBan,
              },
            ],
          },
        ]}
      />
    </div>
  )
}
