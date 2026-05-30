import { corsHeaders } from "./cors.ts";

export function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    },
    ...init
  });
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  return jsonResponse(
    {
      error: message,
      details
    },
    { status }
  );
}
