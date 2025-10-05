import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PublicCalendar from "@/components/public-calendar";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Kalender ikke tilgjengelig</h1>
          <p className="text-muted-foreground">
            Denne kalenderen er ikke aktiv akkurat nå
          </p>
        </div>
      </div>
    );
  }

  return <PublicCalendar calendar={calendar} />;
}
