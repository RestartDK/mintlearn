import { Answer } from "./schemas";

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
  answers: {
    questionId: number;
    question: string;
    correctPosition: number;
    selectedPosition: number;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}
