"use client";

import { Fragment, useState } from "react";
import { useTranslations } from "next-intl";
import type { InteractiveNode } from "@/data/mock-stories";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Interactive story renderer (brief §32):
 * - shows the current segment's text, then a question with 3 choices
 * - picking a choice reveals the next segment below
 * - earlier choices stay clickable — changing one hides everything after it
 *   and branches the story from there
 */
export function InteractiveStory({ tree }: { tree: InteractiveNode }) {
  const t = useTranslations("story");
  // Path of chosen indexes from the root, e.g. [0, 2]
  const [path, setPath] = useState<number[]>([]);

  // Materialize the visible chain of nodes from the choices path
  const chain: InteractiveNode[] = [tree];
  for (const idx of path) {
    const current = chain[chain.length - 1];
    const next = current.choices?.[idx]?.next;
    if (!next) break;
    chain.push(next);
  }

  function choose(depth: number, idx: number) {
    // Truncate any later choices, then apply the new one (re-branching)
    setPath((prev) => [...prev.slice(0, depth), idx]);
  }

  const finished = !chain[chain.length - 1].choices;

  return (
    <div>
      {chain.map((node, depth) => (
        <Fragment key={depth}>
          <div className="prose-reading">
            {node.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {node.question && node.choices && (
            <div className="my-8 rounded-3xl border border-[var(--color-indigo-soft-200)] bg-[var(--color-cream-100)] p-5 md:p-6">
              <p className="font-serif text-lg tracking-tight">{node.question}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {node.choices.map((c, i) => {
                  const selected = path[depth] === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => choose(depth, i)}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left text-sm leading-snug transition-colors",
                        selected
                          ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                          : "border-[var(--color-ink-100)] bg-[var(--color-cream-50)] hover:border-[var(--color-mint-500)]"
                      )}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Fragment>
      ))}

      {finished && (
        <div className="mt-8 text-center">
          <p className="italic text-[var(--color-ink-500)]">{t("endNote")}</p>
          <button
            type="button"
            onClick={() => setPath([])}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--color-ink-100)] px-4 py-2 text-sm text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
          >
            <RotateCcw className="h-4 w-4" />
            {t("interactiveRestart")}
          </button>
        </div>
      )}
    </div>
  );
}
