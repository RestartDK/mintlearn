import { getQuizResults } from "@/lib/queries";
import Link from "next/link";

export default async function ResultsPage({
  params,
}: {
  params: { id: string };
}) {
  const results = await getQuizResults(parseInt(params.id));

  const score = results.filter((r) => r.is_correct).length;
  const total = results.length;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Quiz Results</h1>

      {/* Score Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Score</h2>
        <p className="text-3xl font-bold text-blue-600">
          {score} / {total}
        </p>
        <p className="text-gray-600">
          {Math.round((score / total) * 100)}% Correct
        </p>
      </div>

      {/* Question Review */}
      <div className="space-y-6">
        {results.map((result) => (
          <div
            key={result.question_id}
            className={`p-4 rounded-lg ${
              result.is_correct
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <h3 className="font-medium mb-2">{result.question}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Your answer: {result.selected_answer}
            </p>
            <div className="flex items-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  result.is_correct
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {result.is_correct ? "Correct" : "Incorrect"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <Link
        href="/quiz"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try Another Quiz
      </Link>
    </div>
  );
}
