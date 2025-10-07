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
import {
  IconFileText,
  IconClock,
  IconCircleCheck,
  IconCheck,
  IconArchive,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface CalendarStatusSelectProps {
  calendarId: string;
  currentStatus: CalendarStatus;
}

const statusLabels: Record<CalendarStatus, string> = {
  DRAFT: "Kladd",
  SCHEDULED: "Planlagt",
  ACTIVE: "Aktiv",
  COMPLETED: "Fullført",
  ARCHIVED: "Arkivert",
};

const statusIcons: Record<CalendarStatus, React.ReactNode> = {
  DRAFT: <IconFileText className="h-4 w-4" />,
  SCHEDULED: <IconClock className="h-4 w-4" />,
  ACTIVE: <IconCircleCheck className="h-4 w-4" />,
  COMPLETED: <IconCheck className="h-4 w-4" />,
  ARCHIVED: <IconArchive className="h-4 w-4" />,
};

export function CalendarStatusSelect({
  calendarId,
  currentStatus,
}: CalendarStatusSelectProps) {
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
        <SelectTrigger size="sm" className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              {statusIcons[status]}
              <span>{statusLabels[status]}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="DRAFT">
            <div className="flex items-center gap-2">
              <IconFileText className="h-4 w-4" />
              <span>Kladd</span>
            </div>
          </SelectItem>
          <SelectItem value="SCHEDULED">
            <div className="flex items-center gap-2">
              <IconClock className="h-4 w-4" />
              <span>Planlagt</span>
            </div>
          </SelectItem>
          <SelectItem value="ACTIVE">
            <div className="flex items-center gap-2">
              <IconCircleCheck className="h-4 w-4" />
              <span>Aktiv</span>
            </div>
          </SelectItem>
          <SelectItem value="COMPLETED">
            <div className="flex items-center gap-2">
              <IconCheck className="h-4 w-4" />
              <span>Fullført</span>
            </div>
          </SelectItem>
          <SelectItem value="ARCHIVED">
            <div className="flex items-center gap-2">
              <IconArchive className="h-4 w-4" />
              <span>Arkivert</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
