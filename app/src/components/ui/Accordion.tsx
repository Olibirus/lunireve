"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type AccordionItem = { question: string; answer: string };

/**
 * Accordion FAQ (#21/#28) — only one panel open at a time. Used on the
 * About page and the dedicated FAQ page.
 */
export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[var(--color-ink-100)] rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-6 md:py-5"
            >
              <span className="font-serif text-lg tracking-tight text-[var(--color-ink-800)]">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-[var(--color-indigo-soft-500)] transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 md:px-6 md:pb-6">
                <p className="text-[var(--color-ink-600)] leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
