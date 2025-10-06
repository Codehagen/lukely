"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { Role } from "@/app/generated/prisma";

/**
 * Get current user's workspace with members and role
 */
export async function getCurrentWorkspace() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        defaultWorkspace: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
              orderBy: {
                joinedAt: "asc",
              },
            },
            invitations: {
              where: {
                acceptedAt: null,
                expiresAt: {
                  gt: new Date(),
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
            _count: {
              select: {
                calendars: true,
              },
            },
          },
        },
        workspaces: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!user?.defaultWorkspace) {
      return null;
    }

    // Get current user's role in the workspace
    const currentUserMembership = user.defaultWorkspace.members.find(
      (m) => m.userId === session.user.id
    );

    return {
      ...user.defaultWorkspace,
      currentUserRole: currentUserMembership?.role || null,
    };
  } catch (error) {
    console.error("Error fetching current workspace:", error);
    return null;
  }
}

/**
 * Get all workspaces the current user is a member of
 */
export async function getUserWorkspaces() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return [];
    }

    const workspaces = await prisma.workspaceMember.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        workspace: {
          include: {
            _count: {
              select: {
                members: true,
                calendars: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    return workspaces.map((wm) => ({
      ...wm.workspace,
      role: wm.role,
    }));
  } catch (error) {
    console.error("Error fetching user workspaces:", error);
    return [];
  }
}

/**
 * Check if user has permission to perform action
 */
export async function checkWorkspacePermission(
  workspaceId: string,
  requiredRoles: Role[]
): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return false;
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId,
        },
      },
    });

    if (!member) {
      return false;
    }

    return requiredRoles.includes(member.role);
  } catch (error) {
    console.error("Error checking workspace permission:", error);
    return false;
  }
}

/**
 * Get workspace invitations sent to current user's email
 */
export async function getUserWorkspaceInvitations() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return [];
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (!user) {
      return [];
    }

    const invitations = await prisma.workspaceInvitation.findMany({
      where: {
        email: user.email,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invitations;
  } catch (error) {
    console.error("Error fetching user workspace invitations:", error);
    return [];
  }
}
