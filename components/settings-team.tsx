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
  FieldSeparator,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconUserPlus,
  IconTrash,
  IconMail,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  role: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  invitedBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Workspace {
  id: string;
  name: string;
  currentUserRole: string | null;
  members: Member[];
  invitations: Invitation[];
}

interface SettingsTeamProps {
  workspace: Workspace | null;
  currentUserId: string;
}

export default function SettingsTeam({
  workspace,
  currentUserId,
}: SettingsTeamProps) {
  const router = useRouter();
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("MEMBER");
  const [processingMemberId, setProcessingMemberId] = useState<string | null>(
    null
  );
  const [processingInviteId, setProcessingInviteId] = useState<string | null>(
    null
  );

  if (!workspace) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingen team</CardTitle>
          <CardDescription>
            Opprett et arbeidsområde for å administrere teammedlemmer
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const canInvite =
    workspace.currentUserRole === "OWNER" ||
    workspace.currentUserRole === "ADMIN";
  const canManageRoles = workspace.currentUserRole === "OWNER";

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error("Skriv inn en e-postadresse");
      return;
    }

    setIsInviting(true);
    try {
      const response = await fetch(
        `/api/workspaces/${workspace.id}/members`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: inviteEmail,
            role: inviteRole,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke sende invitasjon");
      }

      toast.success(`Invitasjon sendt til ${inviteEmail}!`);
      setInviteEmail("");
      setInviteRole("MEMBER");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Kunne ikke sende invitasjon");
      console.error(error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (
      !confirm(
        `Er du sikker på at du vil fjerne ${memberName} fra arbeidsområdet?`
      )
    )
      return;

    setProcessingMemberId(memberId);
    try {
      const response = await fetch(
        `/api/workspaces/${workspace.id}/members/${memberId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke fjerne medlem");
      }

      toast.success("Medlemmet ble fjernet!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Kunne ikke fjerne medlem");
      console.error(error);
    } finally {
      setProcessingMemberId(null);
    }
  };

  const handleUpdateRole = async (
    memberId: string,
    newRole: string,
    memberName: string
  ) => {
    setProcessingMemberId(memberId);
    try {
      const response = await fetch(
        `/api/workspaces/${workspace.id}/members/${memberId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke oppdatere rolle");
      }

      toast.success(`${memberName} sin rolle er oppdatert!`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Kunne ikke oppdatere rolle");
      console.error(error);
    } finally {
      setProcessingMemberId(null);
    }
  };

  const handleCancelInvitation = async (
    token: string,
    email: string
  ) => {
    if (
      !confirm(`Er du sikker på at du vil avbryte invitasjonen til ${email}?`)
    )
      return;

    setProcessingInviteId(token);
    try {
      const response = await fetch(
        `/api/workspaces/invitations/${token}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke avbryte invitasjon");
      }

      toast.success("Invitasjonen ble avbrutt!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Kunne ikke avbryte invitasjon");
      console.error(error);
    } finally {
      setProcessingInviteId(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-500";
      case "ADMIN":
        return "bg-blue-500";
      case "MEMBER":
        return "bg-green-500";
      case "VIEWER":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {canInvite && (
        <Card>
          <CardHeader>
            <CardTitle>Inviter medlemmer</CardTitle>
            <CardDescription>
              Send en invitasjon til å bli med i arbeidsområdet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="invite-email">E-postadresse</FieldLabel>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="bruker@example.com"
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="invite-role">Rolle</FieldLabel>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {canManageRoles && (
                      <SelectItem value="OWNER">Eier</SelectItem>
                    )}
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="MEMBER">Medlem</SelectItem>
                    <SelectItem value="VIEWER">Seer</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  OWNER kan alt · ADMIN kan administrere medlemmer · MEMBER kan
                  opprette kalendere · VIEWER kan bare se
                </FieldDescription>
              </Field>

              <Button
                onClick={handleInvite}
                disabled={isInviting || !inviteEmail}
                className="w-fit"
              >
                {isInviting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Sender ...
                  </>
                ) : (
                  <>
                    <IconUserPlus className="mr-2 h-4 w-4" />
                    Send invitasjon
                  </>
                )}
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      {workspace.invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ventende invitasjoner</CardTitle>
            <CardDescription>
              {workspace.invitations.length} ventende invitasjon
              {workspace.invitations.length !== 1 ? "er" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workspace.invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <IconMail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invitert av {invitation.invitedBy.name || invitation.invitedBy.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(invitation.role)}>
                      {invitation.role}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCancelInvitation(invitation.token, invitation.email)
                      }
                      disabled={processingInviteId === invitation.token}
                    >
                      {processingInviteId === invitation.token ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <IconX className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Teammedlemmer</CardTitle>
          <CardDescription>
            {workspace.members.length} medlem
            {workspace.members.length !== 1 ? "mer" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workspace.members.map((member, index) => {
              const isCurrentUser = member.user.id === currentUserId;
              const canRemove =
                canManageRoles &&
                !isCurrentUser &&
                member.role !== "OWNER";
              const canChangeRole = canManageRoles && !isCurrentUser;

              return (
                <div key={member.id}>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium">
                        {member.user.name?.[0]?.toUpperCase() ||
                          member.user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.user.name || member.user.email}
                          {isCurrentUser && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              (Du)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canChangeRole ? (
                        <Select
                          value={member.role}
                          onValueChange={(newRole) =>
                            handleUpdateRole(
                              member.id,
                              newRole,
                              member.user.name || member.user.email
                            )
                          }
                          disabled={processingMemberId === member.id}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OWNER">Eier</SelectItem>
                            <SelectItem value="ADMIN">Administrator</SelectItem>
                            <SelectItem value="MEMBER">Medlem</SelectItem>
                            <SelectItem value="VIEWER">Seer</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role}
                        </Badge>
                      )}
                      {canRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveMember(
                              member.id,
                              member.user.name || member.user.email
                            )
                          }
                          disabled={processingMemberId === member.id}
                        >
                          {processingMemberId === member.id ? (
                            <Spinner className="h-4 w-4" />
                          ) : (
                            <IconTrash className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  {index < workspace.members.length - 1 && (
                    <FieldSeparator className="my-3" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
