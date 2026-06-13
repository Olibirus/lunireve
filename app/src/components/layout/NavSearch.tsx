"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Navbar search (#12): the icon expands into an input. Enter or the icon
 * submits to the library with the term prefilled (/histoires?q=<term>),
 * where the dynamic results already render.
 */
export function NavSearch() {
  const t = useTranslations("search");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node) && !value) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [value]);

  function submit() {
    const q = value.trim();
    if (!q) {
      setOpen((o) => !o);
      return;
    }
    router.push({ pathname: "/histoires", query: { q } } as never);
    setOpen(false);
    setValue("");
  }

  return (
    <div ref={rootRef} className="relative flex items-center">
      <div
        className={cn(
          "flex items-center overflow-hidden rounded-full border bg-[var(--color-cream-50)]/80 backdrop-blur transition-all",
          open
            ? "w-44 sm:w-56 border-[var(--color-ink-100)] pl-3"
            : "w-9 border-transparent"
        )}
      >
        {open && (
          <input
            ref={inputRef}
            type="search"
            value={value}
            placeholder={t("placeholder")}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-[var(--color-ink-300)]"
            aria-label={t("label")}
          />
        )}
        <button
          type="button"
          onClick={submit}
          aria-label={t("label")}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
      {open && value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
          aria-label="Effacer"
          className="absolute right-9 text-[var(--color-ink-400)] hover:text-[var(--color-ink-700)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
