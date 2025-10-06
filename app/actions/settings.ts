"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

/**
 * Get user profile with notification preferences
 */
export async function getUserProfile() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            providerId: true,
            createdAt: true,
          },
        },
        notificationPreferences: true,
        defaultWorkspaceId: true,
        defaultWorkspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Get or create user notification preferences
 */
export async function getUserNotificationPreferences() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return null;
    }

    let preferences = await prisma.userNotificationPreferences.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.userNotificationPreferences.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return preferences;
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return null;
  }
}
