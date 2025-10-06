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

export const HOME_DOMAIN =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? siteConfig.url
    : process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";

export const APP_HOSTNAMES = new Set([
  "lukely.no", // Update with your production domain
  "preview.lukely.no", // Update with your preview domain
  "localhost:3000",
  "localhost",
]);
