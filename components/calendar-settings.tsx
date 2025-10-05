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

      if (!response.ok) throw new Error("Failed to update calendar");

      toast.success("Calendar updated successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update calendar");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this calendar?")) return;

    try {
      const response = await fetch(`/api/calendars/${calendar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });

      if (!response.ok) throw new Error("Failed to archive calendar");

      toast.success("Calendar archived successfully!");
      router.push("/dashboard/calendars");
    } catch (error) {
      toast.error("Failed to archive calendar");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this calendar? This action cannot be undone.")) return;
    if (!confirm("This will permanently delete all doors, products, leads, and entries. Are you absolutely sure?")) return;

    try {
      const response = await fetch(`/api/calendars/${calendar.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete calendar");

      toast.success("Calendar deleted successfully!");
      router.push("/dashboard/calendars");
    } catch (error) {
      toast.error("Failed to delete calendar");
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
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your calendar's basic details</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="flex flex-col gap-6">
            <Field>
              <FieldLabel htmlFor="title">Calendar Title</FieldLabel>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="slug">URL Slug</FieldLabel>
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
                  Changing the slug will break existing links
                </FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              <FieldDescription>
                Optional description shown on the public calendar page
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Customize the look and feel of your calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="flex flex-col gap-6">
            <Field>
              <FieldLabel htmlFor="brandColor">Brand Color</FieldLabel>
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
                  Used for buttons and accents throughout your calendar
                </FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="logo">Logo URL</FieldLabel>
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
              <FieldDescription>
                Display your brand logo on the public calendar page
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="bannerImage">Banner Image URL</FieldLabel>
              <Input
                id="bannerImage"
                value={formData.bannerImage}
                onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
              <FieldDescription>
                Optional header banner image for your calendar
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Status & Publishing */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Publishing</CardTitle>
          <CardDescription>Control when your calendar is visible to the public</CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="status">Calendar Status</FieldLabel>
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
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Badge className={getStatusColor(formData.status)}>{formData.status}</Badge>
              </div>
              <FieldDescription>
                Only ACTIVE and SCHEDULED calendars are visible to the public
              </FieldDescription>
            </FieldContent>
          </Field>
        </CardContent>
      </Card>

      {/* Entry Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Entry Settings</CardTitle>
          <CardDescription>Configure how users can enter your giveaways</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="flex flex-col gap-4">
            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel>Require Email</FieldLabel>
                <FieldDescription>Users must provide an email to enter</FieldDescription>
              </div>
              <Switch
                checked={formData.requireEmail}
                onCheckedChange={(checked) => setFormData({ ...formData, requireEmail: checked })}
              />
            </Field>

            <Separator />

            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel>Require Name</FieldLabel>
                <FieldDescription>Users must provide their name</FieldDescription>
              </div>
              <Switch
                checked={formData.requireName}
                onCheckedChange={(checked) => setFormData({ ...formData, requireName: checked })}
              />
            </Field>

            <Separator />

            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel>Require Phone</FieldLabel>
                <FieldDescription>Users must provide a phone number</FieldDescription>
              </div>
              <Switch
                checked={formData.requirePhone}
                onCheckedChange={(checked) => setFormData({ ...formData, requirePhone: checked })}
              />
            </Field>

            <Separator />

            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel>Allow Multiple Entries</FieldLabel>
                <FieldDescription>
                  Users can enter the same door multiple times
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
            Archive Calendar
          </Button>
          <Button variant="outline" className="text-destructive" onClick={handleDelete}>
            <IconTrash className="mr-2 h-4 w-4" />
            Delete Calendar
          </Button>
        </div>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          <IconCheck className="mr-2 h-4 w-4" />
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
