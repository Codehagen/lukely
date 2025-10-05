"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { IconTrophy, IconDice, IconLock, IconCheck } from "@tabler/icons-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
}

interface DoorEntry {
  id: string;
  enteredAt: Date;
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

  const isDoorOpen = (door: Door) => {
    return new Date() >= new Date(door.openDate);
  };

  return (
    <div>
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
                <CardTitle className="text-lg">Luke {door.doorNumber}</CardTitle>
                {door.winner ? (
                  <Badge className="bg-yellow-500">
                    <IconTrophy className="h-3 w-3 mr-1" />
                    Vinner
                  </Badge>
                ) : isDoorOpen(door) ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
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
                {format(new Date(door.openDate), "d. MMM yyyy", { locale: nb })}
              </p>
            </CardHeader>
            <CardContent>
              {door.product && (
                <div className="mb-4">
                  <p className="font-medium">{door.product.name}</p>
                  {door.product.value && (
                    <p className="text-sm text-muted-foreground">kr {door.product.value}</p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Totalt antall deltakelser</span>
                  <span className="font-semibold">{door._count.entries}</span>
                </div>

                {door.winner ? (
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <IconTrophy className="h-4 w-4 text-yellow-600" />
                      <p className="font-semibold text-sm">Vinner valgt</p>
                    </div>
                    <p className="text-sm">{door.winner.lead.name || door.winner.lead.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(door.winner.selectedAt), "d. MMM yyyy 'kl.' HH:mm", { locale: nb })}
                    </p>
                    {door.winner.notified && (
                      <div className="flex items-center gap-1 mt-2">
                        <IconCheck className="h-3 w-3 text-green-600" />
                        <p className="text-xs text-green-600">Varslet</p>
                      </div>
                    )}
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

      {/* Winner Selection Dialog */}
      <Dialog open={!!selectedDoor} onOpenChange={() => setSelectedDoor(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedDoor && (
            <>
              <DialogHeader>
                <DialogTitle>Velg vinner for luke {selectedDoor.doorNumber}</DialogTitle>
                <DialogDescription>
                  {selectedDoor._count.entries} deltakelser
                    {selectedDoor.product && ` • Premie: ${selectedDoor.product.name}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Tilfeldig trekning</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Klikk på knappen for å trekke en tilfeldig vinner blant alle deltakelser
                  </p>
                  <Button
                    onClick={() => selectRandomWinner(selectedDoor)}
                    disabled={isSelecting}
                    className="w-full"
                  >
                    <IconDice className="h-4 w-4 mr-2" />
                    {isSelecting ? "Velger ..." : "Trekk tilfeldig vinner"}
                  </Button>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Alle deltakelser</h4>
                  <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                    {selectedDoor.entries.map((entry) => (
                      <div key={entry.id} className="p-3 hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {entry.lead.name || entry.lead.email}
                            </p>
                            {entry.lead.name && (
                              <p className="text-sm text-muted-foreground">
                                {entry.lead.email}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(entry.enteredAt), "d. MMM HH:mm", { locale: nb })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
