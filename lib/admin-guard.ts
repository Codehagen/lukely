import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { UserRole } from "@/app/generated/prisma";

/**
 * Server-side utility to check if the current user is a platform admin
 * @returns User object if admin, null otherwise
 */
export async function requireAdmin() {
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
        role: true,
      },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return null;
  }
}

/**
 * Check if current user is admin (boolean return)
 */
export async function isAdmin(): Promise<boolean> {
  const admin = await requireAdmin();
  return admin !== null;
}

/**
 * Get current user with role information
 */
export async function getCurrentUserWithRole() {
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
        role: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching current user with role:", error);
    return null;
  }
}
