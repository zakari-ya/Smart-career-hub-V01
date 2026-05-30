import { useEffect } from "react";

import { useToastStore } from "@/stores/toast-store";
import { cn } from "@/lib/utils";

const variantStyles = {
  default: "border-black/6 bg-white text-[var(--color-graphite-950)]",
  success: "border-[var(--color-success-500)]/20 bg-[rgba(19,135,93,0.08)] text-[var(--color-graphite-950)]",
  destructive: "border-[var(--color-danger-500)]/20 bg-[rgba(222,79,102,0.1)] text-[var(--color-graphite-950)]"
} as const;

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  useEffect(() => {
    if (!toasts.length) {
      return;
    }

    const timeout = window.setTimeout(() => removeToast(toasts[0].id), 3200);
    return () => window.clearTimeout(timeout);
  }, [removeToast, toasts]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto w-full max-w-sm rounded-3xl border p-4 shadow-[0_24px_60px_rgba(15,23,32,0.14)] backdrop-blur-md",
            variantStyles[toast.variant ?? "default"]
          )}
        >
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.description ? <p className="mt-1 text-sm text-[var(--color-graphite-700)]">{toast.description}</p> : null}
        </div>
      ))}
    </div>
  );
}
