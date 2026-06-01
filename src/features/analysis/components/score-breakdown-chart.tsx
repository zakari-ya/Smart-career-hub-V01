import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { ResumeAnalysisV2 } from "@/features/analysis/types";

export function ScoreBreakdownChart({ analysis }: { analysis: ResumeAnalysisV2 }) {
  const data = [
    { metric: "Overall", value: analysis.result.scores.overall },
    { metric: "ATS", value: analysis.result.scores.ats },
    { metric: "Structure", value: analysis.result.scores.structure },
    { metric: "Content", value: analysis.result.scores.content },
    { metric: "Impact", value: analysis.result.scores.impact },
    { metric: "Keywords", value: analysis.result.scores.keywords }
  ];

  return (
    <Card className="h-full">
      <CardDescription>Score radar</CardDescription>
      <CardTitle className="mt-2">How your resume is performing</CardTitle>
      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(15, 23, 32, 0.1)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "#334151", fontSize: 12, fontFamily: "Plus Jakarta Sans, sans-serif" }}
            />
            <Tooltip />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#12b7a6"
              fill="#12b7a6"
              fillOpacity={0.24}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
