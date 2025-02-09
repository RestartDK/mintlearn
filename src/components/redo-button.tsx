"use client";
import { generateRetryQuiz } from "@/lib/hooks";
import { QuizResults } from "@/utils/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

export function RedoButton({ results }: { results: QuizResults }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await generateRetryQuiz(results);

      if (!response?.id) {
        throw new Error("Failed to generate new quiz");
      }

      router.push(`/quiz/${response.id}`);
    } catch (error) {
      console.error("Error generating quiz:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate quiz";

      // Using toast for user feedback
      toast.error(errorMessage);

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        aria-label="Generate similar quiz"
        className={`
          py-2 px-4 rounded-md text-white
          transition-colors duration-200 font-bold
          flex items-center gap-2
          ${
            isLoading
              ? "bg-mint-400/09 cursor-not-allowed"
              : "bg-mint-400 hover:bg-mint-500/90"
          }
          ${error ? "bg-red-500 hover:bg-red-600" : ""}
          disabled:opacity-50
        `}
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <RotateCcw className="h-4 w-4" />
            <span>Redo similar quiz</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-700 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

// Separate loading spinner component
function LoadingSpinner() {
  return (
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
  );
}
