"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { IconCheck, IconTrash, IconPlus, IconBriefcase } from "@tabler/icons-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  currentUserRole: string | null;
  members: any[];
  _count: {
    calendars: number;
  };
}

interface WorkspaceOption {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  role: string;
  _count: {
    members: number;
    calendars: number;
  };
}

interface SettingsWorkspaceProps {
  workspace: Workspace | null;
  userWorkspaces: WorkspaceOption[];
}

export default function SettingsWorkspace({
  workspace,
  userWorkspaces,
}: SettingsWorkspaceProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: workspace?.name || "",
    slug: workspace?.slug || "",
    image: workspace?.image || "",
  });

  const canEdit =
    workspace?.currentUserRole === "OWNER" ||
    workspace?.currentUserRole === "ADMIN";
  const canDelete = workspace?.currentUserRole === "OWNER";

  const handleUpdate = async () => {
    if (!workspace) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke oppdatere arbeidsområdet");
      }

      toast.success("Arbeidsområdet er oppdatert!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Kunne ikke oppdatere arbeidsområdet");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!workspace) return;

    if (
      !confirm(
        "Er du sikker på at du vil slette dette arbeidsområdet? Dette sletter alle kalendere, leads og data permanent."
      )
    )
      return;

    if (
      !confirm(
        "Siste advarsel: Dette kan ikke angres. Alle data vil bli slettet permanent."
      )
    )
      return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke slette arbeidsområdet");
      }

      toast.success("Arbeidsområdet ble slettet!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Kunne ikke slette arbeidsområdet");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!workspace) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Intet arbeidsområde</CardTitle>
          <CardDescription>
            Du har ikke et standardarbeidsområde
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <IconBriefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Opprett et arbeidsområde for å komme i gang
            </p>
            <Link href="/dashboard/workspace/new">
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                Opprett arbeidsområde
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Arbeidsområdeinnstillinger</CardTitle>
          <CardDescription>
            Administrer ditt nåværende arbeidsområde
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="flex flex-col gap-6">
            <Field>
              <FieldLabel htmlFor="workspace-name">
                Navn på arbeidsområde
              </FieldLabel>
              <Input
                id="workspace-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={!canEdit}
              />
              <FieldDescription>
                Navnet på arbeidsområdet ditt
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="workspace-slug">Slug</FieldLabel>
              <FieldContent>
                <Input
                  id="workspace-slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  disabled={!canEdit}
                />
                <FieldDescription>
                  Brukes i URL-er og må være unik. Å endre dette kan bryte
                  eksisterende lenker.
                </FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="workspace-image">Logo-URL</FieldLabel>
              <Input
                id="workspace-image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://example.com/logo.png"
                disabled={!canEdit}
              />
              <FieldDescription>
                Valgfri logo for arbeidsområdet
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Din rolle</FieldLabel>
              <div className="flex items-center gap-2">
                <Badge>{workspace.currentUserRole}</Badge>
              </div>
            </Field>

            <Field>
              <FieldLabel>Statistikk</FieldLabel>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Medlemmer</p>
                  <p className="text-2xl font-bold">{workspace.members.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kalendere</p>
                  <p className="text-2xl font-bold">
                    {workspace._count.calendars}
                  </p>
                </div>
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {userWorkspaces.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Alle dine arbeidsområder</CardTitle>
            <CardDescription>
              Du er medlem av {userWorkspaces.length} arbeidsområder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userWorkspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{ws.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {ws._count.members} medlemmer · {ws._count.calendars}{" "}
                      kalendere
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{ws.role}</Badge>
                    {workspace?.id === ws.id && (
                      <Badge variant="default">Standard</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          {canDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isUpdating}
            >
              {isDeleting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Sletter ...
                </>
              ) : (
                <>
                  <IconTrash className="mr-2 h-4 w-4" />
                  Slett arbeidsområde
                </>
              )}
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/workspace/new">
            <Button variant="outline">
              <IconPlus className="mr-2 h-4 w-4" />
              Nytt arbeidsområde
            </Button>
          </Link>
          {canEdit && (
            <Button onClick={handleUpdate} disabled={isUpdating || isDeleting}>
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
          )}
        </div>
      </div>
    </div>
  );
}
