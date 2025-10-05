"use client";

import { Button } from "@/components/ui/button";
import { IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";

interface CopyUrlButtonProps {
  url: string;
}

export function CopyUrlButton({ url }: CopyUrlButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast.success("URL kopiert!");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      <IconCopy className="mr-2 h-4 w-4" />
      Kopier URL
    </Button>
  );
}
