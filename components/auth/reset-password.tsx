"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { IconInnerShadowTop, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordAuth() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Ugyldig eller manglende tilbakestillingslenke.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passordene er ikke like");
      return;
    }

    if (password.length < 8) {
      toast.error("Passordet må være minst 8 tegn");
      return;
    }

    if (!token) {
      toast.error("Ugyldig tilbakestillingslenke");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        toast.error(error.message ?? "Kunne ikke tilbakestille passordet");
      } else {
        setSuccess(true);
        toast.success("Passordet er oppdatert!");
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      }
    } catch {
      toast.error("Noe gikk galt. Vennligst prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/sign-in"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 top-4 md:right-8 md:top-8"
          )}
        >
          Logg inn
        </Link>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <IconInnerShadowTop className="mr-2 h-6 w-6" />
            Lukely
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Lukely hjalp oss å generere over 2000 kvalifiserte leads
                i julesesongen. Den interaktive kalenderen skapte engasjement
                vi aldri har sett før.&rdquo;
              </p>
              <footer className="text-sm">— Mari Olsen, Nordic Retail AS</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            {error ? (
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <IconAlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Ugyldig lenke
                </h1>
                <p className="text-sm text-muted-foreground">
                  {error}
                </p>
                <Link
                  href="/forgot-password"
                  className={cn(buttonVariants({ variant: "default" }), "w-full")}
                >
                  Be om ny lenke
                </Link>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <IconCheck className="h-6 w-6 text-green-600" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Passord oppdatert!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Passordet ditt har blitt tilbakestilt. Du blir nå sendt til
                  innloggingssiden.
                </p>
                <Spinner className="size-4" />
              </div>
            ) : (
              <>
                <div className="flex flex-col space-y-2 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Opprett nytt passord
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Skriv inn ditt nye passord nedenfor.
                  </p>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="password">Nytt passord</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        disabled={loading}
                        minLength={8}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">Bekreft passord</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        value={confirmPassword}
                        disabled={loading}
                        minLength={8}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <Spinner className="size-4" />
                      ) : (
                        "Oppdater passord"
                      )}
                    </Button>
                  </div>
                </form>
                <p className="px-8 text-center text-sm text-muted-foreground">
                  Husker du passordet?{" "}
                  <Link
                    href="/sign-in"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Logg inn
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
