import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workspaces = await prisma.workspace.findMany({
      orderBy: { submittedAt: "desc" },
      include: {
        members: {
          where: { role: "OWNER" },
          include: { user: { select: { id: true, email: true, name: true } } },
        },
        calendars: { select: { id: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, calendars: true } },
      },
    });

    // Transform data for easier table consumption
    const transformedWorkspaces = workspaces.map((workspace) => {
      const owner = workspace.members[0]?.user || null;

      return {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        image: workspace.image,
        status: workspace.status,
        owner: owner ? {
          id: owner.id,
          name: owner.name,
          email: owner.email,
        } : null,
        memberCount: workspace._count.members,
        calendarCount: workspace._count.calendars,
        submittedAt: workspace.submittedAt,
        approvedAt: workspace.approvedAt,
        approvedBy: workspace.approvedBy,
        rejectedAt: workspace.rejectedAt,
        rejectionReason: workspace.rejectionReason,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      };
    });

    return NextResponse.json(transformedWorkspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
