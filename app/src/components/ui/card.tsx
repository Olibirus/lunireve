import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Card — paper surface with generous radius (24px). Two tones:
 * - default: cream-50 with soft shadow (main content cards)
 * - cream: cream-100 (nested / less prominent)
 * - ink: ink-800 dark band for emphasis sections
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { tone?: "default" | "cream" | "ink" | "ghost" }
>(({ className, tone = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl border",
      tone === "default" &&
        "bg-[var(--color-cream-50)] border-[var(--color-ink-100)] shadow-[var(--shadow-card)]",
      tone === "cream" &&
        "bg-[var(--color-cream-100)] border-[var(--color-cream-200)]",
      tone === "ink" &&
        "bg-[var(--color-ink-800)] text-[var(--color-cream-50)] border-[var(--color-ink-800)]",
      tone === "ghost" &&
        "bg-transparent border-[var(--color-ink-100)]",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-serif text-2xl leading-tight tracking-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[var(--color-ink-400)] leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
