import { z } from "zod";

// Schema for inputting answers
export const answerSchema = z.object({
  questionId: z.number(),
  selectedOptionId: z.number(),
  question: z.string(),
});

export const answersSchema = z.object({
  answers: z.array(answerSchema),
});

export const chatSchema = z.object({
  title: z.string(),
  content: z.string(),
  answers: z.array(answerSchema).optional(),
});

// Option Schema
const optionSchema = z.object({
  id: z.number().int().positive(),
  content: z.string().min(1),
});

// Question Schema
const questionSchema = z
  .object({
    id: z.number().int().positive(),
    title: z.string().min(1),
    options: z
      .array(optionSchema)
      .length(4, "Each question must have exactly 4 options"),
    correct: z.number().int().min(1).max(4), // Now accepts integers 1-4
  })
  .refine(
    (question) =>
      question.options.some((option) => option.id === question.correct),
    "The correct answer must match one of the option IDs",
  );

// Full Quiz Schema
export const quizSchema = z.object({
  questions: z
    .array(questionSchema)
    .min(1, "Quiz must have at least one question"),
});

// Type inference
export type Option = z.infer<typeof optionSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Quiz = z.infer<typeof quizSchema>;
export type Answer = z.infer<typeof answerSchema>;
