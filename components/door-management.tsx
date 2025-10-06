"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { IconEdit, IconGift, IconLock, IconCalendar, IconQuestionMark } from "@tabler/icons-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { ShareUrlCopyButton } from "@/components/share-url-copy";
import { ShareTargetButtons } from "@/components/share-target-buttons";
import { HOME_DOMAIN } from "@/lib/config";

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
  slug: string;
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
  const hasDoors = calendar.doors.length > 0;
  const baseShareUrl = useMemo(() => {
    const configured = (HOME_DOMAIN || "").replace(/\/$/, "");
    if (configured) return configured;
    if (typeof window !== "undefined") {
      return window.location.origin.replace(/\/$/, "");
    }
    return "";
  }, []);

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
      {hasDoors ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {calendar.doors.map((door) => {
            const shareUrl = `${baseShareUrl}/c/${calendar.slug}/doors/${door.doorNumber}`;
            const shareTitle = door.product?.name ?? `Luke ${door.doorNumber}`;
            const shareDescription = door.product?.description ?? door.description ?? "";

            return (
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
                          <ItemMedia variant="image" className="relative h-16 w-16 overflow-hidden rounded-md">
                            <Image
                              src={door.product.imageUrl}
                              alt={door.product.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                              unoptimized
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
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/calendars/${calendar.id}/doors/${door.id}/quiz`}
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            <IconQuestionMark className="h-4 w-4 mr-2" />
                            Quiz
                          </Button>
                        </Link>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEditDoor(door)}
                            >
                              <IconEdit className="h-4 w-4 mr-2" />
                              Produkt
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Rediger produkt for luke {selectedDoor?.doorNumber}
                              </DialogTitle>
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
                                    setProductData({
                                      ...productData,
                                      description: e.target.value,
                                    })
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
                                    setProductData({
                                      ...productData,
                                      imageUrl: e.target.value,
                                    })
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
                                      setProductData({
                                        ...productData,
                                        value: e.target.value,
                                      })
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
                                      setProductData({
                                        ...productData,
                                        quantity: e.target.value,
                                      })
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
                                  {isSubmitting ? (
                                    <>
                                      <Spinner className="mr-2 h-4 w-4" />
                                      Lagrer ...
                                    </>
                                  ) : (
                                    "Lagre produkt"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Dialog>
                        <Empty className="py-8 border border-dashed rounded-lg">
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <IconGift className="h-6 w-6" />
                            </EmptyMedia>
                            <EmptyTitle>Ingen produkt lagt til</EmptyTitle>
                            <EmptyDescription>
                              Legg til et produkt for å gjøre luken klar til kampanjen.
                            </EmptyDescription>
                          </EmptyHeader>
                          <EmptyContent>
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
                          </EmptyContent>
                        </Empty>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              Legg til produkt for luke {selectedDoor?.doorNumber}
                            </DialogTitle>
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
                                  setProductData({
                                    ...productData,
                                    description: e.target.value,
                                  })
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
                                  setProductData({
                                    ...productData,
                                    imageUrl: e.target.value,
                                  })
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
                                    setProductData({
                                      ...productData,
                                      value: e.target.value,
                                    })
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
                                    setProductData({
                                      ...productData,
                                      quantity: e.target.value,
                                    })
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
                                {isSubmitting ? (
                                  <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Lagrer ...
                                  </>
                                ) : (
                                  "Lagre produkt"
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Link href={`/dashboard/calendars/${calendar.id}/doors/${door.id}/quiz`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <IconQuestionMark className="h-4 w-4 mr-2" />
                          Quiz
                        </Button>
                      </Link>
                    </div>
                  )}

                  <div className="mt-4 space-y-3 rounded-lg border bg-muted/20 p-3">
                    <div className="flex flex-col gap-2 text-left">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Del kampanjen
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="truncate" title={shareUrl}>
                          {shareUrl}
                        </span>
                        <ShareUrlCopyButton url={shareUrl} />
                      </div>
                    </div>
                    <ShareTargetButtons url={shareUrl} title={shareTitle} description={shareDescription} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconCalendar className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Ingen luker tilgjengelig</EmptyTitle>
            <EmptyDescription>
              Juster kalenderoppsettet for å generere luker før du legger til produkter.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/calendars/${calendar.id}`}>
                Gå til kalenderoversikten
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
