import { generateQuizFromMistral } from "@/utils/queries";
import { generateAdaptiveQuizPrompt } from "@/utils/prompts";
import { QuizContent, QuizResults } from "@/utils/types";
import { openDb } from "@/lib/db";
import { getQuiz, insertQuiz } from "@/lib/queries";

export async function POST(req: Request) {
  try {
    const results = (await req.json()) as QuizResults;
    console.log(results);

    const { quizId } = results;

    const db = await openDb();

    const currentQuiz: QuizContent | undefined = await db.get(
      "SELECT title, content from quizzes where id = ?",
      [quizId],
    );

    console.log(currentQuiz);

    if (!currentQuiz) {
      return Response.json(
        { error: "Original quiz not found" },
        { status: 404 },
      );
    }

    if (results) {
      const prompt = generateAdaptiveQuizPrompt(
        currentQuiz.title,
        currentQuiz.content,
        results,
      );

      const generatedQuiz = await generateQuizFromMistral(
        currentQuiz.title,
        currentQuiz.content,
        prompt,
      );

      console.log("We will generate a quiz");
      console.log(generatedQuiz);

      if (!generatedQuiz) {
        return Response.json(
          { message: "Failed to generate quiz" },
          { status: 400 },
        );
      }

      const quizId = await insertQuiz(
        currentQuiz.title,
        currentQuiz.content,
        generatedQuiz.questions,
      );

      if (!quizId) {
        return Response.json("Failed to save quiz", { status: 500 });
      }

      const quiz = await getQuiz(quizId);

      if (!quiz) {
        return Response.json("Failed to find quiz", { status: 400 });
      }

      // redirect(`/quiz/${quiz.id}`);
      return Response.json(quiz, { status: 200 });
    }
  } catch (e) {
    console.log(e);
    return Response.json({ message: "Something went wrong" }, { status: 500 });
  }
}
