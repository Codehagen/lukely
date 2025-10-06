import type { Metadata } from "next";
import { siteConfig, HOME_DOMAIN } from "@/lib/config";

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
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: siteConfig.creator,
    },
    icons,
    metadataBase: new URL(HOME_DOMAIN),
    alternates: {
      canonical: canonical,
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
