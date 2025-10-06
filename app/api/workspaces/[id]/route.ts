import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function PATCH(
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
        { error: "Du har ikke tilgang til å oppdatere dette arbeidsområdet" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, slug, image } = body;

    // If updating slug, check if it's unique
    if (slug && slug !== (await prisma.workspace.findUnique({ where: { id } }))?.slug) {
      const existingWorkspace = await prisma.workspace.findUnique({
        where: { slug },
      });

      if (existingWorkspace) {
        return NextResponse.json(
          { error: "Slugen for arbeidsområdet er allerede i bruk" },
          { status: 400 }
        );
      }
    }

    // Update workspace
    const workspace = await prisma.workspace.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(image !== undefined && { image }),
      },
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere arbeidsområdet" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if user is OWNER
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: id,
        },
      },
    });

    if (!member || member.role !== "OWNER") {
      return NextResponse.json(
        { error: "Kun eiere kan slette arbeidsområder" },
        { status: 403 }
      );
    }

    // Delete workspace (cascades will handle related data)
    await prisma.workspace.delete({
      where: { id },
    });

    // If this was the user's default workspace, clear it
    await prisma.user.updateMany({
      where: { defaultWorkspaceId: id },
      data: { defaultWorkspaceId: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return NextResponse.json(
      { error: "Kunne ikke slette arbeidsområdet" },
      { status: 500 }
    );
  }
}
