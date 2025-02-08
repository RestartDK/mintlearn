import { openDb } from "@/lib/db";
import { answersSchema } from "@/utils/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { answers } = answersSchema.parse(body);
    const db = await openDb();

    try {
      await db.run("BEGIN TRANSACTION");

      // Save answers
      for (const answer of answers) {
        await db.run(
          "INSERT INTO answers (question_id, selected_option_id) VALUES (?, ?)",
          [answer.questionId, answer.selectedOptionId],
        );
      }

      // Get results using the position column
      await db.all(`
        SELECT
          a.question_id as questionId,
          q.title as question,
          q.correct as correctPosition,
          o.position as selectedPosition,
          o.content as selectedAnswer,
          CASE WHEN q.correct = o.position THEN 1 ELSE 0 END as isCorrect
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        JOIN options o ON a.selected_option_id = o.id
        WHERE a.id IN (
          SELECT MAX(id)
          FROM answers
          GROUP BY question_id
        )
        ORDER BY a.question_id
      `);

      await db.run("COMMIT");

      return Response.json("Answers have been populated", { status: 201 });
    } catch (error) {
      await db.run("ROLLBACK");
      throw error;
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to save answers" }, { status: 500 });
  }
}
