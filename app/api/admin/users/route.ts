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

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        workspaces: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
                status: true,
                _count: {
                  select: { calendars: true },
                },
              },
            },
          },
        },
        _count: {
          select: {
            workspaces: true,
          },
        },
      },
    });

    // Transform data to include computed fields
    const transformedUsers = users.map((user) => {
      const totalCalendars = user.workspaces.reduce(
        (acc, ws) => acc + ws.workspace._count.calendars,
        0
      );

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        workspaceCount: user._count.workspaces,
        calendarCount: totalCalendars,
        workspaces: user.workspaces.map((ws) => ({
          id: ws.workspace.id,
          name: ws.workspace.name,
          status: ws.workspace.status,
          role: ws.role,
          calendarCount: ws.workspace._count.calendars,
        })),
      };
    });

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
