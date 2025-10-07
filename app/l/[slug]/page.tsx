import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { PublicLanding, type LandingHighlight } from "@/components/public-landing";
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

async function getLandingCalendarBySlug(slug: string) {
  return await prisma.calendar.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      format: true,
      status: true,
      brandColor: true,
      brandFont: true,
      logo: true,
      landingHeroTitle: true,
      landingHeroSubtitle: true,
      landingHeroDescription: true,
      landingPrimaryActionLabel: true,
      landingPrimaryActionUrl: true,
      landingSecondaryActionLabel: true,
      landingSecondaryActionUrl: true,
      landingHighlights: true,
      landingShowLeadForm: true,
      requireEmail: true,
      requireName: true,
      requirePhone: true,
      termsUrl: true,
      privacyPolicyUrl: true,
      thankYouMessage: true,
      workspace: {
        select: {
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          leads: true,
          views: true,
        },
      },
    },
  });
}

export default async function PublicLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const calendar = await getLandingCalendarBySlug(slug);

  if (!calendar || calendar.format !== "LANDING") {
    notFound();
  }

  if (calendar.status === "DRAFT" || calendar.status === "ARCHIVED") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconCalendar className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Landingssiden er ikke tilgjengelig</EmptyTitle>
            <EmptyDescription>
              Denne kampanjen er ikke aktiv akkurat nå. Kontakt arrangøren eller prøv igjen senere.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/">Til forsiden</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <PublicLanding
      calendar={{
        ...calendar,
        landingHighlights: calendar.landingHighlights as LandingHighlight[] | null,
      }}
    />
  );
}
