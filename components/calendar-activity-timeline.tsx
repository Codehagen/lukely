import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";
import {
  IconUser,
  IconDoorEnter,
  IconTrophy,
  IconClock,
} from "@tabler/icons-react";

interface Activity {
  type: "entry" | "winner" | "lead";
  timestamp: Date;
  leadName?: string | null;
  leadEmail?: string;
  doorNumber?: number;
  productName?: string | null;
}

async function getRecentActivity(
  calendarId: string
): Promise<Activity[]> {
  // Fetch recent entries
  const recentEntries = await prisma.doorEntry.findMany({
    where: { door: { calendarId } },
    include: {
      lead: true,
      door: true,
    },
    orderBy: { enteredAt: "desc" },
    take: 10,
  });

  // Fetch recent winners
  const recentWinners = await prisma.winner.findMany({
    where: { door: { calendarId } },
    include: {
      lead: true,
      door: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { selectedAt: "desc" },
    take: 10,
  });

  // Fetch recent leads
  const recentLeads = await prisma.lead.findMany({
    where: { calendarId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Combine and format activities
  const activities: Activity[] = [
    ...recentEntries.map((entry) => ({
      type: "entry" as const,
      timestamp: entry.enteredAt,
      leadName: entry.lead.name,
      leadEmail: entry.lead.email,
      doorNumber: entry.door.doorNumber,
    })),
    ...recentWinners.map((winner) => ({
      type: "winner" as const,
      timestamp: winner.selectedAt,
      leadName: winner.lead.name,
      leadEmail: winner.lead.email,
      doorNumber: winner.door.doorNumber,
      productName: winner.door.product?.name,
    })),
    ...recentLeads.map((lead) => ({
      type: "lead" as const,
      timestamp: lead.createdAt,
      leadName: lead.name,
      leadEmail: lead.email,
    })),
  ];

  // Sort by timestamp descending and take top 10
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
}

function getActivityIcon(type: Activity["type"]) {
  switch (type) {
    case "entry":
      return <IconDoorEnter className="h-5 w-5 text-blue-500" />;
    case "winner":
      return <IconTrophy className="h-5 w-5 text-yellow-500" />;
    case "lead":
      return <IconUser className="h-5 w-5 text-green-500" />;
  }
}

function getActivityDescription(activity: Activity) {
  const displayName = activity.leadName || activity.leadEmail || "Ukjent";

  switch (activity.type) {
    case "entry":
      return (
        <>
          <span className="font-medium">{displayName}</span> deltok på luke{" "}
          <span className="font-medium">{activity.doorNumber}</span>
        </>
      );
    case "winner":
      return (
        <>
          <span className="font-medium">{displayName}</span> vant luke{" "}
          <span className="font-medium">{activity.doorNumber}</span>
          {activity.productName && (
            <>
              {" "}
              - <span className="text-muted-foreground">{activity.productName}</span>
            </>
          )}
        </>
      );
    case "lead":
      return (
        <>
          Ny lead: <span className="font-medium">{displayName}</span>
        </>
      );
  }
}

export async function CalendarActivityTimeline({
  calendarId,
}: {
  calendarId: string;
}) {
  const activities = await getRecentActivity(calendarId);

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <IconClock className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          Ingen aktivitet ennå
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Aktivitet vil vises når brukere deltar i kalenderen
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background">
              {getActivityIcon(activity.type)}
            </div>
            {index < activities.length - 1 && (
              <div className="h-full w-px bg-border mt-2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm">
              {getActivityDescription(activity)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(activity.timestamp, {
                addSuffix: true,
                locale: nb,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
