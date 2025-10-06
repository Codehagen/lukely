import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

/**
 * Delete user account and all associated data
 * WARNING: This is a destructive operation
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user is the sole owner of any workspaces
    const ownedWorkspaces = await prisma.workspaceMember.findMany({
      where: {
        userId,
        role: "OWNER",
      },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                role: "OWNER",
              },
            },
          },
        },
      },
    });

    const workspacesWithSoleOwner = ownedWorkspaces.filter(
      (wm) => wm.workspace.members.length === 1
    );

    if (workspacesWithSoleOwner.length > 0) {
      return NextResponse.json(
        {
          error: `Du må overføre eierskap eller slette følgende arbeidsområder før du kan slette kontoen: ${workspacesWithSoleOwner.map((wm) => wm.workspace.name).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Delete user (cascades will handle related data)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Kunne ikke slette kontoen" },
      { status: 500 }
    );
  }
}
