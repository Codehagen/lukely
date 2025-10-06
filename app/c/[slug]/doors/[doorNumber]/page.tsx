import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { HOME_DOMAIN, siteConfig } from "@/lib/config";
import { constructMetadata, truncate } from "@/lib/constructMetadata";
import { cn } from "@/lib/utils";
import { ShareUrlCopyButton } from "@/components/share-url-copy";

async function getDoorShareData(slug: string, doorNumber: number) {
  const door = await prisma.door.findFirst({
    where: {
      doorNumber,
      calendar: {
        slug,
      },
    },
    include: {
      product: true,
      calendar: {
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          status: true,
          brandColor: true,
          brandFont: true,
          bannerImage: true,
          buttonText: true,
          startDate: true,
          endDate: true,
          workspace: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return door;
}

function resolveAbsoluteUrl(input?: string | null) {
  if (!input) return undefined;
  if (/^https?:\/\//i.test(input)) return input;

  const baseUrl = HOME_DOMAIN?.replace(/\/$/, "") ?? "";
  const normalizedPath = input.startsWith("/") ? input : `/${input}`;
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

function buildDoorShareUrl(slug: string, doorNumber: number) {
  return resolveAbsoluteUrl(`/c/${slug}/doors/${doorNumber}`) ?? `/c/${slug}/doors/${doorNumber}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; doorNumber: string }>;
}): Promise<Metadata> {
  const { slug, doorNumber } = await params;
  const parsedDoorNumber = Number(doorNumber);

  if (!Number.isFinite(parsedDoorNumber)) {
    return constructMetadata({
      title: "Luke ikke funnet",
      description: "Kampanjedøren finnes ikke",
      noIndex: true,
    });
  }

  const door = await getDoorShareData(slug, parsedDoorNumber);

  if (!door || !door.calendar) {
    return constructMetadata({
      title: "Luke ikke funnet",
      description: "Kampanjedøren finnes ikke",
      noIndex: true,
    });
  }

  const productName = door.product?.name ?? door.title ?? `Luke ${door.doorNumber}`;
  const ownerName = door.calendar.workspace?.name
    ? `${door.calendar.workspace.name} • ${door.calendar.title}`
    : door.calendar.title;
  const description = truncate(
    door.product?.description ?? door.description ?? door.calendar.description ?? siteConfig.description,
    160,
  );
  const ogImage = resolveAbsoluteUrl(`/og/c/${slug}/doors/${parsedDoorNumber}`)
    ?? resolveAbsoluteUrl(door.product?.imageUrl ?? door.image ?? door.calendar.bannerImage ?? siteConfig.ogImage);

  return constructMetadata({
    title: `${productName} | ${ownerName}`,
    description: description ?? siteConfig.description,
    image: ogImage,
    canonical: buildDoorShareUrl(slug, parsedDoorNumber),
  });
}

export default async function DoorSharePage({
  params,
}: {
  params: Promise<{ slug: string; doorNumber: string }>;
}) {
  const { slug, doorNumber } = await params;
  const parsedDoorNumber = Number(doorNumber);

  if (!Number.isFinite(parsedDoorNumber)) {
    notFound();
  }

  const door = await getDoorShareData(slug, parsedDoorNumber);

  if (!door || !door.calendar) {
    notFound();
  }

  const shareUrl = buildDoorShareUrl(slug, parsedDoorNumber);
  const doorTitle = door.product?.name ?? door.title ?? `Luke ${door.doorNumber}`;
  const doorDescription = door.product?.description ?? door.description;
  const imageUrl = door.product?.imageUrl ?? door.image ?? door.calendar.bannerImage;
  const absoluteImageUrl = resolveAbsoluteUrl(imageUrl);
  const ogImageUrl = resolveAbsoluteUrl(`/og/c/${door.calendar.slug}/doors/${door.doorNumber}`);

  const currencyFormatter = new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  });

  const doorValue = door.product?.value
    ? currencyFormatter.format(door.product.value)
    : undefined;

  const joinUrl = `/c/${door.calendar.slug}`;
  const isActive = ["ACTIVE", "SCHEDULED", "COMPLETED"].includes(door.calendar.status);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": door.product ? "Product" : "CreativeWork",
    name: doorTitle,
    description: doorDescription ?? door.calendar.description ?? siteConfig.description,
    image: absoluteImageUrl ? [absoluteImageUrl] : ogImageUrl ? [ogImageUrl] : undefined,
    brand: door.calendar.workspace?.name
      ? {
          "@type": "Organization",
          name: door.calendar.workspace.name,
        }
      : undefined,
    offers: door.product?.value
      ? {
          "@type": "Offer",
          priceCurrency: "NOK",
          price: door.product.value,
          availability: "https://schema.org/InStock",
          url: shareUrl,
        }
      : undefined,
    isPartOf: {
      "@type": "Event",
      name: door.calendar.title,
      description: door.calendar.description,
      startDate: door.calendar.startDate?.toISOString(),
      endDate: door.calendar.endDate?.toISOString(),
      url: resolveAbsoluteUrl(`/c/${door.calendar.slug}`),
    },
  };

  return (
    <div
      className="relative flex min-h-screen flex-col bg-background"
      style={door.calendar.brandFont ? { fontFamily: door.calendar.brandFont } : undefined}
    >
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <div className="flex flex-1 flex-col items-center px-6 py-16">
        <div className="flex w-full max-w-3xl flex-col gap-8 text-center">
          <div className="space-y-4">
            <Badge variant="outline" className="mx-auto text-sm">
              Kampanje • Luke {door.doorNumber}
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl" style={{ color: door.calendar.brandColor ?? undefined }}>
              {doorTitle}
            </h1>
            <p className="text-lg text-muted-foreground">
              {doorDescription ?? door.calendar.description ?? siteConfig.description}
            </p>
          </div>

          {imageUrl ? (
            <div className="relative overflow-hidden rounded-2xl border bg-muted/20" style={{ aspectRatio: "16 / 9" }}>
              <Image
                src={imageUrl}
                alt={doorTitle}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 text-left shadow-sm">
              <h2 className="text-lg font-semibold">Om premien</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-foreground">Premie</dt>
                  <dd className="text-muted-foreground">{doorTitle}</dd>
                </div>
                {doorValue ? (
                  <div>
                    <dt className="font-medium text-foreground">Verdi</dt>
                    <dd className="text-muted-foreground">{doorValue}</dd>
                  </div>
                ) : null}
                {doorDescription ? (
                  <div>
                    <dt className="font-medium text-foreground">Detaljer</dt>
                    <dd className="text-muted-foreground">{doorDescription}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="font-medium text-foreground">Arrangør</dt>
                  <dd className="text-muted-foreground">{door.calendar.workspace?.name ?? door.calendar.title}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border bg-card p-6 text-left shadow-sm">
              <h2 className="text-lg font-semibold">Del kampanjen</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Kopier lenken eller del direkte på sosiale medier for å spre kampanjen.
              </p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                  <span className="truncate" title={shareUrl}>
                    {shareUrl}
                  </span>
                  <ShareUrlCopyButton url={shareUrl} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <ShareLinkButton platform="facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} />
                  <ShareLinkButton platform="linkedin" href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(doorTitle)}&summary=${encodeURIComponent(doorDescription ?? "")}`} />
                  <ShareLinkButton platform="twitter" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(doorTitle)}`} />
                  <ShareLinkButton platform="messenger" href={`fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`} />
                  <ShareLinkButton platform="email" href={`mailto:?subject=${encodeURIComponent(doorTitle)}&body=${encodeURIComponent(`${doorDescription ?? ""}\n\n${shareUrl}`)}`} />
                </div>
              </div>
            </div>
          </div>

          {isActive ? (
            <div className="rounded-xl border bg-muted/30 p-6 text-left">
              <h2 className="text-lg font-semibold">Slik deltar du</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Åpne kalenderen, finn luke {door.doorNumber}, og følg instruksjonene for å delta.
              </p>
              <Button asChild className="mt-4" style={{ backgroundColor: door.calendar.brandColor ?? undefined }}>
                <Link href={`${joinUrl}?door=${door.doorNumber}`}>{door.calendar.buttonText ?? "Åpne kalender"}</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-left text-sm text-muted-foreground">
              Denne kampanjen er ikke aktiv akkurat nå. Du kan fortsatt planlegge deling og samle interessenter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type SharePlatform = "facebook" | "linkedin" | "twitter" | "messenger" | "email";

function ShareLinkButton({ platform, href }: { platform: SharePlatform; href: string }) {
  const labelMap: Record<SharePlatform, string> = {
    facebook: "Facebook",
    linkedin: "LinkedIn",
    twitter: "X / Twitter",
    messenger: "Messenger",
    email: "E-post",
  };

  const baseStyles = "inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted";

  return (
    <a
      className={cn(baseStyles)}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {labelMap[platform]}
    </a>
  );
}
