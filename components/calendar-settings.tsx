"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { IconCheck, IconTrash, IconArchive } from "@tabler/icons-react";
import { toast } from "sonner";
import { CalendarStatus } from "@/app/generated/prisma";

interface Calendar {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: string;
  status: CalendarStatus;
  brandColor: string | null;
  logo: string | null;
  bannerImage: string | null;
  buttonText: string | null;
  thankYouMessage: string | null;
  footerText: string | null;
  favicon: string | null;
  metaDescription: string | null;
  startDate: Date;
  endDate: Date;
  doorCount: number;
  requireEmail: boolean;
  requireName: boolean;
  requirePhone: boolean;
  allowMultipleEntries: boolean;
}

export default function CalendarSettings({ calendar }: { calendar: Calendar }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: calendar.title,
    slug: calendar.slug,
    description: calendar.description || "",
    brandColor: calendar.brandColor || "#3B82F6",
    logo: calendar.logo || "",
    bannerImage: calendar.bannerImage || "",
    buttonText: calendar.buttonText || "Delta nå",
    thankYouMessage: calendar.thankYouMessage || "Takk for din deltakelse!",
    footerText: calendar.footerText || "",
    favicon: calendar.favicon || "",
    metaDescription: calendar.metaDescription || "",
    status: calendar.status,
    requireEmail: calendar.requireEmail,
    requireName: calendar.requireName,
    requirePhone: calendar.requirePhone,
    allowMultipleEntries: calendar.allowMultipleEntries,
  });

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/calendars/${calendar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Kunne ikke oppdatere kalender");

      toast.success("Kalenderen er oppdatert!");
      router.refresh();
    } catch (error) {
      toast.error("Kunne ikke oppdatere kalender");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Er du sikker på at du vil arkivere denne kalenderen?")) return;

    try {
      const response = await fetch(`/api/calendars/${calendar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });

      if (!response.ok) throw new Error("Kunne ikke arkivere kalender");

      toast.success("Kalenderen ble arkivert!");
      router.push("/dashboard/calendars");
    } catch (error) {
      toast.error("Kunne ikke arkivere kalender");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Er du sikker på at du vil slette denne kalenderen? Dette kan ikke angres.")) return;
    if (!confirm("Dette sletter alle luker, produkter, leads og deltakelser permanent. Er du helt sikker?")) return;

    try {
      const response = await fetch(`/api/calendars/${calendar.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Kunne ikke slette kalender");

      toast.success("Kalenderen ble slettet!");
      router.push("/dashboard/calendars");
    } catch (error) {
      toast.error("Kunne ikke slette kalender");
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-500";
      case "SCHEDULED":
        return "bg-blue-500";
      case "ACTIVE":
        return "bg-green-500";
      case "COMPLETED":
        return "bg-purple-500";
      case "ARCHIVED":
        return "bg-gray-400";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Grunnleggende informasjon</CardTitle>
          <CardDescription>Oppdater de grunnleggende detaljene for kalenderen</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="flex flex-col gap-6">
            <Field>
              <FieldLabel htmlFor="title">Kalendertittel</FieldLabel>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="slug">URL-slug</FieldLabel>
              <FieldContent>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/c/</span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
                <FieldDescription>
                  Å endre slug bryter eksisterende lenker
                </FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Beskrivelse</FieldLabel>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              <FieldDescription>
                Valgfri beskrivelse som vises på den offentlige kalendersiden
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Merkevare</CardTitle>
          <CardDescription>Tilpass utseendet til kalenderen</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="flex flex-col gap-6">
            <Field>
              <FieldLabel htmlFor="brandColor">Profilfarge</FieldLabel>
              <FieldContent>
                <div className="flex items-center gap-4">
                  <Input
                    id="brandColor"
                    type="color"
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    placeholder="#3B82F6"
                  />
                </div>
                <FieldDescription>
                  Brukes på knapper og detaljer i kalenderen
                </FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="logo">Logo-URL</FieldLabel>
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
              <FieldDescription>
                Vis logoen din på den offentlige kalendersiden
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="bannerImage">Bannerbilde-URL</FieldLabel>
              <Input
                id="bannerImage"
                value={formData.bannerImage}
                onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
              <FieldDescription>
                Valgfritt toppbanner for kalenderen
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="buttonText">Knappetekst</FieldLabel>
              <Input
                id="buttonText"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="Delta nå"
              />
              <FieldDescription>
                Teksten som vises på deltakelsesknappen
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="thankYouMessage">Takkemelding</FieldLabel>
              <Input
                id="thankYouMessage"
                value={formData.thankYouMessage}
                onChange={(e) => setFormData({ ...formData, thankYouMessage: e.target.value })}
                placeholder="Takk for din deltakelse!"
              />
              <FieldDescription>
                Meldingen som vises etter en vellykket deltakelse
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="footerText">Bunntekst</FieldLabel>
              <Input
                id="footerText"
                value={formData.footerText}
                onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                placeholder="© 2024 Bedriftsnavn"
              />
              <FieldDescription>
                Valgfri bunntekst for kalenderen
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="favicon">Favicon-URL</FieldLabel>
              <Input
                id="favicon"
                value={formData.favicon}
                onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                placeholder="https://example.com/favicon.ico"
              />
              <FieldDescription>
                Ikonfil som vises i nettleserens fane
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="metaDescription">Meta-beskrivelse</FieldLabel>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Beskrivelse for søkemotorer..."
                rows={2}
              />
              <FieldDescription>
                SEO-beskrivelse for kalenderen
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Status & Publishing */}
      <Card>
        <CardHeader>
          <CardTitle>Status og publisering</CardTitle>
          <CardDescription>Bestem når kalenderen er synlig for publikum</CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="status">Kalenderstatus</FieldLabel>
            <FieldContent>
              <div className="flex items-center gap-3">
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as CalendarStatus })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Kladd</SelectItem>
                    <SelectItem value="SCHEDULED">Planlagt</SelectItem>
                    <SelectItem value="ACTIVE">Aktiv</SelectItem>
                    <SelectItem value="COMPLETED">Fullført</SelectItem>
                    <SelectItem value="ARCHIVED">Arkivert</SelectItem>
                  </SelectContent>
                </Select>
                <Badge className={getStatusColor(formData.status)}>{formData.status}</Badge>
              </div>
              <FieldDescription>
                Kun ACTIVE og SCHEDULED kalendere er synlige for publikum
              </FieldDescription>
            </FieldContent>
          </Field>
        </CardContent>
      </Card>

      {/* Entry Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Deltakerinnstillinger</CardTitle>
          <CardDescription>Bestem hvordan brukerne kan delta i konkurransene</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="flex flex-col gap-4">
            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel>Krev e-post</FieldLabel>
                <FieldDescription>Brukere må oppgi e-post for å delta</FieldDescription>
              </div>
              <Switch
                checked={formData.requireEmail}
                onCheckedChange={(checked) => setFormData({ ...formData, requireEmail: checked })}
              />
            </Field>

            <Separator />

            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel>Krev navn</FieldLabel>
                <FieldDescription>Brukere må oppgi navnet sitt</FieldDescription>
              </div>
              <Switch
                checked={formData.requireName}
                onCheckedChange={(checked) => setFormData({ ...formData, requireName: checked })}
              />
            </Field>

            <Separator />

            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel>Krev telefonnummer</FieldLabel>
                <FieldDescription>Brukere må oppgi telefonnummer</FieldDescription>
              </div>
              <Switch
                checked={formData.requirePhone}
                onCheckedChange={(checked) => setFormData({ ...formData, requirePhone: checked })}
              />
            </Field>

            <Separator />

            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel>Tillat flere deltakelser</FieldLabel>
                <FieldDescription>
                  Brukere kan delta på samme luke flere ganger
                </FieldDescription>
              </div>
              <Switch
                checked={formData.allowMultipleEntries}
                onCheckedChange={(checked) => setFormData({ ...formData, allowMultipleEntries: checked })}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleArchive}>
            <IconArchive className="mr-2 h-4 w-4" />
            Arkiver kalender
          </Button>
          <Button variant="outline" className="text-destructive" onClick={handleDelete}>
            <IconTrash className="mr-2 h-4 w-4" />
            Slett kalender
          </Button>
        </div>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          <IconCheck className="mr-2 h-4 w-4" />
          {isUpdating ? "Lagrer ..." : "Lagre endringer"}
        </Button>
      </div>
    </div>
  );
}
