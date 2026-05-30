import * as LabelPrimitive from "@radix-ui/react-label";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export function Label({ className, ...props }: ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root className={cn("mb-2 block text-sm font-semibold text-[var(--color-graphite-900)]", className)} {...props} />
  );
}
