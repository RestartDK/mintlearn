import { generateQuizFromMistral } from "@/utils/queries";
import { chatSchema } from "@/utils/schemas";
import { generateAdaptiveQuizPrompt } from "@/utils/prompts";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = chatSchema.safeParse(body);

    if (!data.success) {
      console.log(data.error);
      return Response.json({ message: "Invalid input" }, { status: 400 });
    }

    const { title, content } = data.data;

    const answers = data.data.answers;
    if (answers) {
      const prompt = generateAdaptiveQuizPrompt(title, content, answers);
      console.log(prompt);
      const quiz = await generateQuizFromMistral(title, content, prompt);

      if (!quiz) {
        return Response.json(
          { message: "Failed to generate quiz" },
          { status: 400 },
        );
      }

      return Response.json(quiz, { status: 200 });
    }
  } catch (e) {
    console.log(e);
    return Response.json({ message: "Something went wrong" }, { status: 500 });
  }
}
