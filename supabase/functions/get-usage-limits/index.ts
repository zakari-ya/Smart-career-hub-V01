import { getAuthenticatedUser, createServiceClient } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { errorResponse, jsonResponse, logBackendError } from "../_shared/errors.ts";
import { getUsageLimits } from "../_shared/rate-limit.ts";

Deno.serve(async (request) => {
  const requestId = crypto.randomUUID();

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await getAuthenticatedUser(request);
    const supabase = createServiceClient();
    const usage = await getUsageLimits(supabase, user.id);

    return jsonResponse(usage);
  } catch (error) {
    logBackendError("get-usage-limits failed", requestId, error);
    return errorResponse(error, requestId);
  }
});
