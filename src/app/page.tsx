import { QuizForm } from "@/components/quiz-form";
import Image from "next/image";

export default function Home() {
  return (
    <div className="mx-auto max-w-lg grid px-4 py-12 items-center">
      <h1 className="text-5xl flex gap-x-4 mb-8 font-extrabold">
        <Image
          src="/educhat-logo.svg"
          width={50}
          height={50}
          alt="Educhat logo"
        />
        Educhat
      </h1>
      <QuizForm />
    </div>
  );
}
