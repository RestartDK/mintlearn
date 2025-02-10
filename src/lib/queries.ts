"server-only";
import { Answer, Question, Quiz } from "@/utils/schemas";
import { turso } from "./db";
import { QuizAnswer, QuizResults } from "@/utils/types";

export async function initDb() {
  try {
    // Create tables one at a time
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER,
        title TEXT NOT NULL,
        correct INTEGER NOT NULL,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
      )
    `);

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER,
        position INTEGER NOT NULL,
        content TEXT NOT NULL,
        FOREIGN KEY (question_id) REFERENCES questions(id)
      )
    `);

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER,
        selected_option_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id),
        FOREIGN KEY (selected_option_id) REFERENCES options(id)
      )
    `);
  } catch (error) {
    throw error;
  }
}
export async function getQuizResults(
  quizId: number,
): Promise<QuizResults | undefined> {
  const { rows } = await turso.execute({
    sql: `
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
    args: [quizId],
  });

  if (!rows.length) return undefined;

  const score = rows.filter((r) => r.isCorrect).length;
  const booleanAnswers = rows.map((row) => ({
    ...row,
    isCorrect: row.isCorrect === 1,
  }));

  // Type assertion here
  const answers = booleanAnswers as unknown as QuizAnswer[];

  return {
    quizId,
    score,
    total: rows.length,
    answers,
  };
}

export async function getQuiz(quizId: number): Promise<Quiz | undefined> {
  const { rows } = await turso.execute({
    sql: `
      SELECT
        q.id,
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
    args: [quizId],
  });

  if (!rows.length) return undefined;

  const row = rows[0] as unknown as Quiz;

  return {
    id: row.id,
    questions: JSON.parse(row.questions as unknown as string), // We know for sure it is a string because of json from sql query
  };
}

export async function insertQuiz(
  title: string,
  content: string,
  questions: Question[],
): Promise<number> {
  const transaction = await turso.transaction("write");
  try {
    // Insert quiz
    const { lastInsertRowid } = await transaction.execute({
      sql: "INSERT INTO quizzes (title, content) VALUES (?, ?)",
      args: [title, content],
    });
    const quizId = Number(lastInsertRowid);

    // Insert questions and options using batch
    const questionInserts = questions.map((question) => ({
      sql: "INSERT INTO questions (quiz_id, title, correct) VALUES (?, ?, ?)",
      args: [quizId, question.title, question.correct],
    }));

    const questionResults = await transaction.batch(questionInserts);

    // Get the question IDs from the batch results
    const questionIds = questionResults.map((result) =>
      Number(result.lastInsertRowid),
    );

    // Insert options for each question using the correct questionId
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionId = questionIds[i];

      const optionInserts = question.options.map((option, index) => ({
        sql: "INSERT INTO options (question_id, content, position) VALUES (?, ?, ?)",
        args: [questionId, option.content, index + 1],
      }));

      await transaction.batch(optionInserts);
    }

    await transaction.commit();

    return quizId;
  } catch (error) {
    console.error("Error during quiz insertion:", error);
    await transaction.rollback();
    throw error;
  }
}

export async function insertAnswers(answers: Answer[]) {
  const transaction = await turso.transaction("write");

  try {
    // Save answers
    const answerInserts = answers.map((answer) => ({
      sql: "INSERT INTO answers (question_id, selected_option_id) VALUES (?, ?)",
      args: [answer.questionId, answer.selectedOptionId],
    }));

    await transaction.batch(answerInserts);
    await transaction.commit();

    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
