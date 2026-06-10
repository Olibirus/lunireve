import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

/**
 * Button — brand primitive. Three weights:
 * - primary: ink-800 fill (the main "read", "create" CTAs)
 * - secondary: cream background, ink border, ink text (supporting actions)
 * - ghost: transparent, hover:cream (tertiary)
 * - link: text-only, ink underline on hover
 *
 * Sizes: sm / md / lg — padding scales, radius stays 12px (buttons) for visual rhythm.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-xl transition-colors " +
    "disabled:opacity-45 disabled:pointer-events-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mint-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-cream-50)] " +
    "[&>svg]:shrink-0 [&>svg]:size-[1.1em]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-ink-800)] text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)] active:bg-[var(--color-ink-900)] shadow-[var(--shadow-soft)]",
        secondary:
          "bg-[var(--color-cream-100)] text-[var(--color-ink-800)] border border-[var(--color-ink-100)] hover:bg-[var(--color-cream-200)] hover:border-[var(--color-ink-200)]",
        mint:
          "bg-[var(--color-mint-400)] text-[var(--color-ink-900)] hover:bg-[var(--color-mint-500)] active:bg-[var(--color-mint-600)]",
        ghost:
          "bg-transparent text-[var(--color-ink-800)] hover:bg-[var(--color-cream-100)]",
        link:
          "bg-transparent text-[var(--color-ink-800)] underline-offset-4 hover:underline rounded-none px-0",
        outline:
          "bg-transparent text-[var(--color-ink-800)] border border-[var(--color-ink-200)] hover:bg-[var(--color-cream-100)]",
      },
      size: {
        sm: "text-sm px-3.5 py-2",
        md: "text-sm px-5 py-2.5",
        lg: "text-base px-6 py-3",
        xl: "text-base px-7 py-3.5",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
