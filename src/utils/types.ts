import { Answer } from "./schemas";

export interface QuizAnswer {
  questionId: number;
  question: string;
  correctPosition: number;
  selectedPosition: number;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface QuizContent {
  title: string;
  content: string;
}

export interface QuizAttempt {
  title: string;
  content: string;
  answers: Answer[];
  timestamp: Date;
}

export interface QuizResults {
  quizId: number;
  score: number;
  total: number;
  answers: QuizAnswer[];
}
