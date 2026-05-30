import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-3xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--color-graphite-950)] shadow-[0_10px_30px_rgba(15,23,32,0.04)] outline-none placeholder:text-[var(--color-graphite-700)]/70 focus:border-[var(--color-teal-500)]",
        className
      )}
      {...props}
    />
  );
}
