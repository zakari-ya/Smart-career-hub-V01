import { z } from "zod";

export const actionPlanStepSchema = z.object({
  priority: z.enum(["high", "medium", "low"]),
  task: z.string()
});

export const analysisResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  atsScore: z.number().min(0).max(100),
  keywordScore: z.number().min(0).max(100),
  impactScore: z.number().min(0).max(100),
  summary: z.string().min(1),
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  suggestions: z.array(z.string()).min(1),
  optimizedSummary: z.string().min(1),
  keywordImprovements: z.object({
    missing: z.array(z.string()),
    recommended: z.array(z.string()),
    found: z.array(z.string())
  }),
  actionPlan: z.array(actionPlanStepSchema)
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
