import type { Metadata } from "next";
import { siteConfig, HOME_DOMAIN } from "@/lib/config";

const metadataBaseUrl = (() => {
  try {
    return HOME_DOMAIN ? new URL(HOME_DOMAIN) : undefined;
  } catch {
    return undefined;
  }
})();

function toAbsoluteUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (!metadataBaseUrl) return pathOrUrl;
  const normalized = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return new URL(normalized, metadataBaseUrl).toString();
}

export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  icons = "/favicon.ico",
  canonical,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  canonical?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const ogImage = toAbsoluteUrl(image ?? siteConfig.ogImage) ?? siteConfig.ogImage;
  const canonicalUrl = toAbsoluteUrl(canonical);

  return {
    title,
    description,
    keywords: siteConfig.keywords,
    authors: [
      {
        name: siteConfig.name,
      },
    ],
    creator: siteConfig.creator,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: siteConfig.creator,
    },
    icons,
    ...(metadataBaseUrl ? { metadataBase: metadataBaseUrl } : {}),
    alternates: {
      canonical: canonicalUrl,
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

export const truncate = (str: string | null, length: number) => {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length - 3)}...`;
};
