"use client";

import { Button } from "@/components/ui/button";
import {
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrandX,
  IconMail
} from "@tabler/icons-react";

interface ShareTargetButtonsProps {
  url: string;
  title: string;
  description?: string;
  shareMessage?: string;
  size?: "default" | "sm";
}

export function ShareTargetButtons({ url, title, description = "", shareMessage, size = "sm" }: ShareTargetButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  // Use shareMessage for Twitter/X and email if provided, otherwise fall back to title
  const twitterText = shareMessage
    ? encodeURIComponent(shareMessage.replace(url, '').trim()) // Remove URL as Twitter adds it
    : encodedTitle;

  const emailBody = shareMessage
    ? encodeURIComponent(shareMessage)
    : `${encodedDescription}%0D%0A%0D%0A${encodedUrl}`;

  const targets = [
    {
      label: "Facebook",
      icon: IconBrandFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-[#1877F2] hover:text-white",
    },
    {
      label: "LinkedIn",
      icon: IconBrandLinkedin,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
      color: "hover:bg-[#0A66C2] hover:text-white",
    },
    {
      label: "X",
      icon: IconBrandX,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${twitterText}`,
      color: "hover:bg-black hover:text-white",
    },
    {
      label: "E-post",
      icon: IconMail,
      href: `mailto:?subject=${encodedTitle}&body=${emailBody}`,
      color: "hover:bg-green-600 hover:text-white",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {targets.map((target) => {
        const Icon = target.icon;
        return (
          <Button
            asChild
            key={target.label}
            variant="outline"
            size={size}
            className={`transition-all ${target.color}`}
          >
            <a href={target.href} target="_blank" rel="noopener noreferrer">
              <Icon className="h-4 w-4 mr-2" />
              {target.label}
            </a>
          </Button>
        );
      })}
    </div>
  );
}
