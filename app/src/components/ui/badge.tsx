import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-cream-100)] text-[var(--color-ink-600)] border border-[var(--color-ink-100)]",
        ink: "bg-[var(--color-ink-800)] text-[var(--color-cream-50)]",
        mint: "bg-[var(--color-mint-200)] text-[var(--color-mint-800)]",
        indigo:
          "bg-[var(--color-indigo-soft-100)] text-[var(--color-indigo-soft-700)]",
        fox: "bg-[var(--color-fox-300)]/30 text-[var(--color-fox-700)] border border-[var(--color-fox-300)]",
        outline:
          "bg-transparent text-[var(--color-ink-600)] border border-[var(--color-ink-200)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
