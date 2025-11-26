"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconKey, IconMail, IconCopy, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface PasswordResetDialogProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export function PasswordResetDialog({
  userId,
  userName,
  userEmail,
}: PasswordResetDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateResetLink = async (sendEmail: boolean) => {
    setIsLoading(true);
    setCopied(false);

    try {
      const response = await fetch("/api/admin/generate-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, sendEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke generere tilbakestillingslenke");
      }

      const data = await response.json();

      if (sendEmail) {
        toast.success(`Tilbakestillingslenke sendt til ${userEmail}`);
        setOpen(false);
      } else {
        // Copy to clipboard
        await navigator.clipboard.writeText(data.url);
        setCopied(true);
        toast.success("Lenke kopiert til utklippstavlen");

        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Error generating password reset:", error);
      toast.error(error instanceof Error ? error.message : "Noe gikk galt");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <IconKey className="mr-2 h-4 w-4" />
          Tilbakestill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tilbakestill passord</DialogTitle>
          <DialogDescription>
            Generer en tilbakestillingslenke for{" "}
            <span className="font-medium text-foreground">
              {userName || userEmail}
            </span>
            . Lenken utløper om 1 time.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <IconMail className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{userName || "Ingen navn"}</p>
              <p className="truncate text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => generateResetLink(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading && !copied ? (
              <Spinner className="mr-2 h-4 w-4" />
            ) : copied ? (
              <IconCheck className="mr-2 h-4 w-4 text-green-600" />
            ) : (
              <IconCopy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Kopiert!" : "Kopier lenke"}
          </Button>
          <Button
            onClick={() => generateResetLink(true)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <Spinner className="mr-2 h-4 w-4" />
            ) : (
              <IconMail className="mr-2 h-4 w-4" />
            )}
            Send e-post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
