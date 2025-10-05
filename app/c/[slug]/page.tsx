import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PublicCalendar from "@/components/public-calendar";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { IconCalendar } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getCalendarBySlug(slug: string) {
  return await prisma.calendar.findUnique({
    where: { slug },
    include: {
      doors: {
        include: {
          product: true,
          winner: {
            include: {
              lead: true,
            },
          },
          _count: {
            select: {
              entries: true,
            },
          },
        },
        orderBy: {
          doorNumber: "asc",
        },
      },
      workspace: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });
}

export default async function PublicCalendarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const calendar = await getCalendarBySlug(slug);

  if (!calendar) {
    notFound();
  }

  // Check if calendar is published
  if (calendar.status === "DRAFT" || calendar.status === "ARCHIVED") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconCalendar className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Kalender ikke tilgjengelig</EmptyTitle>
            <EmptyDescription>
              Denne kalenderen er ikke aktiv akkurat nå. Kontakt arrangøren eller prøv igjen senere.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/">
                Gå til forsiden
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return <PublicCalendar calendar={calendar} />;
}
