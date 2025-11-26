import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { resend } from "@/lib/resend";
import { PasswordResetEmail } from "@/emails/password-reset";
import crypto from "crypto";

const RESET_TOKEN_EXPIRY_HOURS = 1;

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, sendEmail = false } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate a secure token (plain, not hashed - better-auth validates directly)
    const token = crypto.randomBytes(32).toString("hex");

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRY_HOURS);

    // Store token in Verification table using better-auth's expected format:
    // identifier: "reset-password:{token}", value: userId
    await prisma.verification.create({
      data: {
        id: crypto.randomUUID(),
        identifier: `reset-password:${token}`,
        value: user.id,
        expiresAt,
      },
    });

    // Construct reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Send email if requested
    if (sendEmail) {
      await resend.emails.send({
        from: "Lukely <noreply@lukely.no>",
        to: user.email,
        subject: "Tilbakestill passordet ditt",
        react: PasswordResetEmail({ url: resetUrl, userName: user.name }),
      });
    }

    return NextResponse.json({
      success: true,
      url: resetUrl,
      emailSent: sendEmail,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Error generating password reset:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
