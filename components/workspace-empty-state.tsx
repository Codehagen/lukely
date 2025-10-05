import Link from "next/link";
import { IconBriefcase } from "@tabler/icons-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkspaceEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function WorkspaceEmptyState({
  title = "Fant ingen arbeidsområde",
  description = "Opprett et arbeidsområde før du kan administrere kalendere og leads.",
  actionLabel = "Opprett arbeidsområde",
  actionHref = "/dashboard/workspace/new",
  className,
}: WorkspaceEmptyStateProps) {
  return (
    <Empty className={cn("py-16", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconBriefcase className="h-8 w-8" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href={actionHref}>
          <Button size="lg">
            <IconBriefcase className="mr-2 h-4 w-4" />
            {actionLabel}
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}
