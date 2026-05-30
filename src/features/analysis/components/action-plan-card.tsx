import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { ActionPlanStep } from "@/features/analysis/types";

const priorityCopy = {
  high: "High",
  medium: "Medium",
  low: "Low"
} as const;

export function ActionPlanCard({ steps }: { steps: ActionPlanStep[] }) {
  return (
    <Card className="h-full">
      <CardDescription>Action plan</CardDescription>
      <CardTitle className="mt-2">Execution roadmap for the next revision</CardTitle>
      {steps.length ? (
        <div className="mt-5 space-y-4">
          {steps.map((step, index) => (
            <div key={`${step.priority}-${step.task}`} className="rounded-[24px] border border-black/6 bg-[var(--color-surface-100)] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-[var(--font-heading)] text-lg font-semibold text-[var(--color-graphite-950)]">
                  {index + 1}. {step.task}
                </p>
                <Badge>{priorityCopy[step.priority]}</Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[24px] border border-dashed border-black/8 bg-[var(--color-surface-100)] p-5 text-sm leading-6 text-[var(--color-graphite-700)]">
          Your next-step roadmap will appear here after the analysis completes.
        </div>
      )}
    </Card>
  );
}
