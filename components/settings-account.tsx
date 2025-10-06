"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export default function SettingsAccount() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDeleteAccount = async () => {
    if (confirmText !== "SLETT KONTOEN MIN") {
      toast.error('Skriv "SLETT KONTOEN MIN" for å bekrefte');
      return;
    }

    if (
      !confirm(
        "Siste advarsel: Dette vil slette kontoen din og alle data permanent. Dette kan ikke angres!"
      )
    )
      return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/settings/account", {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke slette kontoen");
      }

      toast.success("Kontoen din ble slettet");

      // Sign out user
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch (error: any) {
      toast.error(error.message || "Kunne ikke slette kontoen");
      console.error(error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconAlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Faresone</CardTitle>
          </div>
          <CardDescription>
            Permanente handlinger som ikke kan angres
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <h4 className="font-semibold text-destructive mb-2">
              Slett kontoen din
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Når du sletter kontoen din, mister du permanent tilgang til alle
              arbeidsområder, kalendere, leads og data. Denne handlingen kan
              ikke angres.
            </p>

            <div className="space-y-4">
              <Field>
                <FieldLabel htmlFor="confirm-delete">
                  For å bekrefte, skriv{" "}
                  <span className="font-mono font-bold">
                    SLETT KONTOEN MIN
                  </span>
                </FieldLabel>
                <Input
                  id="confirm-delete"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="SLETT KONTOEN MIN"
                  className="font-mono"
                />
              </Field>

              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={
                  isDeleting || confirmText !== "SLETT KONTOEN MIN"
                }
                className="w-full"
              >
                {isDeleting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Sletter konto ...
                  </>
                ) : (
                  <>
                    <IconTrash className="mr-2 h-4 w-4" />
                    Slett kontoen min permanent
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datainnsyn og eksport</CardTitle>
          <CardDescription>
            Be om en kopi av dataene dine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            I henhold til GDPR kan du be om en kopi av alle personlige data vi
            har lagret om deg. Dette inkluderer profilinformasjon,
            arbeidsområder, kalendere og leads du har opprettet.
          </p>
          <Button variant="outline" disabled>
            Be om dataeksport (kommer snart)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
