import { z } from "zod";

export const actionPlanStepSchema = z.object({
  priority: z.enum(["high", "medium", "low"]),
  task: z.string()
});

export const resumeAnalysisSchema = z.object({
  id: z.string(),
  resumeId: z.string(),
  provider: z.string(),
  model: z.string(),
  status: z.enum(["pending", "completed", "failed"]),
  createdAt: z.string(),
  overallScore: z.number(),
  atsScore: z.number(),
  keywordScore: z.number(),
  impactScore: z.number(),
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  optimizedSummary: z.string(),
  keywordImprovements: z.object({
    missing: z.array(z.string()),
    recommended: z.array(z.string()),
    found: z.array(z.string())
  }),
  actionPlan: z.array(actionPlanStepSchema),
  failureReason: z.string().nullable().optional()
});
