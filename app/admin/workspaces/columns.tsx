"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/admin/data-table-column-header"
import { IconUsers, IconCalendar, IconCheck, IconX } from "@tabler/icons-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export type WorkspaceData = {
  id: string
  name: string
  slug: string
  image: string | null
  status: string
  owner: {
    id: string
    name: string | null
    email: string
  } | null
  memberCount: number
  calendarCount: number
  submittedAt: Date
  approvedAt: Date | null
  approvedBy: {
    id: string
    name: string | null
    email: string | null
  } | null
  rejectedAt: Date | null
  rejectionReason: string | null
  createdAt: Date
  updatedAt: Date
}

function WorkspaceActions({ workspace }: { workspace: WorkspaceData }) {
  const router = useRouter()
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/workspaces/${workspace.id}/approve`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Kunne ikke godkjenne workspace")
      }

      toast.success(`Workspace "${workspace.name}" ble godkjent`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Noe gikk galt")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Vennligst oppgi en grunn for avvisning")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/workspaces/${workspace.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Kunne ikke avvise workspace")
      }

      toast.success(`Workspace "${workspace.name}" ble avvist`)
      setShowRejectDialog(false)
      setRejectionReason("")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Noe gikk galt")
    } finally {
      setIsLoading(false)
    }
  }

  if (workspace.status !== "PENDING") {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={handleApprove}
          disabled={isLoading}
        >
          <IconCheck className="mr-1 h-3 w-3" />
          Godkjenn
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setShowRejectDialog(true)}
          disabled={isLoading}
        >
          <IconX className="mr-1 h-3 w-3" />
          Avvis
        </Button>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avvis Workspace</DialogTitle>
            <DialogDescription>
              Vennligst oppgi en grunn for hvorfor "{workspace.name}" blir avvist.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Avvisningsgrunn</Label>
              <Textarea
                id="reason"
                placeholder="F.eks: Workspace-navnet bryter med retningslinjene..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isLoading}
            >
              Avbryt
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading || !rejectionReason.trim()}
            >
              {isLoading ? "Avviser..." : "Avvis Workspace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary">Avventer</Badge>
    case "APPROVED":
      return <Badge variant="default" className="bg-green-500">Godkjent</Badge>
    case "REJECTED":
      return <Badge variant="destructive">Avvist</Badge>
    case "SUSPENDED":
      return <Badge variant="outline">Suspendert</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export const columns: ColumnDef<WorkspaceData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Workspace" />
    ),
    cell: ({ row }) => {
      const workspace = row.original
      return (
        <div className="flex flex-col">
          <span className="font-medium">{workspace.name}</span>
          <span className="text-sm text-muted-foreground">{workspace.slug}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "owner",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Eier" />
    ),
    cell: ({ row }) => {
      const owner = row.original.owner
      if (!owner) return <span className="text-muted-foreground">Ingen eier</span>
      return (
        <div className="flex flex-col">
          <span className="text-sm">{owner.name || "Ingen navn"}</span>
          <span className="text-xs text-muted-foreground">{owner.email}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return getStatusBadge(status)
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "memberCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Medlemmer" />
    ),
    cell: ({ row }) => {
      const count = row.getValue("memberCount") as number
      return (
        <div className="flex items-center gap-2">
          <IconUsers className="h-4 w-4 text-muted-foreground" />
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
    accessorKey: "submittedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Innsendt" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("submittedAt") as Date
      return (
        <span className="text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString("no-NO")}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const workspace = row.original
      return <WorkspaceActions workspace={workspace} />
    },
  },
]
