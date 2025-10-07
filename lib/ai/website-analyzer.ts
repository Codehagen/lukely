import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export const WebsiteAnalysisSchema = z.object({
  businessName: z.string().describe("The name of the business/brand"),
  brandColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .describe("Primary brand color as hex code (e.g., #FF5733)"),
  secondaryColor: z
    .union([z.string().regex(/^#[0-9A-F]{6}$/i), z.null()])
    .optional()
    .describe("Secondary brand color as hex code"),
  description: z
    .string()
    .describe("Business description or tagline in Norwegian"),
  suggestedCalendarTitle: z
    .string()
    .describe("Suggested calendar title in Norwegian (e.g., 'Julekalender 2024')"),
  detectedFont: z
    .union([z.string(), z.null()])
    .optional()
    .describe("Primary font family detected (e.g., 'Inter', 'Roboto')"),
});

export type WebsiteAnalysis = z.infer<typeof WebsiteAnalysisSchema>;

/**
 * Normalizes a URL to ensure it has the correct format
 * Handles various input formats:
 * - "codenord.no" -> "https://codenord.no"
 * - "www.codenord.no" -> "https://www.codenord.no"
 * - "http://codenord.no" -> "https://codenord.no"
 * - "https://codenord.no/" -> "https://codenord.no"
 */
function normalizeUrl(input: string): string {
  let url = input.trim();

  // Remove trailing slashes
  url = url.replace(/\/+$/, "");

  // Add protocol if missing
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  // Upgrade HTTP to HTTPS
  if (url.startsWith("http://")) {
    url = url.replace("http://", "https://");
  }

  // Parse URL to validate and extract base
  try {
    const parsedUrl = new URL(url);

    // Return base URL (protocol + hostname)
    return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
  } catch (error) {
    throw new Error("Ugyldig URL-format. Vennligst skriv inn et gyldig domene (f.eks. codenord.no)");
  }
}

/**
 * Fetches and analyzes a website to extract branding information using AI
 * @param url - The URL of the website to analyze
 * @returns Structured branding information
 */
export async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
  // Normalize URL (add protocol, remove trailing slashes, etc.)
  const normalizedUrl = normalizeUrl(url);

  // Fetch website content
  let htmlContent: string;
  let pageTitle: string = "";
  let metaDescription: string = "";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LukelyBot/1.0; +https://lukely.no)",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    htmlContent = await response.text();

    // Basic HTML parsing to extract metadata
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    pageTitle = titleMatch?.[1]?.trim() || "";

    const metaDescMatch = htmlContent.match(
      /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
    );
    metaDescription = metaDescMatch?.[1]?.trim() || "";
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Forespørselen tok for lang tid. Prøv igjen senere.");
      }
      throw new Error(`Kunne ikke hente nettsiden: ${error.message}`);
    }
    throw new Error("Kunne ikke hente nettsiden. Vennligst sjekk URL-en.");
  }

  // Extract visible text content (simple approach - remove HTML tags)
  const textContent = htmlContent
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 3000); // Limit to first 3000 chars

  // Extract inline styles for color analysis
  const styleMatches = htmlContent.match(/style=["'][^"']*["']/gi) || [];
  const inlineStyles = styleMatches.join(" ");

  const prompt = `
Analyser denne nettsiden og ekstraher merkevareinfo:

URL: ${normalizedUrl}
Side tittel: ${pageTitle}
Meta beskrivelse: ${metaDescription}

Tekstinnhold (utdrag):
${textContent.substring(0, 1500)}

Inline stiler (utdrag for fargeanalyse):
${inlineStyles.substring(0, 500)}

VIKTIGE REGLER:
- businessName: Bedriftens/merkets navn (IKKE nettstedsdomene)
- brandColor: Finn primærfargen fra logo, overskrifter eller dominerende farger (HEX format)
- secondaryColor: Sekundærfarge hvis synlig (valgfritt)
- description: Lag en kort bedriftsbeskrivelse på norsk basert på innholdet (1-2 setninger)
- suggestedCalendarTitle: Foreslå en kalendertittel på norsk (f.eks. "[Bedriftsnavn] Julekalender 2024")
- detectedFont: Font-familie fra CSS hvis synlig, ellers null

Hvis nettstedet ikke er på norsk, oversett beskrivelse og tittel til norsk.
Hvis du ikke finner en tydelig primærfarge, bruk en standard blå: #3B82F6
`.trim();

  try {
    const result = await generateObject({
      model: openai("gpt-4o"),
      system:
        "Du er en ekspert på å analysere nettsider og ekstrahere merkevareinfo. Du returnerer alltid strukturert data med norske beskrivelser. Du er nøyaktig med fargevalg og identifisering av merkevarelementer.",
      prompt,
      schema: WebsiteAnalysisSchema,
    });

    return result.object;
  } catch (error) {
    console.error("Error analyzing website with AI:", error);
    throw new Error("Kunne ikke analysere nettsiden med AI. Prøv igjen.");
  }
}
