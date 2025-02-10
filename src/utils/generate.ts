"use server";

import { client } from "@/utils/client";
import { Quiz, quizSchema } from "@/utils/schemas";

// The maximum number of retries for the server to do
const MAX_RETRIES = 3;

export async function generateQuizFromMistral(
  title: string,
  content: string,
  prompt: string,
  retryCount = 0,
): Promise<Quiz | undefined> {
  try {
    const result = await client.chat.complete({
      model: "mistral-tiny",
      messages: [{ role: "user", content: prompt }],
      responseFormat: { type: "json_object" },
    });

    if (!result.choices?.[0]?.message?.content) {
      throw new Error("No content from model");
    }

    const parsedContent = JSON.parse(
      result.choices[0].message.content.toString(),
    );
    const validatedQuiz = quizSchema.safeParse(parsedContent);

    console.log(validatedQuiz);

    if (validatedQuiz.error) {
      throw new Error(validatedQuiz.error.toString());
    }

    return validatedQuiz.data;
  } catch (error) {
    console.log(error);
    if (retryCount < MAX_RETRIES) {
      return generateQuizFromMistral(title, content, prompt, retryCount + 1);
    }
    throw new Error("Could not generate quiz");
  }
}
