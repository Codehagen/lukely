import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

/**
 * Accept a workspace invitation
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Brukeren ble ikke funnet" },
        { status: 404 }
      );
    }

    // Find invitation
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitasjonen ble ikke funnet" },
        { status: 404 }
      );
    }

    // Check if invitation is for this user
    if (invitation.email !== user.email) {
      return NextResponse.json(
        { error: "Denne invitasjonen er ikke for deg" },
        { status: 403 }
      );
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitasjonen har utløpt" },
        { status: 400 }
      );
    }

    // Check if invitation has already been accepted
    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "Invitasjonen er allerede akseptert" },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: invitation.workspaceId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Du er allerede medlem av dette arbeidsområdet" },
        { status: 400 }
      );
    }

    // Add user to workspace and mark invitation as accepted
    const [member, _] = await prisma.$transaction([
      prisma.workspaceMember.create({
        data: {
          userId: session.user.id,
          workspaceId: invitation.workspaceId,
          role: invitation.role,
        },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    // If user has no default workspace, set this as default
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser?.defaultWorkspaceId) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { defaultWorkspaceId: invitation.workspaceId },
      });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Kunne ikke akseptere invitasjonen" },
      { status: 500 }
    );
  }
}

/**
 * Reject/cancel a workspace invitation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Brukeren ble ikke funnet" },
        { status: 404 }
      );
    }

    // Find invitation
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitasjonen ble ikke funnet" },
        { status: 404 }
      );
    }

    // Check if user can cancel this invitation
    // Users can reject invitations sent to them
    // Workspace admins/owners can cancel any pending invitations
    const canCancel =
      invitation.email === user.email || invitation.invitedById === session.user.id;

    if (!canCancel) {
      const member = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: session.user.id,
            workspaceId: invitation.workspaceId,
          },
        },
      });

      const isAdminOrOwner =
        member && (member.role === "OWNER" || member.role === "ADMIN");

      if (!isAdminOrOwner) {
        return NextResponse.json(
          { error: "Du har ikke tilgang til å avbryte denne invitasjonen" },
          { status: 403 }
        );
      }
    }

    // Delete invitation
    await prisma.workspaceInvitation.delete({
      where: { id: invitation.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling invitation:", error);
    return NextResponse.json(
      { error: "Kunne ikke avbryte invitasjonen" },
      { status: 500 }
    );
  }
}
