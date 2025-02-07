import { Answer } from "./schemas";

export interface QuizAttempt {
  title: string;
  content: string;
  answers: Answer[];
  timestamp: Date;
}

/**
 * For actually checking my answers I could just add them to an answers object
 * Then at the end of the quiz I can check with the quiz object I have in memory
 *
 * if the memory approach fails or is too hard I will make a sqlite db just to store the
 * entire quiz and check from a backend call like /check to get the correct answers
 * **/
