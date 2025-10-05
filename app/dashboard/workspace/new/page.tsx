"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconBriefcase } from "@tabler/icons-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function NewWorkspacePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  const generateSlug = (name: string) => {
    const normalized = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/å/g, "a");

    const slug = normalized
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData({ name, slug });
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Fyll inn alle feltene");
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
        throw new Error(error.error || "Kunne ikke opprette arbeidsområde");
      }

      toast.success("Arbeidsområdet ble opprettet!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Kunne ikke opprette arbeidsområde");
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
          <CardTitle className="text-2xl">Opprett arbeidsområdet ditt</CardTitle>
          <CardDescription>
            Kom i gang ved å opprette ditt første arbeidsområde for å administrere kalendere
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Navn på arbeidsområde</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => generateSlug(e.target.value)}
              placeholder="Mitt selskap"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug for arbeidsområde</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="mitt-selskap"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Brukes i URL-er og må være unik
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={isCreating || !formData.name || !formData.slug}
          >
            {isCreating ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Oppretter ...
              </>
            ) : (
              "Opprett arbeidsområde"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
