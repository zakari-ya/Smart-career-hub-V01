import { requireSupabaseBrowserClient } from "@/lib/supabase/client";
import { invokeEdgeFunction } from "@/lib/supabase/functions";
import { usageLimitsSchema } from "@/features/usage/schemas/usage-limits-schema";

export async function getUsageLimits() {
  const client = requireSupabaseBrowserClient();
  const response = await invokeEdgeFunction(client, "get-usage-limits", {});

  return usageLimitsSchema.parse(response);
}
