import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { analyzeWebsite } from "@/lib/ai/website-analyzer";
import { z } from "zod";

const RequestSchema = z.object({
  url: z.string().url("Ugyldig URL-format"),
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Du må være logget inn for å bruke denne funksjonen" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors?.[0]?.message || "Ugyldig forespørsel" },
        { status: 400 }
      );
    }

    const { url } = validation.data;

    // Analyze website
    const analysis = await analyzeWebsite(url);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Error in analyze-website API:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Kunne ikke analysere nettsiden. Prøv igjen.";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
