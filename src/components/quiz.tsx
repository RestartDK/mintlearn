"use client";

import { Answer, Quiz } from "@/utils/schemas";
import { useRouter } from "next/router";
import { useState } from "react";

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
      const submitResponse = await fetch(`/api/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

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
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Quiz</h1>
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
                    block p-3 rounded cursor-pointer
                    ${
                      getSelectedOption(question.id) === option.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
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
        className={`
          mt-8 px-6 py-3 rounded text-white w-full
          ${
            answers.length === quiz.questions.length
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-300 cursor-not-allowed"
          }
        `}
      >
        Submit Quiz
      </button>
    </div>
  );
}
