"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconAlertCircle, IconX } from "@tabler/icons-react";
import { stopImpersonating } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ImpersonationBannerProps {
  impersonatedUserName: string;
}

export function ImpersonationBanner({ impersonatedUserName }: ImpersonationBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStopImpersonation = async () => {
    setIsLoading(true);
    try {
      const { error } = await stopImpersonating();
      if (error) {
        throw new Error(error.message || "Kunne ikke stoppe imitering");
      }
      toast.success("Du er nå tilbake til din egen konto");
      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("Error stopping impersonation:", error);
      toast.error("Kunne ikke stoppe imitering");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 bg-yellow-500 px-4 py-3 text-yellow-950">
      <div className="flex items-center gap-2">
        <IconAlertCircle className="h-5 w-5" />
        <span className="font-medium">
          Du imiterer nå {impersonatedUserName}
        </span>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleStopImpersonation}
        disabled={isLoading}
      >
        <IconX className="mr-2 h-4 w-4" />
        {isLoading ? "Stopper..." : "Stopp Imitering"}
      </Button>
    </div>
  );
}
