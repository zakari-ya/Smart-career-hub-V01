import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-black/8 bg-white/80 px-3 py-1 text-xs font-medium tracking-[0.04em] text-[var(--color-graphite-700)] uppercase",
        className
      )}
      {...props}
    />
  );
}
