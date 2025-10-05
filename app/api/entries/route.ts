import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateQuizAnswers } from "@/lib/ai/quiz-orchestrator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      calendarId,
      doorId,
      email,
      name,
      phone,
      marketingConsent,
      termsAccepted,
      privacyPolicyAccepted,
      quizAnswers,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "E-post er påkrevd" }, { status: 400 });
    }

    // GDPR validation
    if (!termsAccepted) {
      return NextResponse.json({ error: "Du må godta vilkårene" }, { status: 400 });
    }

    if (!privacyPolicyAccepted) {
      return NextResponse.json({ error: "Du må godta personvernerklæringen" }, { status: 400 });
    }

    // Check if calendar exists and is active
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
    });

    if (!calendar) {
      return NextResponse.json({ error: "Kalender ikke funnet" }, { status: 404 });
    }

    if (calendar.status !== "ACTIVE" && calendar.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Kalenderen er ikke aktiv" },
        { status: 400 }
      );
    }

    // Check if door exists
    const door = await prisma.door.findUnique({
      where: { id: doorId },
      include: {
        winner: true,
        questions: true,
      },
    });

    if (!door) {
      return NextResponse.json({ error: "Luke ikke funnet" }, { status: 404 });
    }

    // Check if door is open
    if (new Date() < door.openDate) {
      return NextResponse.json({ error: "Luken er ikke åpnet ennå" }, { status: 400 });
    }

    // Check if winner already selected
    if (door.winner) {
      return NextResponse.json(
        { error: "Vinner er allerede trukket for denne luken" },
        { status: 400 }
      );
    }

    // Get IP and User Agent for tracking
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
    const userAgent = req.headers.get("user-agent") || null;

    // Find or create lead
    let lead = await prisma.lead.findFirst({
      where: {
        email: email.toLowerCase(),
        calendarId,
      },
    });

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          email: email.toLowerCase(),
          name: name || null,
          phone: phone || null,
          calendarId,
          ipAddress,
          userAgent,
          marketingConsent: marketingConsent || false,
          termsAccepted: termsAccepted || false,
          privacyPolicyAccepted: privacyPolicyAccepted || false,
          consentTimestamp: new Date(),
        },
      });
    } else {
      // Update lead info and consent if provided
      const updateData: any = {};

      if (name && !lead.name) {
        updateData.name = name;
      }
      if (phone && !lead.phone) {
        updateData.phone = phone;
      }

      // Update consent information (user can update their consent)
      if (termsAccepted !== undefined) {
        updateData.termsAccepted = termsAccepted;
      }
      if (privacyPolicyAccepted !== undefined) {
        updateData.privacyPolicyAccepted = privacyPolicyAccepted;
      }
      if (marketingConsent !== undefined) {
        updateData.marketingConsent = marketingConsent;
      }

      // Update consent timestamp if any consent changed
      if (termsAccepted || privacyPolicyAccepted || marketingConsent !== undefined) {
        updateData.consentTimestamp = new Date();
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: updateData,
        });
      }
    }

    // Validate quiz if enabled
    let quizScore: number | null = null;
    let quizPassed = false;
    let questionAnswers: Array<{
      questionId: string;
      answer: string;
      isCorrect: boolean;
    }> = [];

    if (door.enableQuiz && door.questions.length > 0) {
      if (!quizAnswers || !Array.isArray(quizAnswers)) {
        return NextResponse.json(
          { error: "Quiz svar er påkrevd" },
          { status: 400 }
        );
      }

      // Validate quiz answers
      const validation = await validateQuizAnswers(
        door.questions.map((q) => ({
          id: q.id,
          type: q.type,
          correctAnswer: q.correctAnswer,
          caseSensitive: q.caseSensitive,
          acceptableAnswers: q.acceptableAnswers as string[] | null,
        })),
        quizAnswers
      );

      quizScore = validation.percentage;
      quizPassed = quizScore >= door.quizPassingScore;
      questionAnswers = validation.results;

      // If retry is not allowed and quiz not passed, reject entry
      if (!quizPassed && !door.allowRetry) {
        return NextResponse.json(
          {
            error: `Du må ha minst ${door.quizPassingScore}% riktige svar for å delta`,
            quizResult: {
              score: quizScore,
              passed: quizPassed,
              results: door.showCorrectAnswers ? questionAnswers : undefined,
            },
          },
          { status: 400 }
        );
      }
    }

    // Check if already entered this door
    const existingEntry = await prisma.doorEntry.findUnique({
      where: {
        leadId_doorId: {
          leadId: lead.id,
          doorId,
        },
      },
    });

    if (existingEntry) {
      if (calendar.allowMultipleEntries) {
        // Allow multiple entries - just return success
        return NextResponse.json({ success: true, message: "Ekstra deltakelse registrert" });
      } else {
        return NextResponse.json(
          { error: "Du har allerede deltatt i denne konkurransen" },
          { status: 400 }
        );
      }
    }

    // Create door entry with quiz results
    const doorEntry = await prisma.doorEntry.create({
      data: {
        leadId: lead.id,
        doorId,
        quizScore,
        quizPassed,
        eligibleForWinner: quizPassed || !door.enableQuiz,
      },
    });

    // Create quiz answer records if quiz was taken
    if (door.enableQuiz && questionAnswers.length > 0) {
      await prisma.questionAnswer.createMany({
        data: questionAnswers.map((qa) => ({
          doorEntryId: doorEntry.id,
          questionId: qa.questionId,
          answer: qa.userAnswer || qa.answer || "", // Support both field names
          isCorrect: qa.isCorrect,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Deltakelsen er registrert",
      quizResult: door.enableQuiz
        ? {
            score: quizScore,
            passed: quizPassed,
            results: door.showCorrectAnswers ? questionAnswers : undefined,
          }
        : undefined,
    });
  } catch (error) {
    console.error("Error creating entry:", error);
    return NextResponse.json(
      { error: "Kunne ikke registrere deltakelse" },
      { status: 500 }
    );
  }
}
