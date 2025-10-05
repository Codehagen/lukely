"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Calendar Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="slug">URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/c/</span>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Changing the slug will break existing links
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Customize the look and feel of your calendar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="brandColor">Brand Color</Label>
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
          </div>

          <div>
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <Label htmlFor="bannerImage">Banner Image URL</Label>
            <Input
              id="bannerImage"
              value={formData.bannerImage}
              onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
              placeholder="https://example.com/banner.jpg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status & Publishing */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Publishing</CardTitle>
          <CardDescription>Control when your calendar is visible to the public</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="status">Calendar Status</Label>
            <div className="flex items-center gap-3 mt-2">
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
            <p className="text-sm text-muted-foreground mt-2">
              Only ACTIVE and SCHEDULED calendars are visible to the public
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Entry Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Entry Settings</CardTitle>
          <CardDescription>Configure how users can enter your giveaways</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Email</Label>
              <p className="text-sm text-muted-foreground">Users must provide an email to enter</p>
            </div>
            <Switch
              checked={formData.requireEmail}
              onCheckedChange={(checked) => setFormData({ ...formData, requireEmail: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Name</Label>
              <p className="text-sm text-muted-foreground">Users must provide their name</p>
            </div>
            <Switch
              checked={formData.requireName}
              onCheckedChange={(checked) => setFormData({ ...formData, requireName: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Phone</Label>
              <p className="text-sm text-muted-foreground">Users must provide a phone number</p>
            </div>
            <Switch
              checked={formData.requirePhone}
              onCheckedChange={(checked) => setFormData({ ...formData, requirePhone: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Multiple Entries</Label>
              <p className="text-sm text-muted-foreground">
                Users can enter the same door multiple times
              </p>
            </div>
            <Switch
              checked={formData.allowMultipleEntries}
              onCheckedChange={(checked) => setFormData({ ...formData, allowMultipleEntries: checked })}
            />
          </div>
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
