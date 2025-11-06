import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { WorkspaceStatus } from "@/app/generated/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Get the workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          where: { role: "OWNER" },
          include: { user: true },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    if (workspace.status !== WorkspaceStatus.PENDING) {
      return NextResponse.json(
        { error: "Only pending workspaces can be approved" },
        { status: 400 }
      );
    }

    // Approve the workspace
    const updatedWorkspace = await prisma.workspace.update({
      where: { id },
      data: {
        status: WorkspaceStatus.APPROVED,
        approvedAt: new Date(),
        approvedById: admin.id,
      },
    });

    // TODO: Send approval email to workspace owner
    // const owner = workspace.members[0]?.user;
    // if (owner?.email) {
    //   await sendApprovalEmail(owner.email, workspace.name);
    // }

    return NextResponse.json({
      success: true,
      workspace: updatedWorkspace,
    });
  } catch (error) {
    console.error("Error approving workspace:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
