"use client";

import { generateRetryQuiz } from "@/lib/hooks";
import { QuizResults } from "@/utils/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

export function RedoButton({ results }: { results: QuizResults }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    setIsLoading(true);
    const response = await generateRetryQuiz(results);
    console.log(response.id);

    router.push(`/quiz/${response.id}`);
    setIsLoading(false);
  }

  return (
    <button
      onClick={handleSubmit}
      disabled={isLoading}
      className={`
      py-2 px-4 rounded-md text-white
      transition-colors duration-200 font-bold
      flex items-center gap-2  // Added these classes for icon alignment
      ${
        isLoading
          ? "bg-mint-400/09 cursor-not-allowed"
          : "bg-mint-400 hover:bg-mint-500/90"
      }
    `}
    >
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Generating Quiz...</span>
        </div>
      ) : (
        <>
          <RotateCcw className="h-4 w-4" /> {/* Added size classes */}
          <span>Redo similar quiz</span>
        </>
      )}
    </button>
  );
}
