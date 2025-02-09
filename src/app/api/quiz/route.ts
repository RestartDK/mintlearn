import { generateQuizFromMistral } from "@/utils/generate";
import { chatSchema } from "@/utils/schemas";
import { generateQuizPrompt } from "@/utils/prompts";
import { getQuiz, insertQuiz } from "@/lib/queries";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = chatSchema.safeParse(body);
    console.log(data);
    if (!data.success) {
      return Response.json({ message: "Invalid input" }, { status: 400 });
    }

    const { title, content } = data.data;
    const prompt = generateQuizPrompt(title, content);
    const generatedQuiz = await generateQuizFromMistral(title, content, prompt);

    if (!generatedQuiz) {
      return Response.json(
        { message: "Failed to generate quiz" },
        { status: 400 },
      );
    }

    const quizId = await insertQuiz(title, content, generatedQuiz.questions);
    console.log(quizId);

    if (!quizId) {
      return Response.json("Failed to save quiz", { status: 500 });
    }

    const quiz = await getQuiz(quizId);

    if (!quiz) {
      return Response.json("Failed to find quiz", { status: 400 });
    }

    return Response.json(quiz, { status: 201 });
  } catch (e) {
    console.log(e);
    return Response.json({ message: "Something went wrong" }, { status: 500 });
  }
}
