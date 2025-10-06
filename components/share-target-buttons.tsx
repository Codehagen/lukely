"use client";

import { Button } from "@/components/ui/button";

interface ShareTargetButtonsProps {
  url: string;
  title: string;
  description?: string;
  size?: "default" | "sm";
}

export function ShareTargetButtons({ url, title, description = "", size = "sm" }: ShareTargetButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const targets = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    },
    {
      label: "X / Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "E-post",
      href: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0D%0A%0D%0A${encodedUrl}`,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {targets.map((target) => (
        <Button asChild key={target.label} variant="secondary" size={size}>
          <a href={target.href} target="_blank" rel="noopener noreferrer">
            {target.label}
          </a>
        </Button>
      ))}
    </div>
  );
}
