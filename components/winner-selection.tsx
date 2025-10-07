"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  IconTrophy,
  IconDice,
  IconLock,
  IconCheck,
  IconCalendar,
  IconUsers,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

interface Lead {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
}

interface Winner {
  id: string;
  selectedAt: Date;
  notified: boolean;
  lead: Lead;
  isPublic: boolean;
}

interface DoorEntry {
  id: string;
  enteredAt: Date;
  quizScore: number | null;
  quizPassed: boolean;
  eligibleForWinner: boolean;
  lead: Lead;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  value: number | null;
}

interface Door {
  id: string;
  doorNumber: number;
  openDate: Date;
  enableQuiz: boolean;
  quizPassingScore: number;
  product: Product | null;
  winner: Winner | null;
  entries: DoorEntry[];
  _count: {
    entries: number;
  };
}

interface Calendar {
  id: string;
  title: string;
  doors: Door[];
}

export default function WinnerSelection({ calendar }: { calendar: Calendar }) {
  const router = useRouter();
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [updatingWinnerDoorId, setUpdatingWinnerDoorId] = useState<string | null>(null);
  const hasDoors = calendar.doors.length > 0;

  const selectRandomWinner = async (door: Door) => {
    if (door.entries.length === 0) {
      toast.error("Ingen deltakelser for denne luken");
      return;
    }

    setIsSelecting(true);

    try {
      const response = await fetch(`/api/doors/${door.id}/winner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Kunne ikke velge vinner");

      const winner = await response.json();
      toast.success(`Vinner valgt: ${winner.lead.email}! 🎉`);
      setSelectedDoor(null);
      router.refresh();
    } catch (error) {
      toast.error("Kunne ikke velge vinner");
      console.error(error);
    } finally {
      setIsSelecting(false);
    }
  };

  const updateWinnerVisibility = async (door: Door, isPublic: boolean) => {
    if (!door.winner) return;

    setUpdatingWinnerDoorId(door.id);
    try {
      const response = await fetch(`/api/doors/${door.id}/winner`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Kunne ikke oppdatere vinner");
      }

      toast.success(
        isPublic ? "Vinner annonsert på offentlig kalender" : "Vinner skjult fra offentlig kalender"
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Kunne ikke oppdatere visningen av vinner");
    } finally {
      setUpdatingWinnerDoorId(null);
    }
  };

  const isDoorOpen = (door: Door) => {
    return new Date() >= new Date(door.openDate);
  };

  return (
    <div>
      {hasDoors ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {calendar.doors.map((door) => (
            <Card
              key={door.id}
              className={`${!isDoorOpen(door) ? "opacity-60" : ""} ${
                door.winner ? "border-yellow-400" : ""
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Luke {door.doorNumber}
                  </CardTitle>
                  {door.winner ? (
                    <Badge className="bg-yellow-500">
                      <IconTrophy className="h-3 w-3 mr-1" />
                      Vinner
                    </Badge>
                  ) : isDoorOpen(door) ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      Åpen
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50">
                      <IconLock className="h-3 w-3 mr-1" />
                      Låst
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(door.openDate), "d. MMM yyyy", {
                    locale: nb,
                  })}
                </p>
              </CardHeader>
              <CardContent>
                {door.product && (
                  <div className="mb-4">
                    <p className="font-medium">{door.product.name}</p>
                    {door.product.value && (
                      <p className="text-sm text-muted-foreground">
                        kr {door.product.value}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Totalt antall deltakelser
                    </span>
                    <span className="font-semibold">{door._count.entries}</span>
                  </div>

                  {door.winner ? (
                    <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <IconTrophy className="h-4 w-4 text-yellow-600" />
                        <p className="font-semibold text-sm">Vinner valgt</p>
                      </div>
                      <p className="text-sm">
                        {door.winner.lead.name || door.winner.lead.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(
                          new Date(door.winner.selectedAt),
                          "d. MMM yyyy 'kl.' HH:mm",
                          { locale: nb }
                        )}
                      </p>
                      {door.winner.notified && (
                        <div className="flex items-center gap-1 mt-2">
                          <IconCheck className="h-3 w-3 text-green-600" />
                          <p className="text-xs text-green-600">Varslet</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-3 mt-3 border-t border-yellow-200 pt-3">
                        <div>
                          <p className="text-xs font-medium uppercase text-yellow-700 dark:text-yellow-300">
                            Vis på offentlig kalender
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Slå på for å annonsere vinneren på nettsiden
                          </p>
                        </div>
                        <Switch
                          checked={door.winner.isPublic}
                          onCheckedChange={(checked) => updateWinnerVisibility(door, checked)}
                          disabled={updatingWinnerDoorId === door.id}
                          aria-label="Vis vinner på offentlig kalender"
                        />
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => setSelectedDoor(door)}
                      disabled={!isDoorOpen(door) || door._count.entries === 0}
                    >
                      <IconDice className="h-4 w-4 mr-2" />
                      Velg vinner
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconCalendar className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Ingen luker opprettet</EmptyTitle>
            <EmptyDescription>
              Opprett luker og produkter før du kan trekke vinnere.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* Winner Selection Dialog */}
      <Dialog open={!!selectedDoor} onOpenChange={() => setSelectedDoor(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedDoor && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Velg vinner for luke {selectedDoor.doorNumber}
                </DialogTitle>
                <DialogDescription>
                  {selectedDoor._count.entries} deltakelser
                  {selectedDoor.product &&
                    ` • Premie: ${selectedDoor.product.name}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Quiz Info */}
                {selectedDoor.enableQuiz && (
                  <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Quiz aktivert</h4>
                    <p className="text-sm text-muted-foreground">
                      Denne luken har quiz med {selectedDoor.quizPassingScore}%
                      krav. Kun deltakere med riktige svar er kvalifiserte.
                    </p>
                    <div className="flex gap-4 mt-3 text-sm">
                      <div>
                        <span className="font-medium">Kvalifiserte:</span>{" "}
                        {
                          selectedDoor.entries.filter(
                            (e) => e.eligibleForWinner
                          ).length
                        }
                      </div>
                      <div>
                        <span className="font-medium">Ikke kvalifiserte:</span>{" "}
                        {
                          selectedDoor.entries.filter(
                            (e) => !e.eligibleForWinner
                          ).length
                        }
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Tilfeldig trekning</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedDoor.enableQuiz
                      ? "Trekker vinner blant kvalifiserte deltakere (med riktige quiz-svar)"
                      : "Trekker tilfeldig vinner blant alle deltakelser"}
                  </p>
                  <Button
                    onClick={() => selectRandomWinner(selectedDoor)}
                    disabled={
                      isSelecting ||
                      selectedDoor.entries.filter((e) => e.eligibleForWinner)
                        .length === 0
                    }
                    className="w-full"
                  >
                    {isSelecting ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Velger ...
                      </>
                    ) : (
                      <>
                        <IconDice className="h-4 w-4 mr-2" />
                        Trekk tilfeldig vinner
                      </>
                    )}
                  </Button>
                  {selectedDoor.entries.filter((e) => e.eligibleForWinner)
                    .length === 0 && (
                    <p className="text-sm text-destructive mt-2">
                      Ingen kvalifiserte deltakere ennå
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Alle deltakelser</h4>
                  {selectedDoor.entries.length === 0 ? (
                    <Empty className="py-10">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <IconUsers className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>Ingen deltakelser ennå</EmptyTitle>
                        <EmptyDescription>
                          Del kalenderen for å samle deltakerne før du trekker
                          en vinner.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                      <ItemGroup className="gap-1 p-2">
                        {selectedDoor.entries.map((entry) => {
                          const participant =
                            entry.lead.name || entry.lead.email;
                          return (
                            <Item
                              key={entry.id}
                              variant="outline"
                              size="sm"
                              className="hover:bg-muted/60"
                            >
                              <ItemMedia className="w-9 h-9 rounded-full bg-muted text-xs font-semibold">
                                {participant.charAt(0)?.toUpperCase()}
                              </ItemMedia>
                              <ItemContent>
                                <ItemTitle className="text-sm flex items-center gap-2">
                                  {participant}
                                  {!entry.eligibleForWinner && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      Ikke kvalifisert
                                    </Badge>
                                  )}
                                  {entry.quizScore !== null && (
                                    <Badge
                                      variant={
                                        entry.quizPassed
                                          ? "default"
                                          : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {Math.round(entry.quizScore)}%
                                    </Badge>
                                  )}
                                </ItemTitle>
                                {entry.lead.name && (
                                  <ItemDescription>
                                    {entry.lead.email}
                                  </ItemDescription>
                                )}
                              </ItemContent>
                              <ItemActions className="ml-auto text-xs text-muted-foreground">
                                {format(
                                  new Date(entry.enteredAt),
                                  "d. MMM HH:mm",
                                  { locale: nb }
                                )}
                              </ItemActions>
                            </Item>
                          );
                        })}
                      </ItemGroup>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
