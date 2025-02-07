"server-only";

import { openDb } from "./db";

export async function getQuizResults(quizId: number) {
  const db = await openDb();
  try {
    return await db.all(
      `
      SELECT
        a.question_id,
        q.title as question,
        q.correct,
        a.selected_option_id,
        o.content as selected_answer,
        CASE WHEN q.correct = a.selected_option_id THEN 1 ELSE 0 END as is_correct
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      JOIN options o ON a.selected_option_id = o.id
      WHERE q.quiz_id = ?
      ORDER BY a.question_id
    `,
      [quizId],
    );
  } finally {
    await db.close();
  }
}
