"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarStatus } from "@/app/generated/prisma";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface CalendarStatusSwitcherProps {
  calendarId: string;
  currentStatus: CalendarStatus;
}

const statusLabels: Record<CalendarStatus, string> = {
  DRAFT: "KLADD",
  SCHEDULED: "PLANLAGT",
  ACTIVE: "AKTIV",
  COMPLETED: "FULLFØRT",
  ARCHIVED: "ARKIVERT",
};

const statusColors: Record<CalendarStatus, string> = {
  DRAFT: "bg-gray-500",
  SCHEDULED: "bg-blue-500",
  ACTIVE: "bg-green-500",
  COMPLETED: "bg-purple-500",
  ARCHIVED: "bg-gray-400",
};

export function CalendarStatusSwitcher({
  calendarId,
  currentStatus,
}: CalendarStatusSwitcherProps) {
  const router = useRouter();
  const [status, setStatus] = useState<CalendarStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: CalendarStatus) => {
    setIsUpdating(true);
    const previousStatus = status;

    // Optimistic update
    setStatus(newStatus);

    try {
      const response = await fetch(`/api/calendars/${calendarId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Kunne ikke oppdatere status");

      toast.success(`Status endret til ${statusLabels[newStatus]}`);
      router.refresh();
    } catch (error) {
      // Revert on error
      setStatus(previousStatus);
      toast.error("Kunne ikke oppdatere status");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md z-10">
          <Spinner className="h-4 w-4" />
        </div>
      )}
      <Select
        value={status}
        onValueChange={(value) => handleStatusChange(value as CalendarStatus)}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-auto h-auto p-0 border-0 focus:ring-0">
          <SelectValue asChild>
            <Badge className={statusColors[status]}>
              {statusLabels[status]}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="DRAFT">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span>Kladd</span>
            </div>
          </SelectItem>
          <SelectItem value="SCHEDULED">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Planlagt</span>
            </div>
          </SelectItem>
          <SelectItem value="ACTIVE">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Aktiv</span>
            </div>
          </SelectItem>
          <SelectItem value="COMPLETED">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>Fullført</span>
            </div>
          </SelectItem>
          <SelectItem value="ARCHIVED">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span>Arkivert</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
