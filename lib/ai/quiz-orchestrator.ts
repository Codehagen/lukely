import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const QuizSchema = z.object({
  questions: z.array(
    z.object({
      type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "TEXT", "RATING"]),
      questionText: z.string().describe("Question text in the specified language"),
      correctAnswer: z.string().describe("The correct answer"),
      options: z
        .array(z.string())
        .optional()
        .describe("Options for multiple choice in the specified language (4 options)"),
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
  locale?: string; // 'no' or 'en'
}

export async function generateDoorQuiz(
  doorInfo: DoorInfo,
  instructions?: string,
  questionCount: number = 3
): Promise<GeneratedQuestion[]> {
  const locale = doorInfo.locale || 'no';
  const isNorwegian = locale === 'no';

  const themeContext = isNorwegian ? {
    CHRISTMAS: "julekalender og norske juletradisjoner",
    VALENTINE: "valentinsdagen og kjærlighet",
    EASTER: "påske og norske påsketradisjoner",
    CUSTOM: "denne spesielle anledningen",
  } : {
    CHRISTMAS: "Christmas calendar and holiday traditions",
    VALENTINE: "Valentine's Day and love",
    EASTER: "Easter and Easter traditions",
    CUSTOM: "this special occasion",
  };

  const languageInstruction = isNorwegian ? "norsk (bokmål)" : "English";

  const prompt = isNorwegian ? `
Generer en quiz for luke ${doorInfo.doorNumber} i en ${themeContext[doorInfo.theme || "CUSTOM"]}.
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
  * For RATING: tallet (1-5)

EKSEMPLER PÅ GODE SPØRSMÅL:
- "Hva er den mest populære juletradisjonen i Norge?"
- "Hvilket år ble den første adventskalenderen laget?"
- "Sant eller usant: Julenissen bor på Nordpolen"
  `.trim() : `
Generate a quiz for door ${doorInfo.doorNumber} for a ${themeContext[doorInfo.theme || "CUSTOM"]}.
${doorInfo.productName ? `Prize: ${doorInfo.productName}` : ""}
${doorInfo.productDescription ? `Description: ${doorInfo.productDescription}` : ""}

${instructions || `Create ${questionCount} engaging questions related to the theme.`}

IMPORTANT RULES:
- Write EVERYTHING in English
- Make questions fun and festive
- Include a mix of easy and medium difficulty
- For multiple choice: create EXACTLY 4 options where ONE is correct
- Questions should take 30-60 seconds to answer
- Keep it light and enjoyable
- correctAnswer should be:
  * For MULTIPLE_CHOICE: index (0-3) of correct option
  * For TRUE_FALSE: "true" or "false"
  * For TEXT: the exact answer (lowercase, without punctuation)
  * For RATING: the number (1-5)

EXAMPLES OF GOOD QUESTIONS:
- "What is the most popular Christmas tradition?"
- "In which year was the first advent calendar created?"
- "True or false: Santa Claus lives at the North Pole"
  `.trim();

  const systemMessage = isNorwegian
    ? "Du er en ekspert på å lage engasjerende quizer på norsk. Du lager alltid festlige, morsomme spørsmål som folk liker å svare på. Du skriver ALLTID på norsk (bokmål)."
    : "You are an expert at creating engaging quizzes in English. You always create festive, fun questions that people enjoy answering. You ALWAYS write in English.";

  try {
    const result = await generateObject({
      model: openai("gpt-4o"),
      system: systemMessage,
      prompt,
      schema: QuizSchema,
    });

    return result.object.questions.slice(0, questionCount);
  } catch (error) {
    console.error("Error generating quiz:", error);
    const errorMessage = isNorwegian
      ? "Kunne ikke generere quiz. Prøv igjen."
      : "Could not generate quiz. Please try again.";
    throw new Error(errorMessage);
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
