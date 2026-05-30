import type { SupabaseClient } from "@supabase/supabase-js";

const limits = {
  "extract-resume-text": 20,
  "analyze-resume": 12
} as const;

export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  action: keyof typeof limits
) {
  const windowStart = new Date();
  windowStart.setMinutes(0, 0, 0);
  const windowIso = windowStart.toISOString();
  const limit = limits[action];

  const { data: existing } = await supabase
    .from("rate_limits")
    .select("id, count")
    .eq("user_id", userId)
    .eq("action", action)
    .eq("window_start", windowIso)
    .maybeSingle();

  if (existing && existing.count >= limit) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  if (existing) {
    await supabase
      .from("rate_limits")
      .update({ count: existing.count + 1 })
      .eq("id", existing.id);
    return;
  }

  await supabase.from("rate_limits").insert({
    user_id: userId,
    action,
    window_start: windowIso,
    count: 1
  });
}
