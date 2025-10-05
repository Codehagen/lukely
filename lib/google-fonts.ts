/**
 * Google Fonts configuration and utilities
 * Curated list of popular fonts for UI/branding
 */

export interface GoogleFont {
  name: string;
  category: "sans-serif" | "serif" | "display" | "monospace";
  weights: number[];
  description: string;
}

export const GOOGLE_FONTS: GoogleFont[] = [
  {
    name: "Inter",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
    description: "Modern, clean, designed for UI/UX",
  },
  {
    name: "Roboto",
    category: "sans-serif",
    weights: [400, 500, 700],
    description: "Google's signature font, versatile",
  },
  {
    name: "Montserrat",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
    description: "Bold geometric, modern urban feel",
  },
  {
    name: "Poppins",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
    description: "Rounded edges, fresh and friendly",
  },
  {
    name: "Open Sans",
    category: "sans-serif",
    weights: [400, 600, 700],
    description: "Clean, readable, professional",
  },
  {
    name: "Lato",
    category: "sans-serif",
    weights: [400, 700],
    description: "Warm, friendly, corporate-friendly",
  },
  {
    name: "Plus Jakarta Sans",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
    description: "Modern geometric, tech-forward",
  },
  {
    name: "DM Sans",
    category: "sans-serif",
    weights: [400, 500, 700],
    description: "Low-contrast, excellent readability",
  },
  {
    name: "Source Sans Pro",
    category: "sans-serif",
    weights: [400, 600, 700],
    description: "Adobe's workhorse, clean and neutral",
  },
  {
    name: "Nunito",
    category: "sans-serif",
    weights: [400, 600, 700],
    description: "Rounded, approachable, friendly",
  },
  {
    name: "Work Sans",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
    description: "Optimized for screen, versatile",
  },
  {
    name: "Raleway",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
    description: "Elegant, sophisticated, display-friendly",
  },
  {
    name: "Playfair Display",
    category: "serif",
    weights: [400, 600, 700],
    description: "Classic, elegant, high-contrast",
  },
  {
    name: "Merriweather",
    category: "serif",
    weights: [400, 700],
    description: "Readable serif, traditional feel",
  },
  {
    name: "Bebas Neue",
    category: "display",
    weights: [400],
    description: "Bold, uppercase, attention-grabbing",
  },
];

/**
 * Get Google Fonts CSS URL for a specific font
 */
export function getGoogleFontUrl(fontName: string, weights: number[] = [400, 600, 700]): string {
  const family = fontName.replace(/ /g, "+");
  const weightString = weights.join(";");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${weightString}&display=swap`;
}

/**
 * Get font object by name
 */
export function getFontByName(name: string): GoogleFont | undefined {
  return GOOGLE_FONTS.find((font) => font.name === name);
}

/**
 * Get CSS variable value for font family
 */
export function getFontFamilyValue(fontName: string): string {
  const font = getFontByName(fontName);
  if (!font) return "Inter, sans-serif";

  return `"${fontName}", ${font.category}`;
}
