import { type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-start gap-4 rounded-[32px] border-dashed bg-white/70 p-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface-200)] text-[var(--color-graphite-900)]">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-[var(--font-heading)] text-xl font-semibold text-[var(--color-graphite-950)]">
          {title}
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-graphite-700)]">
          {description}
        </p>
      </div>
      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}
