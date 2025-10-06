import { BellRing, Gift, MailCheck } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export const NotificationEmpty = ({ className }: { className?: string }) => {
  return (
    <div
      aria-hidden
      className={cn("w-48", className)}
    >
      <Empty className="h-48 w-full border border-foreground/15 bg-card/80 p-4 shadow-md">
        <EmptyHeader className="gap-3">
          <EmptyMedia
            variant="icon"
            className="bg-primary/10 text-primary size-12 rounded-2xl"
          >
            <BellRing className="size-6" />
          </EmptyMedia>
          <EmptyTitle className="text-base font-semibold">
            Automatiske varsler
          </EmptyTitle>
          <EmptyDescription className="text-xs text-muted-foreground">
            Aktiver e-post og SMS-påminnelser for å få deltakerne tilbake til
            kalenderen hver dag.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="mt-2 w-full space-y-2">
          <div className="bg-muted/50 text-foreground/80 flex items-center gap-2 rounded-lg px-3 py-2 text-xs shadow">
            <MailCheck className="size-4 text-primary" />
            <span>E-postpåminnelse kl. 08:00</span>
          </div>
          <div className="bg-muted/60 text-foreground/80 flex items-center gap-2 rounded-lg px-3 py-2 text-xs shadow">
            <BellRing className="size-4 text-primary" />
            <span>SMS-varsling til VIP-segment</span>
          </div>
          <div className="bg-muted/70 text-foreground/80 flex items-center gap-2 rounded-lg px-3 py-2 text-xs shadow">
            <Gift className="size-4 text-primary" />
            <span>Premievinnere trekkes automatisk</span>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
};
