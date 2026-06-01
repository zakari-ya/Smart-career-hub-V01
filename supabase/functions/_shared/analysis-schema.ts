import { z } from "zod";

const detachedLanguagePatterns = [
  /\bthe user\b/i,
  /\buser's\b/i,
  /\bthe candidate\b/i,
  /\bthe applicant\b/i,
  /\bthe resume owner\b/i
];

function coachingStringSchema(minLength = 1, maxLength?: number) {
  const base = maxLength ? z.string().min(minLength).max(maxLength) : z.string().min(minLength);

  return base.superRefine((value, context) => {
    if (detachedLanguagePatterns.some((pattern) => pattern.test(value))) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use direct second-person coaching language instead of detached user/candidate wording."
      });
    }
  });
}

const scoreSchema = z.number().min(0).max(100);
const shortCoachingArray = (min: number, max: number) =>
  z.array(coachingStringSchema()).min(min).max(max);

export const verdictLabelSchema = z.enum([
  "Excellent",
  "Good base",
  "Needs improvement",
  "Weak",
  "Critical"
]);

export const analysisResultSchema = z.object({
  verdict: z.object({
    label: verdictLabelSchema,
    message: coachingStringSchema(1, 320)
  }),
  scores: z.object({
    overall: scoreSchema,
    ats: scoreSchema,
    structure: scoreSchema,
    content: scoreSchema,
    impact: scoreSchema,
    keywords: scoreSchema
  }),
  quickWins: shortCoachingArray(3, 5),
  structureCheck: z.object({
    layoutType: z.enum(["single_column", "possible_two_column", "unknown"]),
    atsRiskLevel: z.enum(["low", "medium", "high"]),
    detectedSections: z.array(z.string().min(1)).max(12),
    missingSections: z.array(z.string().min(1)).max(12),
    layoutWarnings: z.array(coachingStringSchema()).max(8)
  }),
  contactCheck: z.object({
    hasEmail: z.boolean(),
    hasPhone: z.boolean(),
    hasLinkedIn: z.boolean(),
    hasGithub: z.boolean(),
    hasPortfolio: z.boolean(),
    missingContactItems: z.array(z.string().min(1)).max(8)
  }),
  strengths: shortCoachingArray(3, 5),
  weaknesses: shortCoachingArray(3, 5),
  suggestions: shortCoachingArray(4, 7),
  optimizedSummary: coachingStringSchema(1, 800),
  keywordImprovements: z.object({
    found: z.array(z.string().min(1)).max(14),
    missing: z.array(z.string().min(1)).max(14),
    recommended: z.array(z.string().min(1)).max(14)
  }),
  actionPlan: z.array(
    z.object({
      priority: z.enum(["high", "medium", "low"]),
      task: coachingStringSchema(1, 260)
    })
  ).min(3).max(6),
  bulletQuality: z.object({
    score: scoreSchema,
    tooLongBullets: z.array(coachingStringSchema()).max(8),
    weakBullets: z.array(
      z.object({
        original: z.string().min(1).max(500),
        problem: coachingStringSchema(1, 260),
        improvedVersion: coachingStringSchema(1, 500),
        followsXYZ: z.boolean(),
        missingPart: z.enum(["X", "Y", "Z", "multiple", "none"])
      })
    ).max(8),
    xyzGuidance: coachingStringSchema(1, 500)
  })
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
