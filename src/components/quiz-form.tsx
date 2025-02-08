"use client";

import { useState } from "react";
import { generateQuiz } from "@/lib/hooks";
import { useRouter } from "next/navigation";

export function QuizForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        title: formData.get("title")?.toString() || "",
        content: formData.get("content")?.toString() || "",
      };

      const response = await generateQuiz(data.title, data.content);
      console.log(response);

      router.push(`/quiz/${response.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
      {error && (
        <div className="p-4 text-sm bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Quiz Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="w-full p-3 border text-foreground border-gray-700 rounded-md shadow-sm bg-background"
          placeholder="Enter quiz title"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-2">
          Quiz Content
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={6}
          className="w-full p-3 text-foreground border border-gray-700 rounded-md shadow-sm bg-background"
          placeholder="Enter the content to generate questions from"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full py-3 px-4 rounded-md 
          transition-colors duration-200 text-foreground font-bold
          ${isLoading ? "bg-mint-600 cursor-not-allowed" : "bg-mint-400 hover:bg-primary/50"}
        `}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-foreground"
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
          "Generate Quiz"
        )}
      </button>
    </form>
  );
}
