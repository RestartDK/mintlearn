// TODO: Need to generate a new type for the quiz instead of zod schema to include the ID of the quiz, then go to the server component and do the get quiz id to get the id from the query you will make now, put that into the component, then make sure to include the id of the quiz for when you push router in the quiz view component, then add the form at the start page, finally test, then add the retry and new button
import { generateQuizFromMistral } from "@/utils/queries";
import { chatSchema } from "@/utils/schemas";
import { generateQuizPrompt } from "@/utils/prompts";
import { openDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = chatSchema.safeParse(body);
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

    const db = await openDb();

    try {
      // Start transaction
      await db.run("BEGIN TRANSACTION");

      // Insert quiz
      const quizResult = await db.run(
        "INSERT INTO quizzes (title, content) VALUES (?, ?)",
        [title, content],
      );
      const quizId = quizResult.lastID;

      // Insert questions and options
      for (const question of generatedQuiz.questions) {
        const questionResult = await db.run(
          "INSERT INTO questions (quiz_id, title, correct) VALUES (?, ?, ?)",
          [quizId, question.title, question.correct],
        );
        const questionId = questionResult.lastID;

        // Insert options
        for (const option of question.options) {
          await db.run(
            "INSERT INTO options (question_id, content) VALUES (?, ?)",
            [questionId, option.content],
          );
        }
      }

      // Get the complete quiz with all relations
      const savedQuiz = await db.get(
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

      // Commit transaction
      await db.run("COMMIT");

      // Parse the questions JSON string
      const parsedQuiz = {
        ...savedQuiz,
        questions: JSON.parse(savedQuiz.questions),
      };

      return Response.json(parsedQuiz, { status: 200 });
    } catch (error) {
      // Rollback on error
      await db.run("ROLLBACK");
      throw error;
    } finally {
      await db.close();
    }
  } catch (e) {
    console.log(e);
    return Response.json({ message: "Something went wrong" }, { status: 500 });
  }
}
