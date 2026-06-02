import type { SupabaseClient } from "@supabase/supabase-js";
import { createAppError } from "./errors.ts";

export const limits = {
  "extract-resume-text": 20,
  "analyze-resume": 10
} as const;

export type RateLimitAction = keyof typeof limits;

function getDailyWindow() {
  const windowStart = new Date();
  windowStart.setUTCHours(0, 0, 0, 0);

  const resetsAt = new Date(windowStart);
  resetsAt.setUTCDate(resetsAt.getUTCDate() + 1);

  return {
    resetsAt: resetsAt.toISOString(),
    windowIso: windowStart.toISOString()
  };
}

export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  action: RateLimitAction
) {
  const { windowIso } = getDailyWindow();
  const limit = limits[action];

  const { data: existing, error } = await supabase
    .from("rate_limits")
    .select("id, count")
    .eq("user_id", userId)
    .eq("action", action)
    .eq("window_start", windowIso)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (existing && existing.count >= limit) {
    throw createAppError("DAILY_LIMIT_REACHED", {
      debugDetails: {
        action,
        count: existing.count,
        limit,
        windowIso
      }
    });
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from("rate_limits")
      .update({ count: existing.count + 1 })
      .eq("id", existing.id);

    if (updateError) {
      throw updateError;
    }

    return;
  }

  const { error: insertError } = await supabase.from("rate_limits").insert({
    user_id: userId,
    action,
    window_start: windowIso,
    count: 1
  });

  if (insertError) {
    throw insertError;
  }
}

export async function getUsageLimits(supabase: SupabaseClient, userId: string) {
  const { resetsAt, windowIso } = getDailyWindow();
  const { data, error } = await supabase
    .from("rate_limits")
    .select("action, count")
    .eq("user_id", userId)
    .eq("window_start", windowIso);

  if (error) {
    throw error;
  }

  const counts = new Map<string, number>(
    (data ?? []).map((row) => [String(row.action), Number(row.count ?? 0)])
  );

  const analyzeUsed = counts.get("analyze-resume") ?? 0;
  const extractUsed = counts.get("extract-resume-text") ?? 0;

  return {
    limits: {
      analyzeResume: {
        used: analyzeUsed,
        limit: limits["analyze-resume"],
        remaining: Math.max(limits["analyze-resume"] - analyzeUsed, 0),
        resetsAt
      },
      extractResumeText: {
        used: extractUsed,
        limit: limits["extract-resume-text"],
        remaining: Math.max(limits["extract-resume-text"] - extractUsed, 0),
        resetsAt
      }
    }
  };
}
