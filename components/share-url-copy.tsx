"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

interface ShareUrlCopyButtonProps {
  url: string;
}

export function ShareUrlCopyButton({ url }: ShareUrlCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const label = copied ? "Kopiert!" : "Kopier lenke";

  return (
    <Button
      type="button"
      size="sm"
      className="ml-auto"
      variant="secondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          console.error("Kunne ikke kopiere lenke", error);
        }
      }}
    >
      {label}
    </Button>
  );
}
