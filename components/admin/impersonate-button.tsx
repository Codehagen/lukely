"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconUserCircle } from "@tabler/icons-react";
import { impersonateUser } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ImpersonateButtonProps {
  userId: string;
  userName: string;
}

export function ImpersonateButton({ userId, userName }: ImpersonateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleImpersonate = async () => {
    setIsLoading(true);
    try {
      const result = await impersonateUser({
        userId,
      });

      if (result.error) {
        throw new Error(result.error.message || "Kunne ikke imitere bruker");
      }

      toast.success(`Du imiterer nå ${userName}`);
      // Redirect to dashboard as the impersonated user
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error impersonating user:", error);
      toast.error(error instanceof Error ? error.message : "Noe gikk galt");
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleImpersonate}
      disabled={isLoading}
    >
      <IconUserCircle className="mr-2 h-4 w-4" />
      {isLoading ? "Imiterer..." : "Imiter"}
    </Button>
  );
}
