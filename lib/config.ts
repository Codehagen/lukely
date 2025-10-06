export const siteConfig = {
  name: "Lukely",
  description: "Få flere leads enkelt med Lukely",
  url: "https://kalender.no", // Update with your production URL
  ogImage: "/og-image.png", // Update with your actual OG image path
  creator: "@codehagen",
  keywords: [
    "lukely",
    "julekalender",
    "kalender",
    "konkurranser",
    "lead magnets",
    "adventskalender",
    "markedsføring",
  ],
};

const rawPublicUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? siteConfig.url
    : process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" &&
      process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : undefined);

const normalizedPublicUrl = rawPublicUrl?.replace(/\/$/, "");

export const HOME_DOMAIN = normalizedPublicUrl ?? "http://localhost:3000";

export const APP_HOSTNAMES = new Set([
  "lukely.no", // Update with your production domain
  "preview.lukely.no", // Update with your preview domain
  "localhost:3000",
  "localhost",
]);
