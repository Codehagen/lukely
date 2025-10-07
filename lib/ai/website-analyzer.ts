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
  logoUrl: z
    .union([z.string().url(), z.null()])
    .optional()
    .describe("URL to the company logo (og:image, favicon, or main logo)"),
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
 * Fetches and analyzes a website to extract branding information using AI
 * @param url - The URL of the website to analyze
 * @returns Structured branding information
 */
export async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw new Error("Ugyldig URL-format. Vennligst bruk en fullstendig URL (f.eks. https://example.com)");
  }

  // Fetch website content
  let htmlContent: string;
  let pageTitle: string = "";
  let metaDescription: string = "";
  let ogImage: string = "";
  let faviconUrl: string = "";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
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

    const ogImageMatch = htmlContent.match(
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i
    );
    ogImage = ogImageMatch?.[1]?.trim() || "";

    const faviconMatch = htmlContent.match(
      /<link\s+[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i
    );
    faviconUrl = faviconMatch?.[1]?.trim() || "";

    // Make favicon URL absolute if relative
    if (faviconUrl && !faviconUrl.startsWith("http")) {
      const urlObj = new URL(url);
      faviconUrl = faviconUrl.startsWith("/")
        ? `${urlObj.protocol}//${urlObj.host}${faviconUrl}`
        : `${urlObj.protocol}//${urlObj.host}/${faviconUrl}`;
    }

    // Make og:image URL absolute if relative
    if (ogImage && !ogImage.startsWith("http")) {
      const urlObj = new URL(url);
      ogImage = ogImage.startsWith("/")
        ? `${urlObj.protocol}//${urlObj.host}${ogImage}`
        : `${urlObj.protocol}//${urlObj.host}/${ogImage}`;
    }
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

URL: ${url}
Side tittel: ${pageTitle}
Meta beskrivelse: ${metaDescription}
OG:Image: ${ogImage || "Ikke funnet"}
Favicon: ${faviconUrl || "Ikke funnet"}

Tekstinnhold (utdrag):
${textContent.substring(0, 1500)}

Inline stiler (utdrag for fargeanalyse):
${inlineStyles.substring(0, 500)}

VIKTIGE REGLER:
- businessName: Bedriftens/merkets navn (IKKE nettstedsdomene)
- brandColor: Finn primærfargen fra logo, overskrifter eller dominerende farger (HEX format)
- secondaryColor: Sekundærfarge hvis synlig (valgfritt)
- logoUrl: Bruk OG:Image hvis tilgjengelig, ellers favicon, ellers null
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
