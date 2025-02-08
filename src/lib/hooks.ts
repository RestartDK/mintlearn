// TODO: Right now the response endpoint does not work
import { Answer, Quiz } from "@/utils/schemas";
import { QuizResults } from "@/utils/types";

export async function generateQuiz(
  title: string,
  content: string,
): Promise<Quiz> {
  const response = await fetch(`/api/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });

  if (!response.ok) {
    throw new Error("Something went wrong");
  }

  const quiz = (await response.json()) as Quiz;
  return quiz;
}

export async function generateRetryQuiz(results: QuizResults): Promise<Quiz> {
  console.log(results);
  const response = await fetch(`/api/retry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(results),
  });

  if (!response.ok) {
    throw new Error("Something went wrong");
  }

  const quiz = (await response.json()) as Quiz;
  return quiz;
}

export async function submitAnswers(answers: Answer[]): Promise<QuizResults> {
  // Remember this is all on the client side
  console.log("Here are the answers");
  console.log(answers);
  const response = await fetch(`/api/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  console.log("Response from the server");
  console.log(answers);

  if (!response.ok) {
    throw new Error("Something went wrong");
  }
  console.log(response);

  const results = (await response.json()) as QuizResults;
  return results;
}
