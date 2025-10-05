import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify calendar exists and user has access
    const calendar = await prisma.calendar.findFirst({
      where: {
        id: params.id,
        workspace: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
      include: {
        leads: {
          include: {
            entries: {
              include: {
                door: {
                  include: {
                    product: true,
                  },
                },
              },
            },
            wins: {
              include: {
                door: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!calendar) {
      return NextResponse.json({ error: "Calendar not found" }, { status: 404 });
    }

    // Generate CSV
    const csvHeaders = [
      "Email",
      "Name",
      "Phone",
      "First Entry Date",
      "Total Entries",
      "Doors Entered",
      "Wins",
      "Won Prizes",
    ];

    const csvRows = calendar.leads.map((lead) => {
      const doorsEntered = lead.entries
        .map((e) => `Door ${e.door.doorNumber}`)
        .join("; ");

      const wonPrizes = lead.wins
        .map((w) => w.door.product?.name || `Door ${w.door.doorNumber}`)
        .join("; ");

      return [
        lead.email,
        lead.name || "",
        lead.phone || "",
        format(new Date(lead.createdAt), "yyyy-MM-dd HH:mm:ss"),
        lead.entries.length.toString(),
        doorsEntered,
        lead.wins.length.toString(),
        wonPrizes,
      ];
    });

    // Combine headers and rows
    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${calendar.slug}-leads-${format(new Date(), "yyyy-MM-dd")}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting leads:", error);
    return NextResponse.json(
      { error: "Failed to export leads" },
      { status: 500 }
    );
  }
}
