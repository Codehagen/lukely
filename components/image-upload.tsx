"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  onRemove?: () => void;
}

export function ImageUpload({ onUploadComplete, currentImageUrl, onRemove }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const data = await response.json();
        onUploadComplete(data.url);
        toast.success("Bilde lastet opp!");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(error instanceof Error ? error.message : "Kunne ikke laste opp bilde");
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading,
  });

  const handleRemove = () => {
    setPreview(null);
    if (onRemove) {
      onRemove();
    }
  };

  if (preview) {
    return (
      <div className="relative w-full">
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
          <Image
            src={preview}
            alt="Uploaded image"
            fill
            className="object-contain"
            unoptimized={preview.startsWith("data:")}
          />
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
          onClick={handleRemove}
        >
          <IconX className="h-4 w-4 mr-1" />
          Fjern
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
        ${uploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/5"}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        {uploading ? (
          <>
            <IconUpload className="h-10 w-10 text-muted-foreground animate-bounce" />
            <p className="text-sm text-muted-foreground">Laster opp...</p>
          </>
        ) : (
          <>
            <IconPhoto className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {isDragActive ? "Slipp bildet her..." : "Dra og slipp bilde her"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                eller klikk for å velge (JPEG, PNG, WebP, GIF - maks 5MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
