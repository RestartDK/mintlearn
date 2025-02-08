"use client";

import { Answer, Quiz } from "@/utils/schemas";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitAnswers } from "@/lib/hooks";

export function QuizView({ quiz }: { quiz: Quiz }) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const router = useRouter();

  const handleAnswer = (
    questionId: number,
    optionId: number,
    questionTitle: string,
  ) => {
    setAnswers((prev) => {
      // Remove previous answer for this question if it exists
      const filtered = prev.filter((a) => a.questionId !== questionId);
      // Add new answer
      return [
        ...filtered,
        {
          questionId,
          selectedOptionId: optionId,
          question: questionTitle,
        },
      ];
    });
  };

  async function handleSubmit() {
    try {
      // TODO: Remove variable here and instead just await
      const response = await submitAnswers(answers);

      console.log(response);

      // Redirect to results page with quiz ID
      router.push(`/quiz/${quiz.id}/results`);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  // Helper function to get selected option for a question
  const getSelectedOption = (questionId: number) => {
    return answers.find((a) => a.questionId === questionId)?.selectedOptionId;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8">Quiz</h2>
      <div className="space-y-8">
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">
              {index + 1}. {question.title}
            </h3>
            <div className="space-y-2">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className={`
                    block p-3 rounded cursor-pointer border text-white bg-background
                    ${
                      getSelectedOption(question.id) === option.id
                        ? "border-mint-400"
                        : "border-gray-800 hover:bg-gray-800"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={getSelectedOption(question.id) === option.id}
                    onChange={() =>
                      handleAnswer(question.id, option.id, question.title)
                    }
                    className="hidden"
                  />
                  {option.content}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={answers.length !== quiz.questions.length}
        className="mt-8 px-6 py-3 rounded text-foreground w-full font-bold bg-mint-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Quiz
      </button>
    </div>
  );
}
