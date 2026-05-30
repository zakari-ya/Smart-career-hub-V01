import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

export function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Content> & {
  side?: "left" | "right";
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(15,23,32,0.35)] backdrop-blur-sm" />
      <Dialog.Content
        className={cn(
          "fixed top-0 z-50 flex h-dvh w-[88vw] max-w-sm flex-col border-l border-black/6 bg-[rgba(255,255,255,0.96)] p-6 shadow-[0_24px_80px_rgba(15,23,32,0.18)] outline-none",
          side === "right" ? "right-0" : "left-0 border-l-0 border-r",
          className
        )}
        {...props}
      >
        <Dialog.Close className="absolute right-4 top-4 rounded-full border border-black/8 p-2 text-[var(--color-graphite-700)]">
          <X className="h-4 w-4" />
        </Dialog.Close>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
