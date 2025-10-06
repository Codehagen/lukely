import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const QuizSchema = z.object({
  questions: z.array(
    z.object({
      type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "TEXT", "RATING"]),
      questionText: z.string().describe("Question in Norwegian (Bokmål)"),
      correctAnswer: z.union([z.string(), z.number()]).optional().describe("The correct answer (not needed for RATING questions)"),
      options: z
        .array(z.string())
        .optional()
        .describe("Options in Norwegian for multiple choice (4 options)"),
      points: z.number().default(1),
    })
  ),
});

export type GeneratedQuestion = z.infer<typeof QuizSchema>["questions"][number];

export interface DoorInfo {
  doorNumber: number;
  productName?: string;
  productDescription?: string;
  theme?: "CHRISTMAS" | "VALENTINE" | "EASTER" | "CUSTOM";
}

export async function generateDoorQuiz(
  doorInfo: DoorInfo,
  instructions?: string,
  questionCount: number = 3
): Promise<GeneratedQuestion[]> {
  const themeContext = {
    CHRISTMAS: "julekalender og norske juletradisjoner",
    VALENTINE: "valentinsdagen og kjærlighet",
    EASTER: "påske og norske påsketradisjoner",
    CUSTOM: "denne spesielle anledningen",
  }[doorInfo.theme || "CUSTOM"];

  const prompt = `
Generer en quiz for luke ${doorInfo.doorNumber} i en ${themeContext}.
${doorInfo.productName ? `Premie: ${doorInfo.productName}` : ""}
${doorInfo.productDescription ? `Beskrivelse: ${doorInfo.productDescription}` : ""}

${instructions || `Lag ${questionCount} engasjerende spørsmål relatert til temaet.`}

VIKTIGE REGLER:
- Skriv ALT på norsk (bokmål)
- Lag spørsmål som er morsomme og festlige
- Inkluder en blanding av lett og middels vanskelig
- For flervalg: lag NØYAKTIG 4 alternativer hvor ETT er riktig
- Spørsmålene skal ta 30-60 sekunder å svare på
- Hold det lett og hyggelig
- correctAnswer skal være:
  * For MULTIPLE_CHOICE: indeks (0-3) av riktig alternativ
  * For TRUE_FALSE: "true" eller "false"
  * For TEXT: det nøyaktige svaret (lowercase, uten punktum)
  * For RATING: ikke nødvendig (subjektivt spørsmål uten riktig svar)

EKSEMPLER PÅ GODE SPØRSMÅL:
- "Hva er den mest populære juletradisjonen i Norge?"
- "Hvilket år ble den første adventskalenderen laget?"
- "Sant eller usant: Julenissen bor på Nordpolen"
  `.trim();

  try {
    const result = await generateObject({
      model: openai("gpt-4o"),
      system:
        "Du er en ekspert på å lage engasjerende quizer på norsk. Du lager alltid festlige, morsomme spørsmål som folk liker å svare på. Du skriver ALLTID på norsk (bokmål).",
      prompt,
      schema: QuizSchema,
    });

    // Convert correctAnswer to string for consistency (use "3" for RATING if not provided)
    const questions = result.object.questions.slice(0, questionCount).map(q => ({
      ...q,
      correctAnswer: q.correctAnswer !== undefined ? String(q.correctAnswer) : (q.type === "RATING" ? "3" : ""),
    }));

    return questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Kunne ikke generere quiz. Prøv igjen.");
  }
}

export interface BulkDoorInfo {
  doorId: string;
  doorNumber: number;
  productName?: string | null;
  productDescription?: string | null;
}

export async function generateAllDoorQuizzes(
  calendarType: "CHRISTMAS" | "VALENTINE" | "EASTER" | "CUSTOM",
  doors: BulkDoorInfo[],
  instructions?: string,
  questionCount: number = 3
): Promise<Map<string, GeneratedQuestion[]>> {
  const results = new Map<string, GeneratedQuestion[]>();

  for (const door of doors) {
    try {
      const doorInfo: DoorInfo = {
        doorNumber: door.doorNumber,
        productName: door.productName || undefined,
        productDescription: door.productDescription || undefined,
        theme: calendarType,
      };

      const questions = await generateDoorQuiz(doorInfo, instructions, questionCount);
      results.set(door.doorId, questions);
    } catch (error) {
      console.error(`Failed to generate quiz for door ${door.doorNumber}:`, error);
      // Continue with other doors even if one fails
      results.set(door.doorId, []);
    }
  }

  return results;
}

export async function validateQuizAnswers(
  questions: Array<{
    id: string;
    type: string;
    correctAnswer: string | null;
    caseSensitive: boolean;
    acceptableAnswers: string[] | null;
  }>,
  answers: Array<{
    questionId: string;
    answer: string;
  }>
): Promise<{
  score: number;
  totalPoints: number;
  percentage: number;
  results: Array<{
    questionId: string;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string | null;
  }>;
}> {
  let correctPoints = 0;
  let totalPoints = 0;
  const results = [];

  for (const question of questions) {
    totalPoints += 1; // Each question is worth 1 point

    const userAnswer = answers.find((a) => a.questionId === question.id);
    if (!userAnswer) {
      results.push({
        questionId: question.id,
        isCorrect: false,
        userAnswer: "",
        correctAnswer: question.correctAnswer,
      });
      continue;
    }

    let isCorrect = false;
    const userAnswerNormalized = question.caseSensitive
      ? userAnswer.answer.trim()
      : userAnswer.answer.trim().toLowerCase();
    const correctAnswerNormalized = question.caseSensitive
      ? question.correctAnswer?.trim() || ""
      : question.correctAnswer?.trim().toLowerCase() || "";

    // Check if answer is correct
    if (question.type === "TEXT") {
      // For text answers, check exact match or acceptable answers
      isCorrect = userAnswerNormalized === correctAnswerNormalized;

      if (!isCorrect && question.acceptableAnswers) {
        const acceptable = Array.isArray(question.acceptableAnswers)
          ? question.acceptableAnswers
          : [];
        isCorrect = acceptable.some((acc) => {
          const accNormalized = question.caseSensitive
            ? acc.trim()
            : acc.trim().toLowerCase();
          return userAnswerNormalized === accNormalized;
        });
      }
    } else {
      // For other types, exact match
      isCorrect = userAnswerNormalized === correctAnswerNormalized;
    }

    if (isCorrect) {
      correctPoints += 1;
    }

    results.push({
      questionId: question.id,
      isCorrect,
      userAnswer: userAnswer.answer,
      correctAnswer: question.correctAnswer,
    });
  }

  const percentage = totalPoints > 0 ? (correctPoints / totalPoints) * 100 : 0;

  return {
    score: correctPoints,
    totalPoints,
    percentage,
    results,
  };
}
