"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconBriefcase } from "@tabler/icons-react";
import { toast } from "sonner";

export default function NewWorkspacePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData({ name, slug });
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create workspace");
      }

      toast.success("Workspace created successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create workspace");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <IconBriefcase className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Your Workspace</CardTitle>
          <CardDescription>
            Get started by creating your first workspace to manage your calendars
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => generateSlug(e.target.value)}
              placeholder="My Company"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="slug">Workspace Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="my-company"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used in URLs and must be unique
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={isCreating || !formData.name || !formData.slug}
          >
            {isCreating ? "Creating..." : "Create Workspace"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
