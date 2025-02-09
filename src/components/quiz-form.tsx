"use client";

import { useState } from "react";
import { generateQuiz } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export function QuizForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

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
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
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
        className="w-full py-3 px-4 rounded-md transition-colors duration-200 text-foreground font-bold bg-mint-400 hover:bg-mint-500/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating Quiz...</span>
          </>
        ) : (
          "Generate Quiz"
        )}
      </button>
    </form>
  );
}
