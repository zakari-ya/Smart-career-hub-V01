import { z } from "zod";

const usageLimitSchema = z.object({
  used: z.number(),
  limit: z.number(),
  remaining: z.number(),
  resetsAt: z.string()
});

export const usageLimitsSchema = z.object({
  limits: z.object({
    analyzeResume: usageLimitSchema,
    extractResumeText: usageLimitSchema
  })
});

export type UsageLimits = z.infer<typeof usageLimitsSchema>;
