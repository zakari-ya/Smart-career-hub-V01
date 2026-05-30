import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function AnalysisSummaryCard({ summary }: { summary: string }) {
  return (
    <Card className="h-full">
      <CardDescription>Executive summary</CardDescription>
      <CardTitle className="mt-2">What the analysis sees first</CardTitle>
      <p className="mt-5 text-sm leading-7 text-[var(--color-graphite-700)]">{summary}</p>
    </Card>
  );
}
