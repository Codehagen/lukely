"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconTrophy,
  IconUsers,
  IconSparkles,
  IconCheck,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface Lead {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  createdAt: Date;
}

interface LandingWinner {
  id: string;
  isPublic: boolean;
  selectedAt: Date;
  lead: Lead;
}

interface Calendar {
  id: string;
  title: string;
  leads: Lead[];
  landingWinners: LandingWinner[];
}

export default function LandingWinnerSelection({ calendar }: { calendar: Calendar }) {
  const router = useRouter();
  const [isSelecting, setIsSelecting] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [manualLeadId, setManualLeadId] = useState<string | undefined>(undefined);

  const currentWinner = calendar.landingWinners[0] ?? null;
  const totalLeads = calendar.leads.length;
  const recentLeads = useMemo(() => calendar.leads.slice(0, 10), [calendar.leads]);

  const handleSelectWinner = async () => {
    if (totalLeads === 0) {
      toast.error("Ingen registrerte leads enda");
      return;
    }

    setIsSelecting(true);

    try {
      const response = await fetch(`/api/calendars/${calendar.id}/landing-winner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: manualLeadId || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Kunne ikke velge vinner");
      }

      const winner = await response.json();
      toast.success(`Vinner valgt: ${winner.lead.email}! 🎉`);
      setManualLeadId(undefined);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Kunne ikke velge vinner");
    } finally {
      setIsSelecting(false);
    }
  };

  const handleToggleVisibility = async (isPublic: boolean) => {
    if (!currentWinner) return;
    setIsUpdatingVisibility(true);
    try {
      const response = await fetch(`/api/calendars/${calendar.id}/landing-winner`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Kunne ikke oppdatere vinner");
      }

      toast.success(
        isPublic ? "Vinner annonsert offentlig" : "Vinner skjult fra offentlig landingsside"
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Kunne ikke oppdatere visningen av vinner");
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleRemoveWinner = async () => {
    setIsRemoving(true);
    try {
      const response = await fetch(`/api/calendars/${calendar.id}/landing-winner`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Kunne ikke fjerne vinner");
      }

      toast.success("Vinner fjernet. Du kan nå trekke på nytt.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Kunne ikke fjerne vinner");
    } finally {
      setIsRemoving(false);
    }
  };

  if (totalLeads === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconUsers className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>Ingen leads ennå</EmptyTitle>
          <EmptyDescription>
            Samle leads før du kan trekke en vinner for landingssiden.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totalt antall leads
            </CardTitle>
            <CardDescription>Alle kvalifiserte deltakere</CardDescription>
          </div>
          <IconUsers className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalLeads}</p>
        </CardContent>
      </Card>

      {currentWinner ? (
        <Card className="border-yellow-500/60 bg-yellow-50 dark:bg-yellow-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrophy className="h-5 w-5 text-yellow-600" />
              Vinner valgt
            </CardTitle>
            <CardDescription>
              Trekk dato:{" "}
              {format(new Date(currentWinner.selectedAt), "d. MMM yyyy 'kl.' HH:mm", {
                locale: nb,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">
                  {currentWinner.lead.name || currentWinner.lead.email}
                </p>
                <p className="text-sm text-muted-foreground">{currentWinner.lead.email}</p>
                {currentWinner.lead.phone && (
                  <p className="text-sm text-muted-foreground">{currentWinner.lead.phone}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveWinner}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Fjerner...
                    </>
                  ) : (
                    <>
                      <IconTrash className="mr-2 h-4 w-4" />
                      Fjern vinner
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t pt-4">
              <div>
                <p className="text-xs font-medium uppercase text-yellow-700 dark:text-yellow-200">
                  Vis på offentlig landingsside
                </p>
                <p className="text-xs text-muted-foreground">
                  Slå på for å vise navnet på vinneren offentlig
                </p>
              </div>
              <Switch
                checked={currentWinner.isPublic}
                onCheckedChange={handleToggleVisibility}
                disabled={isUpdatingVisibility}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSparkles className="h-5 w-5 text-primary" />
              Trekk vinner
            </CardTitle>
            <CardDescription>
              Velg tilfeldig eller spesifikk lead som vinner av landingskampanjen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Velg spesifikk lead (valgfritt)</p>
              <Select
                value={manualLeadId || "random"}
                onValueChange={(value) => {
                  setManualLeadId(value === "random" ? undefined : value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tilfeldig lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Tilfeldig lead</SelectItem>
                  {calendar.leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name || lead.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSelectWinner} disabled={isSelecting}>
              {isSelecting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Trekker vinner...
                </>
              ) : (
                <>
                  <IconTrophy className="mr-2 h-4 w-4" />
                  Trekk vinner
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Nyeste leads</CardTitle>
          <CardDescription>De 10 siste kvalifiserte deltakerne</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen leads ennå</p>
          ) : (
            <div className="divide-y">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{lead.name || lead.email}</p>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                  </div>
                  <Badge variant="outline">
                    Registrert {format(new Date(lead.createdAt), "d. MMM", { locale: nb })}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
