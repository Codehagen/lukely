import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/actions/user";
import { uploadToR2, isValidImageType, isValidImageSize, deleteFromR2 } from "@/lib/r2-client";

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if R2 is configured
    if (
      !process.env.CLOUDFLARE_ACCOUNT_ID ||
      !process.env.CLOUDFLARE_ACCESS_KEY_ID ||
      !process.env.CLOUDFLARE_SECRET_ACCESS_KEY ||
      !process.env.CLOUDFLARE_R2_BUCKET_NAME ||
      !process.env.CLOUDFLARE_R2_PUBLIC_URL
    ) {
      return NextResponse.json(
        { error: "Image upload is not configured. Please contact administrator." },
        { status: 500 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidImageType(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (!isValidImageSize(file.size)) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const result = await uploadToR2(buffer, file.name, file.type);

    return NextResponse.json({
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if R2 is configured
    if (
      !process.env.CLOUDFLARE_ACCOUNT_ID ||
      !process.env.CLOUDFLARE_ACCESS_KEY_ID ||
      !process.env.CLOUDFLARE_SECRET_ACCESS_KEY ||
      !process.env.CLOUDFLARE_R2_BUCKET_NAME ||
      !process.env.CLOUDFLARE_R2_PUBLIC_URL
    ) {
      return NextResponse.json(
        { error: "Image deletion is not configured. Please contact administrator." },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "No URL provided" },
        { status: 400 }
      );
    }

    // Only allow deletion of files from our own R2 bucket
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
    if (!url.startsWith(publicUrl)) {
      return NextResponse.json(
        { error: "Can only delete files from this application's storage" },
        { status: 403 }
      );
    }

    // Delete from R2
    await deleteFromR2(url);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
