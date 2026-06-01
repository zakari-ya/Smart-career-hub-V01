import { ArrowUpRight, BriefcaseBusiness, SearchCheck, Sparkles, TrendingUp } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatScore } from "@/lib/utils";
import type { ResumeAnalysisV2 } from "@/features/analysis/types";

const cardMeta = [
  {
    key: "overall",
    label: "Overall score",
    icon: TrendingUp
  },
  {
    key: "ats",
    label: "ATS score",
    icon: SearchCheck
  },
  {
    key: "structure",
    label: "Structure score",
    icon: Sparkles
  },
  {
    key: "impact",
    label: "Impact score",
    icon: BriefcaseBusiness
  }
] as const;

export function ScoreOverviewCards({ analysis }: { analysis: ResumeAnalysisV2 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cardMeta.map((item) => {
        const Icon = item.icon;
        const score = analysis.result.scores[item.key];

        return (
          <Card key={item.key} className="group overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <CardDescription>{item.label}</CardDescription>
                <CardTitle className="mt-3 text-3xl sm:text-[2rem]">{formatScore(score)}</CardTitle>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-200)] text-[var(--color-graphite-900)]">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-[var(--color-graphite-700)]">
                {score >= 85 ? "Strong benchmark" : score >= 70 ? "Solid base" : "Needs focused work"}
              </span>
              <span className="flex items-center gap-1 font-semibold text-[var(--color-teal-500)]">
                <ArrowUpRight className="h-4 w-4" />
                {Math.max(score - 6, 0)} to 100
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
