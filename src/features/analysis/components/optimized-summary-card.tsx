import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function OptimizedSummaryCard({ summary }: { summary: string }) {
  return (
    <Card className="h-full">
      <CardDescription>Optimized summary</CardDescription>
      <CardTitle className="mt-2">Ready-to-use profile opening</CardTitle>
      <div className="mt-5 rounded-[24px] border border-black/6 bg-[var(--color-surface-100)] p-5 text-sm leading-7 text-[var(--color-graphite-700)]">
        {summary}
      </div>
    </Card>
  );
}
