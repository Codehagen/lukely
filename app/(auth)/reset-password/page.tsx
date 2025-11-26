import ResetPasswordAuth from "@/components/auth/reset-password";
import { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Tilbakestill passord - Lukely",
  description: "Opprett et nytt passord for kontoen din på Lukely",
};

function ResetPasswordFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordAuth />
    </Suspense>
  );
}
