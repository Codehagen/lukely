import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { Role } from "@/app/generated/prisma";

/**
 * Update a workspace member's role
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id, memberId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    // Check if current user is OWNER
    const currentUserMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: id,
        },
      },
    });

    if (!currentUserMember || currentUserMember.role !== "OWNER") {
      return NextResponse.json(
        { error: "Kun eiere kan endre roller" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { role } = body;

    // Validate role
    const validRoles: Role[] = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Ugyldig rolle" }, { status: 400 });
    }

    // Don't allow changing your own role
    if (memberId === currentUserMember.id) {
      return NextResponse.json(
        { error: "Du kan ikke endre din egen rolle" },
        { status: 400 }
      );
    }

    // Update member role
    const updatedMember = await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
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
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere rolle" },
      { status: 500 }
    );
  }
}

/**
 * Remove a member from the workspace
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id, memberId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    // Get current user's membership
    const currentUserMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: id,
        },
      },
    });

    if (!currentUserMember) {
      return NextResponse.json(
        { error: "Du er ikke medlem av dette arbeidsområdet" },
        { status: 403 }
      );
    }

    // Get the member to be removed
    const memberToRemove = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!memberToRemove || memberToRemove.workspaceId !== id) {
      return NextResponse.json(
        { error: "Medlemmet ble ikke funnet" },
        { status: 404 }
      );
    }

    // Check permissions
    // Owners can remove anyone except themselves (if sole owner)
    // Admins can remove Members and Viewers
    // Users can remove themselves (leave workspace)
    const isSelf = memberToRemove.userId === session.user.id;
    const isOwner = currentUserMember.role === "OWNER";
    const isAdmin = currentUserMember.role === "ADMIN";
    const canRemove =
      isSelf ||
      isOwner ||
      (isAdmin &&
        (memberToRemove.role === "MEMBER" || memberToRemove.role === "VIEWER"));

    if (!canRemove) {
      return NextResponse.json(
        { error: "Du har ikke tilgang til å fjerne dette medlemmet" },
        { status: 403 }
      );
    }

    // If removing self and is owner, check if there are other owners
    if (isSelf && currentUserMember.role === "OWNER") {
      const ownerCount = await prisma.workspaceMember.count({
        where: {
          workspaceId: id,
          role: "OWNER",
        },
      });

      if (ownerCount === 1) {
        return NextResponse.json(
          {
            error:
              "Du kan ikke forlate arbeidsområdet som eneste eier. Overfør eierskap eller slett arbeidsområdet.",
          },
          { status: 400 }
        );
      }
    }

    // Remove member
    await prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    // If user removed themselves and this was their default workspace, clear it
    if (isSelf) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (user?.defaultWorkspaceId === id) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { defaultWorkspaceId: null },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Kunne ikke fjerne medlem" },
      { status: 500 }
    );
  }
}
