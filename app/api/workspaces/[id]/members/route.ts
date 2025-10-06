import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { Role } from "@/app/generated/prisma";

/**
 * Get all members and pending invitations for a workspace
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    // Check if user is a member of the workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: id,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Du er ikke medlem av dette arbeidsområdet" },
        { status: 403 }
      );
    }

    // Get members
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: id },
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
    });

    // Get pending invitations
    const invitations = await prisma.workspaceInvitation.findMany({
      where: {
        workspaceId: id,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
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

    return NextResponse.json({ members, invitations });
  } catch (error) {
    console.error("Error fetching workspace members:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente medlemmer" },
      { status: 500 }
    );
  }
}

/**
 * Invite a new member to the workspace
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    // Check if user is OWNER or ADMIN
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: id,
        },
      },
    });

    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Kun eiere og administratorer kan invitere medlemmer" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "E-post og rolle er påkrevd" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: Role[] = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Ugyldig rolle" }, { status: 400 });
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        workspaces: {
          where: { workspaceId: id },
        },
      },
    });

    if (existingUser && existingUser.workspaces.length > 0) {
      return NextResponse.json(
        { error: "Brukeren er allerede medlem av arbeidsområdet" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.workspaceInvitation.findFirst({
      where: {
        email,
        workspaceId: id,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Det finnes allerede en ventende invitasjon for denne e-posten" },
        { status: 400 }
      );
    }

    // Create invitation (expires in 7 days)
    const invitation = await prisma.workspaceInvitation.create({
      data: {
        email,
        role,
        workspaceId: id,
        invitedById: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: {
        workspace: {
          select: {
            name: true,
          },
        },
      },
    });

    // TODO: Send invitation email
    // await sendInvitationEmail(email, invitation.token, invitation.workspace.name);

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("Error inviting member:", error);
    return NextResponse.json(
      { error: "Kunne ikke sende invitasjon" },
      { status: 500 }
    );
  }
}
