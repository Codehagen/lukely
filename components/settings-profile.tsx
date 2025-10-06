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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { IconCheck, IconBrandGoogle } from "@tabler/icons-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
  createdAt: Date;
  accounts: {
    providerId: string;
    createdAt: Date;
  }[];
}

interface SettingsProfileProps {
  user: UserProfile;
}

export default function SettingsProfile({ user }: SettingsProfileProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    image: user.image || "",
  });

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke oppdatere profilen");
      }

      toast.success("Profilen er oppdatert!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Kunne ikke oppdatere profilen");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const hasGoogleAccount = user.accounts.some(
    (account) => account.providerId === "google"
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profilinformasjon</CardTitle>
          <CardDescription>
            Oppdater din personlige informasjon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="flex flex-col gap-6">
            <Field>
              <FieldLabel htmlFor="email">E-postadresse</FieldLabel>
              <div className="flex items-center gap-2">
                <Input id="email" value={user.email} disabled />
                {user.emailVerified && (
                  <Badge variant="default" className="bg-green-500">
                    Verifisert
                  </Badge>
                )}
              </div>
              <FieldDescription>
                E-postadressen din kan ikke endres
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="name">Navn</FieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ditt navn"
              />
              <FieldDescription>
                Dette navnet vises på invitasjoner og meldinger
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="image">Profilbilde-URL</FieldLabel>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://example.com/avatar.jpg"
              />
              <FieldDescription>
                Lenke til ditt profilbilde (valgfritt)
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tilkoblede kontoer</CardTitle>
          <CardDescription>
            Administrer dine tilkoblede kontoer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <IconBrandGoogle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Google</p>
                  <p className="text-sm text-muted-foreground">
                    {hasGoogleAccount
                      ? "Tilkoblet Google-konto"
                      : "Ikke tilkoblet"}
                  </p>
                </div>
              </div>
              <Badge variant={hasGoogleAccount ? "default" : "secondary"}>
                {hasGoogleAccount ? "Aktiv" : "Ikke tilkoblet"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontoinformasjon</CardTitle>
          <CardDescription>Detaljer om kontoen din</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="flex flex-col gap-4">
            <Field>
              <FieldLabel>Medlem siden</FieldLabel>
              <p className="text-sm text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString("nb-NO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Lagrer ...
            </>
          ) : (
            <>
              <IconCheck className="mr-2 h-4 w-4" />
              Lagre endringer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
