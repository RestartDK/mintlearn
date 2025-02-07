import { openDb } from "@/lib/db";
import { answersSchema } from "@/utils/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // TODO: Validation if bothered
    const { answers } = answersSchema.parse(body);
    const db = await openDb();

    // Save answers with selected option IDs
    for (const answer of answers) {
      await db.run(
        "INSERT INTO answers (question_id, selected_option_id) VALUES (?, ?)",
        [answer.questionId, answer.selectedOptionId],
      );
    }

    // Query to get correct/incorrect answers
    const results = await db.all(`
      SELECT 
        a.question_id,
        q.title as question,
        CASE WHEN q.correct = a.selected_option_id THEN 1 ELSE 0 END as is_correct
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.id IN (
        SELECT MAX(id) 
        FROM answers 
        GROUP BY question_id
      )
    `);

    await db.close();
    return Response.json(results, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to save answers" }, { status: 500 });
  }
}
