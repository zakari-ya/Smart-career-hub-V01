import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold tracking-tight motion-safe-transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-graphite-950)] text-white shadow-[0_14px_40px_rgba(15,23,32,0.22)] hover:-translate-y-0.5 hover:bg-[var(--color-graphite-900)] focus-visible:ring-[var(--color-graphite-950)]",
        secondary:
          "bg-white/80 text-[var(--color-graphite-950)] ring-1 ring-black/8 hover:-translate-y-0.5 hover:bg-white focus-visible:ring-[var(--color-teal-500)]",
        ghost:
          "bg-transparent text-[var(--color-graphite-900)] hover:bg-black/5 focus-visible:ring-[var(--color-teal-500)]",
        teal:
          "bg-[var(--color-teal-500)] text-[var(--color-graphite-950)] shadow-[0_14px_40px_rgba(18,183,166,0.24)] hover:-translate-y-0.5 hover:bg-[var(--color-teal-400)] focus-visible:ring-[var(--color-teal-500)]"
      },
      size: {
        sm: "min-h-10 px-4 py-2 text-sm",
        md: "min-h-11 px-5 py-3 text-sm",
        lg: "min-h-12 px-6 py-3.5 text-base"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
