import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { insertQuiz, getQuiz, getQuizResults } from "@/lib/queries";
import { turso } from "@/lib/db";

describe("Database Queries", () => {
  // Sample data for tests
  const sampleQuiz = {
    title: "Test Quiz",
    content: "Test Content",
    questions: [
      {
        id: 1,
        title: "Sample Question 1",
        options: [
          { id: 1, content: "Option 1" },
          { id: 2, content: "Option 2" },
          { id: 3, content: "Option 3" },
          { id: 4, content: "Option 4" },
        ],
        correct: 2,
      },
      {
        id: 2,
        title: "Sample Question 2",
        options: [
          { id: 5, content: "Option A" },
          { id: 6, content: "Option B" },
          { id: 7, content: "Option C" },
          { id: 8, content: "Option D" },
        ],
        correct: 1,
      },
    ],
  };

  // Clean up database before each test
  beforeEach(async () => {
    await turso.execute("DELETE FROM answers");
    await turso.execute("DELETE FROM options");
    await turso.execute("DELETE FROM questions");
    await turso.execute("DELETE FROM quizzes");
  });

  describe("insertQuiz", () => {
    it("should insert a quiz with questions and options", async () => {
      const quizId = await insertQuiz(
        sampleQuiz.title,
        sampleQuiz.content,
        sampleQuiz.questions,
      );

      expect(quizId).toBeDefined();
      expect(typeof quizId).toBe("number");

      // Verify quiz was inserted
      const { rows: quizRows } = await turso.execute({
        sql: "SELECT * FROM quizzes WHERE id = ?",
        args: [quizId],
      });
      expect(quizRows).toHaveLength(1);
      expect(quizRows[0].title).toBe(sampleQuiz.title);

      // Verify questions were inserted
      const { rows: questionRows } = await turso.execute({
        sql: "SELECT * FROM questions WHERE quiz_id = ?",
        args: [quizId],
      });
      expect(questionRows).toHaveLength(sampleQuiz.questions.length);

      // Verify options were inserted
      const { rows: optionRows } = await turso.execute({
        sql: "SELECT * FROM options WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ?)",
        args: [quizId],
      });
      expect(optionRows).toHaveLength(sampleQuiz.questions.length * 4); // 4 options per question
    });
  });

  describe("getQuiz", () => {
    it("should retrieve a quiz with all questions and options", async () => {
      // Insert a quiz first
      const quizId = await insertQuiz(
        sampleQuiz.title,
        sampleQuiz.content,
        sampleQuiz.questions,
      );

      // Retrieve the quiz
      const quiz = await getQuiz(quizId);

      expect(quiz).toBeDefined();
      expect(quiz?.id).toBe(quizId);
      expect(quiz?.questions).toHaveLength(sampleQuiz.questions.length);

      // Verify first question
      const firstQuestion = quiz?.questions[0];
      expect(firstQuestion?.title).toBe(sampleQuiz.questions[0].title);
      expect(firstQuestion?.options).toHaveLength(4);
      expect(firstQuestion?.correct).toBe(sampleQuiz.questions[0].correct);
    });

    it("should return undefined for non-existent quiz", async () => {
      const quiz = await getQuiz(999);
      expect(quiz).toBeUndefined();
    });
  });

  describe("getQuizResults", () => {
    it("should retrieve quiz results with correct scoring", async () => {
      // First insert a quiz
      const quizId = await insertQuiz(
        sampleQuiz.title,
        sampleQuiz.content,
        sampleQuiz.questions,
      );

      // Get the actual question IDs from the database
      const { rows: questionRows } = await turso.execute({
        sql: "SELECT id FROM questions WHERE quiz_id = ? ORDER BY id",
        args: [quizId],
      });

      // Get the actual option IDs from the database
      const { rows: optionRows } = await turso.execute({
        sql: "SELECT id FROM options WHERE question_id = ? AND content = ?",
        args: [questionRows[0].id, "Option 2"], // For first question, correct option
      });

      const { rows: optionRows2 } = await turso.execute({
        sql: "SELECT id FROM options WHERE question_id = ? AND content = ?",
        args: [questionRows[1].id, "Option B"], // For second question, incorrect option
      });

      // Insert answers with actual IDs
      const transaction = await turso.transaction("write");
      try {
        await transaction.execute({
          sql: "INSERT INTO answers (question_id, selected_option_id) VALUES (?, ?)",
          args: [questionRows[0].id, optionRows[0].id],
        });
        await transaction.execute({
          sql: "INSERT INTO answers (question_id, selected_option_id) VALUES (?, ?)",
          args: [questionRows[1].id, optionRows2[0].id],
        });
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }

      const results = await getQuizResults(quizId);
      expect(results).toBeDefined();
      expect(results?.quizId).toBe(quizId);
      expect(results?.total).toBe(2);
      expect(results?.score).toBe(1); // One correct answer
      expect(results?.answers).toHaveLength(2);

      const firstAnswer = results?.answers[0];
      expect(firstAnswer?.isCorrect).toBe(true);
      expect(firstAnswer?.selectedAnswer).toBeDefined();
      expect(firstAnswer?.question).toBe(sampleQuiz.questions[0].title);
    });

    it("should return undefined when no answers exist", async () => {
      const results = await getQuizResults(999);
      expect(results).toBeUndefined();
    });

    it("should handle multiple answers for the same question", async () => {
      const quizId = await insertQuiz(
        sampleQuiz.title,
        sampleQuiz.content,
        sampleQuiz.questions,
      );

      // Get the actual question and option IDs
      const { rows: questionRows } = await turso.execute({
        sql: "SELECT id FROM questions WHERE quiz_id = ? LIMIT 1",
        args: [quizId],
      });

      const { rows: optionRows } = await turso.execute({
        sql: "SELECT id FROM options WHERE question_id = ? ORDER BY id LIMIT 2",
        args: [questionRows[0].id],
      });

      // Insert both answers
      await turso.execute({
        sql: "INSERT INTO answers (question_id, selected_option_id) VALUES (?, ?)",
        args: [questionRows[0].id, optionRows[0].id],
      });

      await turso.execute({
        sql: "INSERT INTO answers (question_id, selected_option_id) VALUES (?, ?)",
        args: [questionRows[0].id, optionRows[1].id],
      });

      const results = await getQuizResults(quizId);
      expect(results?.answers).toHaveLength(2);
      // Check the positions of both answers
      expect(results?.answers[0].selectedPosition).toBe(1);
      expect(results?.answers[1].selectedPosition).toBe(2);

      // Verify other properties
      expect(results?.answers[0].questionId).toBe(questionRows[0].id);
      expect(results?.answers[1].questionId).toBe(questionRows[0].id);

      // Check if the selected answers match the options
      expect(results?.answers[0].selectedAnswer).toBeDefined();
      expect(results?.answers[1].selectedAnswer).toBeDefined();
    });
  });
  // Clean up after all tests
  afterEach(async () => {
    await turso.execute("DELETE FROM answers");
    await turso.execute("DELETE FROM options");
    await turso.execute("DELETE FROM questions");
    await turso.execute("DELETE FROM quizzes");
  });
});
