import { answersSchema } from "@/utils/schemas";
import { insertAnswers } from "@/lib/queries";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { answers } = answersSchema.parse(body);

    await insertAnswers(answers);

    return Response.json(
      { message: "Answers have been populated" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error saving answers:", error);

    return Response.json({ error: "Failed to save answers" }, { status: 500 });
  }
}
