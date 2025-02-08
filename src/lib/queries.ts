"server-only";

import { Question, Quiz } from "@/utils/schemas";
import { openDb } from "./db";
import { QuizResults } from "@/utils/types";

export async function getQuizResults(
  quizId: number,
): Promise<QuizResults | null> {
  const db = await openDb();
  try {
    const results = await db.all(
      `
      SELECT
        a.question_id as questionId,
        q.title as question,
        q.correct as correctPosition,
        o1.position as selectedPosition,
        o1.content as selectedAnswer,
        (
          SELECT o2.content
          FROM options o2
          WHERE o2.question_id = q.id
          AND o2.position = q.correct
        ) as correctAnswer,
        CASE WHEN q.correct = o1.position THEN 1 ELSE 0 END as isCorrect
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      JOIN options o1 ON a.selected_option_id = o1.id
      WHERE q.quiz_id = ?
      ORDER BY a.question_id
    `,
      [quizId],
    );

    if (results.length === 0) {
      return null;
    }

    const score = results.filter((r) => r.isCorrect).length;
    const total = results.length;

    // Convert isCorrect to boolean in the mapped results
    const answers = results.map((result) => ({
      ...result,
      isCorrect: result.isCorrect === 1,
    }));

    return {
      quizId,
      score,
      total,
      answers: answers,
    };
  } finally {
    await db.close();
  }
}

export async function getQuiz(quizId: number): Promise<Quiz | null> {
  const db = await openDb();
  try {
    const result = await db.get(
      `
      SELECT 
        q.*,
        json_group_array(
          json_object(
            'id', qu.id,
            'title', qu.title,
            'correct', qu.correct,
            'options', (
              SELECT json_group_array(
                json_object(
                  'id', o.id,
                  'content', o.content
                )
              )
              FROM options o
              WHERE o.question_id = qu.id
            )
          )
        ) as questions
      FROM quizzes q
      LEFT JOIN questions qu ON q.id = qu.quiz_id
      WHERE q.id = ?
      GROUP BY q.id
    `,
      [quizId],
    );

    // Handle undefined/null case
    if (!result) return null;

    // Parse the JSON string in questions
    return {
      ...result,
      questions: JSON.parse(result.questions),
    };
  } finally {
    await db.close();
  }
}

export async function insertQuiz(
  title: string,
  content: string,
  questions: Question[],
) {
  const db = await openDb();
  try {
    await db.run("BEGIN TRANSACTION");

    // Insert quiz
    const quizResult = await db.run(
      "INSERT INTO quizzes (title, content) VALUES (?, ?)",
      [title, content],
    );
    const quizId = quizResult.lastID;

    // Insert questions and options
    for (const question of questions) {
      const questionResult = await db.run(
        "INSERT INTO questions (quiz_id, title, correct) VALUES (?, ?, ?)",
        [quizId, question.title, question.correct],
      );
      const questionId = questionResult.lastID;

      // Insert options with positions
      for (const [index, option] of question.options.entries()) {
        await db.run(
          "INSERT INTO options (question_id, content, position) VALUES (?, ?, ?)",
          [questionId, option.content, index + 1],
        );
      }
    }

    await db.run("COMMIT");
    return quizId;
  } catch (error) {
    await db.run("ROLLBACK");
    throw error;
  } finally {
    await db.close();
  }
}
