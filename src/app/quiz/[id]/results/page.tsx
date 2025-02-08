import { RedoButton } from "@/components/redo-button";
import { getQuizResults } from "@/lib/queries";
import { CircleHelp, XCircle, CheckCircle } from "lucide-react"; // Added icons
import Link from "next/link";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const results = await getQuizResults(parseInt(id));

  if (!results) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Quiz Results</h1>

      {/* Score Summary */}
      <div className="rounded-lg shadow p-6 mb-8 border border-gray-800">
        <h2 className="text-xl font-semibold mb-2">Your Score</h2>
        <p className="text-3xl font-bold text-mint-400">
          {results.score} / {results.total}
        </p>
        <p className="text-gray-600">
          {Math.round((results.score / results.total) * 100)}% Correct
        </p>
      </div>

      {/* Question Review */}
      <div className="space-y-6 mb-8">
        {results.answers.map((result) => (
          <div
            key={result.questionId}
            className={`p-4 rounded-lg ${
              result.isCorrect
                ? "bg-green-50 opacity-75 border border-green-200"
                : "bg-red-50 opacity-75 border border-red-200"
            }`}
          >
            {/* Question */}
            <h3 className="font-bold mb-4 text-background">
              {result.question}
            </h3>

            {/* Answer Section */}
            <div className="space-y-2">
              {/* Your Answer */}
              <div className="flex items-start gap-2">
                {result.isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-gray-600">Your answer:</p>
                  <p className="text-background">{result.selectedAnswer}</p>
                </div>
              </div>

              {/* Correct Answer - Only show if incorrect */}
              {!result.isCorrect && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Correct answer:</p>
                    <p className="text-background">
                      {/* You'll need to add the correct answer text to your results object */}
                      {result.correctAnswer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-x-4">
        <RedoButton results={results} />
        <Link
          href="/"
          className="flex items-center space-x-2 px-4 py-2 font-bold text-white rounded hover:bg-gray-400/90 transition-colors border border-gray-800"
        >
          <CircleHelp className="h-4 w-4" />
          <span>Make new Quiz</span>
        </Link>
      </div>
    </div>
  );
}
