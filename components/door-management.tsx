"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { IconEdit, IconGift, IconLock } from "@tabler/icons-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  value: number | null;
  quantity: number;
}

interface Door {
  id: string;
  doorNumber: number;
  openDate: Date;
  title: string | null;
  description: string | null;
  image: string | null;
  product: Product | null;
  _count: {
    entries: number;
  };
}

interface Calendar {
  id: string;
  title: string;
  status: string;
  doors: Door[];
}

export default function DoorManagement({ calendar }: { calendar: Calendar }) {
  const router = useRouter();
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    value: "",
    quantity: "1",
  });

  const handleEditDoor = (door: Door) => {
    setSelectedDoor(door);
    if (door.product) {
      setProductData({
        name: door.product.name,
        description: door.product.description || "",
        imageUrl: door.product.imageUrl || "",
        value: door.product.value?.toString() || "",
        quantity: door.product.quantity.toString(),
      });
    } else {
      setProductData({
        name: "",
        description: "",
        imageUrl: "",
        value: "",
        quantity: "1",
      });
    }
  };

  const handleSaveProduct = async () => {
    if (!selectedDoor) return;

    if (!productData.name) {
      toast.error("Produktnavn er påkrevd");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/doors/${selectedDoor.id}/product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productData.name,
          description: productData.description || null,
          imageUrl: productData.imageUrl || null,
          value: productData.value ? parseFloat(productData.value) : null,
          quantity: parseInt(productData.quantity) || 1,
        }),
      });

      if (!response.ok) throw new Error("Kunne ikke lagre produkt");

      toast.success("Produktet er lagret!");
      setSelectedDoor(null);
      router.refresh();
    } catch (error) {
      toast.error("Kunne ikke lagre produkt");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDoorOpen = (door: Door) => {
    return new Date() >= new Date(door.openDate);
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {calendar.doors.map((door) => (
          <Card key={door.id} className={isDoorOpen(door) ? "" : "opacity-60"}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Luke {door.doorNumber}</CardTitle>
                {isDoorOpen(door) ? (
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
              {door.product ? (
                <div className="space-y-3">
                  <Item variant="outline" className="w-full">
                    {door.product.imageUrl ? (
                      <ItemMedia
                        variant="image"
                        className="h-16 w-16 rounded-md"
                      >
                        <img
                          src={door.product.imageUrl}
                          alt={door.product.name}
                          className="h-full w-full object-cover"
                        />
                      </ItemMedia>
                    ) : (
                      <ItemMedia className="h-12 w-12 rounded-md bg-muted">
                        <IconGift className="h-6 w-6 text-muted-foreground" />
                      </ItemMedia>
                    )}
                    <ItemContent>
                      <ItemTitle className="text-base font-medium">
                        {door.product.name}
                      </ItemTitle>
                      {door.product.description && (
                        <ItemDescription className="line-clamp-2">
                          {door.product.description}
                        </ItemDescription>
                      )}
                    </ItemContent>
                    <ItemFooter className="gap-2 text-xs text-muted-foreground">
                      {door.product.value && (
                        <span className="text-sm font-medium text-foreground">
                          kr {door.product.value}
                        </span>
                      )}
                      <span className="ml-auto">{door._count.entries} deltakelser</span>
                    </ItemFooter>
                  </Item>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleEditDoor(door)}
                      >
                        <IconEdit className="h-4 w-4 mr-2" />
                        Rediger produkt
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Rediger produkt for luke {selectedDoor?.doorNumber}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="name">Produktnavn *</Label>
                          <Input
                            id="name"
                            value={productData.name}
                            onChange={(e) =>
                              setProductData({ ...productData, name: e.target.value })
                            }
                            placeholder="Premium kaffetrakter"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Beskrivelse</Label>
                          <Textarea
                            id="description"
                            value={productData.description}
                            onChange={(e) =>
                              setProductData({ ...productData, description: e.target.value })
                            }
                            placeholder="Skriv inn produktbeskrivelse..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="imageUrl">Bildelenke</Label>
                          <Input
                            id="imageUrl"
                            value={productData.imageUrl}
                            onChange={(e) =>
                              setProductData({ ...productData, imageUrl: e.target.value })
                            }
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="value">Verdi (kr)</Label>
                            <Input
                              id="value"
                              type="number"
                              step="0.01"
                              value={productData.value}
                              onChange={(e) =>
                                setProductData({ ...productData, value: e.target.value })
                              }
                              placeholder="999"
                            />
                          </div>
                          <div>
                            <Label htmlFor="quantity">Antall</Label>
                            <Input
                              id="quantity"
                              type="number"
                              min="1"
                              value={productData.quantity}
                              onChange={(e) =>
                                setProductData({ ...productData, quantity: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedDoor(null)}
                            disabled={isSubmitting}
                          >
                            Avbryt
                          </Button>
                          <Button onClick={handleSaveProduct} disabled={isSubmitting}>
                            {isSubmitting ? "Lagrer ..." : "Lagre produkt"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleEditDoor(door)}
                    >
                      <IconGift className="h-4 w-4 mr-2" />
                      Legg til produkt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Legg til produkt for luke {selectedDoor?.doorNumber}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="name">Produktnavn *</Label>
                        <Input
                          id="name"
                          value={productData.name}
                          onChange={(e) =>
                            setProductData({ ...productData, name: e.target.value })
                          }
                          placeholder="Premium kaffetrakter"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Beskrivelse</Label>
                        <Textarea
                          id="description"
                          value={productData.description}
                          onChange={(e) =>
                            setProductData({ ...productData, description: e.target.value })
                          }
                          placeholder="Skriv inn produktbeskrivelse..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="imageUrl">Bildelenke</Label>
                        <Input
                          id="imageUrl"
                          value={productData.imageUrl}
                          onChange={(e) =>
                            setProductData({ ...productData, imageUrl: e.target.value })
                          }
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="value">Verdi (kr)</Label>
                          <Input
                            id="value"
                            type="number"
                            step="0.01"
                            value={productData.value}
                            onChange={(e) =>
                              setProductData({ ...productData, value: e.target.value })
                            }
                            placeholder="999"
                          />
                        </div>
                        <div>
                          <Label htmlFor="quantity">Antall</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={productData.quantity}
                            onChange={(e) =>
                              setProductData({ ...productData, quantity: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedDoor(null)}
                          disabled={isSubmitting}
                        >
                          Avbryt
                        </Button>
                        <Button onClick={handleSaveProduct} disabled={isSubmitting}>
                          {isSubmitting ? "Lagrer ..." : "Lagre produkt"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
