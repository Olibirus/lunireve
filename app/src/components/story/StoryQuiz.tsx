"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/data/mock-stories";
import { Check, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Step-by-step quiz (brief §5/§33): one question at a time, "next" to
 * advance, final recap shows every answer with right/wrong + explanation.
 * Restartable at will. Results recording (rallye / analytics) is Phase 2.
 */
export function StoryQuiz({ questions }: { questions: QuizQuestion[] }) {
  const t = useTranslations("story");
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<(number | null)[]>(
    questions.map(() => null)
  );
  const [finished, setFinished] = useState(false);

  const current = questions[step];
  const pickedCurrent = picked[step];
  const score = picked.filter((p, i) => p === questions[i].answer).length;

  function pick(choice: number) {
    setPicked((prev) => prev.map((p, i) => (i === step ? choice : p)));
  }

  function next() {
    if (step < questions.length - 1) setStep(step + 1);
    else setFinished(true);
  }

  function restart() {
    setPicked(questions.map(() => null));
    setStep(0);
    setFinished(false);
  }

  return (
    <section
      aria-label={t("quizTitle")}
      className="rounded-3xl border border-[var(--color-indigo-soft-200)] bg-[var(--color-cream-50)] p-6 md:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-serif text-xl tracking-tight sparkle">{t("quizTitle")}</h3>
        {!finished && (
          <span className="text-xs text-[var(--color-ink-400)]">
            {t("quizProgress", { current: step + 1, total: questions.length })}
          </span>
        )}
      </div>

      {finished ? (
        <div className="mt-5 space-y-4">
          <p className="rounded-2xl bg-[var(--color-mint-100)] px-4 py-3 text-center font-serif text-lg">
            {t("quizScore", { score, total: questions.length })}
          </p>

          <ul className="space-y-3">
            {questions.map((q, i) => {
              const mine = picked[i];
              const right = mine === q.answer;
              return (
                <li
                  key={i}
                  className="rounded-2xl border border-[var(--color-ink-100)] p-4"
                >
                  <p className="text-sm font-medium text-[var(--color-ink-800)]">
                    {q.question}
                  </p>
                  <p
                    className={cn(
                      "mt-2 flex items-start gap-2 text-sm",
                      right ? "text-[var(--color-mint-800)]" : "text-[var(--color-fox-700)]"
                    )}
                  >
                    {right ? (
                      <Check className="h-4 w-4 mt-0.5 shrink-0" />
                    ) : (
                      <X className="h-4 w-4 mt-0.5 shrink-0" />
                    )}
                    {t("quizYouAnswered", {
                      answer: mine !== null ? q.choices[mine] : "·",
                    })}
                  </p>
                  {!right && (
                    <p className="mt-1 pl-6 text-sm text-[var(--color-ink-600)]">
                      {t("quizRightAnswer", { answer: q.choices[q.answer] })}
                    </p>
                  )}
                  <p className="mt-1.5 pl-6 text-xs text-[var(--color-ink-500)]">
                    {q.explanation}
                  </p>
                </li>
              );
            })}
          </ul>

          <Button variant="secondary" size="md" onClick={restart} className="w-full justify-center">
            <RotateCcw className="h-4 w-4" />
            {t("quizRestart")}
          </Button>
        </div>
      ) : (
        <div className="mt-5">
          <p className="font-medium text-[var(--color-ink-800)]">{current.question}</p>
          <div className="mt-4 space-y-2">
            {current.choices.map((choice, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                aria-pressed={pickedCurrent === i}
                className={cn(
                  "block w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                  pickedCurrent === i
                    ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                    : "border-[var(--color-ink-100)] text-[var(--color-ink-700)] hover:bg-[var(--color-cream-100)]"
                )}
              >
                {choice}
              </button>
            ))}
          </div>
          <Button
            variant="primary"
            size="md"
            disabled={pickedCurrent === null}
            onClick={next}
            className="mt-5 w-full justify-center"
          >
            {step === questions.length - 1 ? t("quizFinish") : t("quizNext")}
          </Button>
        </div>
      )}
    </section>
  );
}
