import { QuizView } from "@/components/quiz";
import { getQuiz } from "@/lib/queries";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const quiz = await getQuiz(parseInt(id));

  console.log(quiz);

  if (!quiz) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto">
      <QuizView quiz={quiz} />
    </div>
  );
}
