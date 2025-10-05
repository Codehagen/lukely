import { createHash } from "crypto";

export function createVisitorHash(ip: string, userAgent: string): string {
  return createHash("sha256")
    .update(ip + userAgent)
    .digest("hex")
    .substring(0, 16);
}

export function parseUserAgent(userAgent: string | null): {
  deviceType: string;
  browser: string;
  os: string;
} {
  if (!userAgent) {
    return { deviceType: "unknown", browser: "unknown", os: "unknown" };
  }

  const ua = userAgent.toLowerCase();

  // Device type detection
  let deviceType = "desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    deviceType = "tablet";
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    deviceType = "mobile";
  }

  // Browser detection
  let browser = "other";
  if (ua.includes("chrome") && !ua.includes("edg")) browser = "chrome";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "safari";
  else if (ua.includes("firefox")) browser = "firefox";
  else if (ua.includes("edg")) browser = "edge";
  else if (ua.includes("opera") || ua.includes("opr")) browser = "opera";

  // OS detection
  let os = "other";
  if (ua.includes("win")) os = "windows";
  else if (ua.includes("mac")) os = "macos";
  else if (ua.includes("linux")) os = "linux";
  else if (ua.includes("android")) os = "android";
  else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) os = "ios";

  return { deviceType, browser, os };
}

export function categorizeReferrer(referrer: string | null): string {
  if (!referrer || referrer === "") return "direct";

  const ref = referrer.toLowerCase();

  // Social media
  if (ref.includes("facebook") || ref.includes("instagram") || ref.includes("twitter") ||
      ref.includes("linkedin") || ref.includes("tiktok") || ref.includes("youtube")) {
    return "social";
  }

  // Email
  if (ref.includes("mail.") || ref.includes("outlook") || ref.includes("gmail")) {
    return "email";
  }

  // Search engines
  if (ref.includes("google") || ref.includes("bing") || ref.includes("yahoo") || ref.includes("duckduckgo")) {
    return "search";
  }

  return "other";
}

export function getDateRange(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "24h":
      start.setHours(start.getHours() - 24);
      break;
    case "7d":
      start.setDate(start.getDate() - 7);
      break;
    case "30d":
      start.setDate(start.getDate() - 30);
      break;
    case "90d":
      start.setDate(start.getDate() - 90);
      break;
    case "all":
      start.setFullYear(2000); // Far back enough
      break;
    default:
      start.setDate(start.getDate() - 7);
  }

  return { start, end };
}
