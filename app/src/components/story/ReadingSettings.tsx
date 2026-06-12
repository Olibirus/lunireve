"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Type } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Size = "s" | "m" | "l";

/**
 * Reading comfort controls — text size (S/M/L) and dyslexia font, both
 * fully working (item #20). Applies classes to #story-body and persists
 * the choice; with accounts, this maps to users.text_size/dyslexia_font.
 */
export function ReadingSettings() {
  const t = useTranslations("story");
  const [size, setSize] = useState<Size>("m");
  const [dyslexia, setDyslexia] = useState(false);

  // Restore persisted preferences
  useEffect(() => {
    const storedSize = localStorage.getItem("lunireve:textSize") as Size | null;
    const storedDys = localStorage.getItem("lunireve:dyslexia") === "1";
    if (storedSize === "s" || storedSize === "m" || storedSize === "l") setSize(storedSize);
    if (storedDys) setDyslexia(true);
  }, []);

  // Apply to the article
  useEffect(() => {
    const body = document.getElementById("story-body");
    if (!body) return;
    body.classList.remove("reading-size-s", "reading-size-m", "reading-size-l");
    body.classList.add(`reading-size-${size}`);
    body.classList.toggle("reading-dyslexia", dyslexia);
    try {
      localStorage.setItem("lunireve:textSize", size);
      localStorage.setItem("lunireve:dyslexia", dyslexia ? "1" : "0");
    } catch {
      /* non-fatal */
    }
  }, [size, dyslexia]);

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 text-[var(--color-ink-700)]">
          <Type className="h-4 w-4" />
          {t("textSize")}
        </span>
        <div className="inline-flex rounded-lg border border-[var(--color-ink-100)] p-0.5 bg-[var(--color-cream-100)]">
          {(["s", "m", "l"] as const).map((v, i) => (
            <button
              key={v}
              type="button"
              onClick={() => setSize(v)}
              aria-pressed={size === v}
              className={cn(
                "px-2.5 py-1 rounded-md",
                size === v && "bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
              )}
              style={{ fontSize: `${0.7 + i * 0.16}rem` }}
              aria-label={`${t("textSize")} ${v.toUpperCase()}`}
            >
              A
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <span className="text-[var(--color-ink-700)]">{t("dyslexiaFont")}</span>
        <button
          type="button"
          role="switch"
          aria-checked={dyslexia}
          onClick={() => setDyslexia((d) => !d)}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            dyslexia ? "bg-[var(--color-mint-500)]" : "bg-[var(--color-cream-300)]"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left]",
              dyslexia ? "left-[22px]" : "left-0.5"
            )}
          />
        </button>
      </label>
    </div>
  );
}
