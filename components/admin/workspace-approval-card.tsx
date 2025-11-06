"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IconCheck, IconX, IconCalendar, IconUsers } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type WorkspaceWithDetails = {
  id: string;
  name: string;
  slug: string;
  status: string;
  submittedAt: Date;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  members: Array<{
    user: {
      id: string;
      email: string | null;
      name: string | null;
    };
  }>;
  calendars: Array<{ id: string }>;
  approvedBy?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  _count: {
    members: number;
    calendars: number;
  };
};

interface WorkspaceApprovalCardProps {
  workspace: WorkspaceWithDetails;
}

export function WorkspaceApprovalCard({ workspace }: WorkspaceApprovalCardProps) {
  const router = useRouter();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const owner = workspace.members[0]?.user;

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/workspaces/${workspace.id}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Kunne ikke godkjenne workspace");
      }

      toast.success(`Workspace "${workspace.name}" ble godkjent`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Noe gikk galt");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Vennligst oppgi en grunn for avvisning");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/workspaces/${workspace.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Kunne ikke avvise workspace");
      }

      toast.success(`Workspace "${workspace.name}" ble avvist`);
      setShowRejectDialog(false);
      setRejectionReason("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Noe gikk galt");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Avventer</Badge>;
      case "APPROVED":
        return <Badge variant="default" className="bg-green-500">Godkjent</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Avvist</Badge>;
      case "SUSPENDED":
        return <Badge variant="outline">Suspendert</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {workspace.name}
                {getStatusBadge(workspace.status)}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Slug: {workspace.slug}
              </p>
            </div>
            {workspace.status === "PENDING" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleApprove}
                  disabled={isLoading}
                >
                  <IconCheck className="mr-2 h-4 w-4" />
                  Godkjenn
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isLoading}
                >
                  <IconX className="mr-2 h-4 w-4" />
                  Avvis
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Eier</p>
              <p className="text-sm text-muted-foreground">
                {owner?.name || "Ingen navn"}
              </p>
              <p className="text-sm text-muted-foreground">{owner?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Innsendt</p>
              <p className="text-sm text-muted-foreground">
                {new Date(workspace.submittedAt).toLocaleString("no-NO")}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconUsers className="h-4 w-4" />
              {workspace._count.members} medlemmer
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconCalendar className="h-4 w-4" />
              {workspace._count.calendars} kalendere
            </div>
          </div>

          {workspace.status === "APPROVED" && workspace.approvedAt && (
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
              <p className="text-sm">
                <span className="font-medium">Godkjent:</span>{" "}
                {new Date(workspace.approvedAt).toLocaleString("no-NO")}
                {workspace.approvedBy && (
                  <>
                    {" "}av {workspace.approvedBy.name || workspace.approvedBy.email}
                  </>
                )}
              </p>
            </div>
          )}

          {workspace.status === "REJECTED" && workspace.rejectionReason && (
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
              <p className="text-sm font-medium">Avvisningsgrunn:</p>
              <p className="text-sm">{workspace.rejectionReason}</p>
              {workspace.rejectedAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Avvist: {new Date(workspace.rejectedAt).toLocaleString("no-NO")}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avvis Workspace</DialogTitle>
            <DialogDescription>
              Vennligst oppgi en grunn for hvorfor "{workspace.name}" blir avvist.
              Denne meldingen vil bli sendt til workspace-eieren.
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
  );
}
