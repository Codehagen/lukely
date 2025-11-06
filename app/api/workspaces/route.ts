import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Navn og slug er påkrevd" },
        { status: 400 }
      );
    }

    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Bruker ikke funnet" }, { status: 404 });
    }

    // Check workspace creation limit for USER role (1 workspace)
    if (user.role === "USER") {
      const userWorkspaceCount = await prisma.workspace.count({
        where: {
          members: {
            some: {
              userId: user.id,
              role: "OWNER",
            },
          },
          status: {
            in: ["PENDING", "APPROVED"],
          },
        },
      });

      if (userWorkspaceCount >= 1) {
        return NextResponse.json(
          { error: "Gratis brukere kan kun opprette 1 workspace. Oppgrader for å opprette flere." },
          { status: 403 }
        );
      }
    }

    // Check if slug is unique
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { slug },
    });

    if (existingWorkspace) {
      return NextResponse.json(
        { error: "Slugen for arbeidsområdet er allerede i bruk" },
        { status: 400 }
      );
    }

    // Create workspace with PENDING status
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        status: "PENDING", // Awaiting admin approval
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
    });

    // Set as default workspace for user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        defaultWorkspaceId: workspace.id,
      },
    });

    // TODO: Send notification email to admins about new workspace pending approval
    // await notifyAdminsNewWorkspace(workspace);

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette arbeidsområde" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
            calendars: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente arbeidsområder" },
      { status: 500 }
    );
  }
}
