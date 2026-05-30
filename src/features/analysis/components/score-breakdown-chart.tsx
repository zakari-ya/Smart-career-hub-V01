import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { ResumeAnalysis } from "@/features/analysis/types";

export function ScoreBreakdownChart({ analysis }: { analysis: ResumeAnalysis }) {
  const data = [
    { metric: "Overall", value: analysis.overallScore },
    { metric: "ATS", value: analysis.atsScore },
    { metric: "Keywords", value: analysis.keywordScore },
    { metric: "Impact", value: analysis.impactScore }
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
