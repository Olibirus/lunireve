import * as React from "react";
import { cn } from "@/lib/utils/cn";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex w-full rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-4 py-2.5 text-sm",
        "placeholder:text-[var(--color-ink-300)]",
        "focus:border-[var(--color-ink-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-mint-400)]/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
