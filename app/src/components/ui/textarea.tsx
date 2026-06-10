import * as React from "react";
import { cn } from "@/lib/utils/cn";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-28 w-full rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-4 py-3 text-sm",
      "placeholder:text-[var(--color-ink-300)]",
      "focus:border-[var(--color-ink-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-mint-400)]/40",
      "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
