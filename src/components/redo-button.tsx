"use client";
import { generateRetryQuiz } from "@/lib/hooks";
import { QuizResults } from "@/utils/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function RedoButton({ results }: { results: QuizResults }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    try {
      setIsLoading(true);
      const response = await generateRetryQuiz(results);
      if (!response?.id) {
        throw new Error("Failed to generate new quiz");
      }
      router.push(`/quiz/${response.id}`);
    } catch (error) {
      console.error("Error generating quiz:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate quiz";
      toast.error(errorMessage);
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
        className="py-2 px-4 rounded-md text-white transition-colors duration-200 font-bold flex items-center gap-2 bg-mint-400 hover:bg-mint-500/90 disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating Quiz...</span>
          </>
        ) : (
          <>
            <RotateCcw className="h-4 w-4" />
            <span>Redo similar quiz</span>
          </>
        )}
      </button>
    </div>
  );
}
