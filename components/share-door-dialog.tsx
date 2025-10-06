"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconShare, IconCopy, IconCheck, IconGift, IconFileText } from "@tabler/icons-react";
import { ShareTargetButtons } from "@/components/share-target-buttons";
import { toast } from "sonner";

interface ShareDoorDialogProps {
  url: string;
  title: string;
  description: string;
  doorNumber: number;
}

export function ShareDoorDialog({
  url,
  title,
  description,
  doorNumber,
}: ShareDoorDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Lenke kopiert!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Kunne ikke kopiere lenke");
      console.error("Kunne ikke kopiere lenke", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <IconShare className="h-4 w-4 mr-2" />
          Del
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Del luke {doorNumber}</DialogTitle>
          <DialogDescription>
            Del denne luken med andre. Forhåndsvis innholdet som vil bli delt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* URL Section with integrated copy */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Lenke
            </label>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2.5 transition-colors hover:bg-muted/50">
              <code className="flex-1 truncate text-xs font-mono" title={url}>
                {url}
              </code>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 shrink-0"
                onClick={handleCopy}
              >
                {copied ? (
                  <IconCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <IconCopy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Preview Card */}
          <div className="rounded-lg border bg-gradient-to-br from-muted/30 to-muted/10 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2 shrink-0">
                <IconGift className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight">{title}</p>
              </div>
            </div>
            {description && (
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-muted p-2 shrink-0">
                  <IconFileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Share Buttons */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Del på
            </label>
            <ShareTargetButtons
              url={url}
              title={title}
              description={description}
              size="default"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
