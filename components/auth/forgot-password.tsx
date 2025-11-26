"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { IconInnerShadowTop, IconCheck } from "@tabler/icons-react";
import { buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";

export default function ForgotPasswordAuth() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });

      if (error) {
        toast.error(error.message ?? "Kunne ikke sende tilbakestillingslenke");
      } else {
        setSubmitted(true);
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
            {submitted ? (
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <IconCheck className="h-6 w-6 text-green-600" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Sjekk e-posten din
                </h1>
                <p className="text-sm text-muted-foreground">
                  Vi har sendt en lenke for å tilbakestille passordet til{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  Lenken utløper om 1 time.
                </p>
                <Link
                  href="/sign-in"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                >
                  Tilbake til innlogging
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-col space-y-2 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Glemt passordet?
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Skriv inn e-postadressen din, så sender vi deg en lenke for
                    å tilbakestille passordet.
                  </p>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">E-post</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="navn@example.com"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <Spinner className="size-4" />
                      ) : (
                        "Send tilbakestillingslenke"
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
