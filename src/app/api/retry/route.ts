import { generateQuizFromMistral } from "@/utils/generate";
import { generateAdaptiveQuizPrompt } from "@/utils/prompts";
import { QuizContent, QuizResults } from "@/utils/types";
import { getQuiz, insertQuiz } from "@/lib/queries";
import { turso } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const results = (await req.json()) as QuizResults;
    console.log(results);

    const { quizId } = results;

    console.log("we are looking at this quiz", quizId);

    const { rows } = await turso.execute({
      sql: "SELECT title, content from quizzes where id = ?",
      args: [quizId],
    });

    console.log(rows);

    if (!rows) {
      return Response.json(
        { error: "Original quiz not found" },
        { status: 404 },
      );
    }

    // Type casting quiz
    const currentQuiz = rows[0] as unknown as QuizContent;

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
