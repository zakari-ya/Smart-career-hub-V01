import { z } from "zod";

const scoreSchema = z.number().min(0).max(100);

export const actionPlanStepSchema = z.object({
  priority: z.enum(["high", "medium", "low"]),
  task: z.string()
});

export const analysisResultSchema = z.object({
  verdict: z.object({
    label: z.enum(["Excellent", "Good base", "Needs improvement", "Weak", "Critical"]),
    message: z.string()
  }),
  scores: z.object({
    overall: scoreSchema,
    ats: scoreSchema,
    structure: scoreSchema,
    content: scoreSchema,
    impact: scoreSchema,
    keywords: scoreSchema
  }),
  quickWins: z.array(z.string()),
  structureCheck: z.object({
    layoutType: z.enum(["single_column", "possible_two_column", "unknown"]),
    atsRiskLevel: z.enum(["low", "medium", "high"]),
    detectedSections: z.array(z.string()),
    missingSections: z.array(z.string()),
    layoutWarnings: z.array(z.string())
  }),
  contactCheck: z.object({
    hasEmail: z.boolean(),
    hasPhone: z.boolean(),
    hasLinkedIn: z.boolean(),
    hasGithub: z.boolean(),
    hasPortfolio: z.boolean(),
    missingContactItems: z.array(z.string())
  }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  optimizedSummary: z.string(),
  keywordImprovements: z.object({
    found: z.array(z.string()),
    missing: z.array(z.string()),
    recommended: z.array(z.string())
  }),
  actionPlan: z.array(actionPlanStepSchema),
  bulletQuality: z.object({
    score: scoreSchema,
    tooLongBullets: z.array(z.string()),
    weakBullets: z.array(
      z.object({
        original: z.string(),
        problem: z.string(),
        improvedVersion: z.string(),
        followsXYZ: z.boolean(),
        missingPart: z.enum(["X", "Y", "Z", "multiple", "none"])
      })
    ),
    xyzGuidance: z.string()
  })
});

const analysisBaseSchema = z.object({
  id: z.string(),
  resumeId: z.string(),
  provider: z.string(),
  model: z.string(),
  status: z.enum(["pending", "completed", "failed"]),
  createdAt: z.string(),
  failureReason: z.string().nullable().optional()
});

export const resumeAnalysisV2Schema = analysisBaseSchema.extend({
  schemaVersion: z.literal("v2"),
  result: analysisResultSchema
});

export const resumeAnalysisLegacySchema = analysisBaseSchema.extend({
  schemaVersion: z.literal("legacy"),
  legacyMessage: z.string()
});

export const resumeAnalysisSchema = z.union([
  resumeAnalysisV2Schema,
  resumeAnalysisLegacySchema
]);
