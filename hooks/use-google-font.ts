"use client";

import { useEffect } from "react";
import { getGoogleFontUrl, getFontByName } from "@/lib/google-fonts";

/**
 * Hook to dynamically load and apply Google Fonts
 * Injects font stylesheet into document head
 */
export function useGoogleFont(fontName: string | null | undefined) {
  useEffect(() => {
    if (!fontName) return;

    const font = getFontByName(fontName);
    if (!font) return;

    // Check if font is already loaded
    const fontId = `google-font-${fontName.replace(/\s/g, "-").toLowerCase()}`;
    if (document.getElementById(fontId)) return;

    // Create and inject font stylesheet
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href = getGoogleFontUrl(fontName, font.weights);

    // Add to document head
    document.head.appendChild(link);

    // Cleanup function to remove font when unmounted
    return () => {
      const existingLink = document.getElementById(fontId);
      if (existingLink && existingLink.parentNode) {
        existingLink.parentNode.removeChild(existingLink);
      }
    };
  }, [fontName]);
}
