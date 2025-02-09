import { QuizForm } from "@/components/quiz-form";

export default function Home() {
  return (
    <div className="mx-auto max-w-lg grid px-4 py-12 items-center">
      <h2 className="text-4xl mb-12 font-extrabold">Generate your quiz</h2>
      <QuizForm />
    </div>
  );
}
