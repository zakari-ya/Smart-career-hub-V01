import type { SupabaseClient } from "@supabase/supabase-js";

type FunctionErrorWithContext = Error & {
  context?: Response;
};

function getDetailsMessage(details: unknown) {
  if (!details || typeof details !== "object") {
    return null;
  }

  const record = details as Record<string, unknown>;
  return typeof record.reason === "string"
    ? record.reason
    : typeof record.message === "string"
      ? record.message
      : null;
}

async function readFunctionError(error: unknown) {
  const typedError = error as Partial<FunctionErrorWithContext>;

  if (typedError.context instanceof Response) {
    const bodyText = await typedError.context.clone().text();

    if (bodyText) {
      try {
        const body = JSON.parse(bodyText) as { error?: unknown; details?: unknown };
        const detailsMessage = getDetailsMessage(body.details);

        if (typeof body.error === "string" && detailsMessage) {
          return `${body.error} ${detailsMessage}`;
        }

        if (typeof body.error === "string") {
          return body.error;
        }

        if (detailsMessage) {
          return detailsMessage;
        }
      } catch {
        return bodyText;
      }
    }
  }

  const message = error instanceof Error ? error.message : "The backend function failed.";

  if (message === "Failed to send a request to the Edge Function") {
    return "Could not reach the resume backend function. Deploy extract-resume-text and analyze-resume, confirm CORS is updated, and check Supabase Function logs.";
  }

  return message;
}

export async function invokeEdgeFunction<TResponse>(
  client: SupabaseClient,
  functionName: string,
  body: Record<string, unknown>
) {
  const { data, error } = await client.functions.invoke<TResponse>(functionName, {
    body
  });

  if (error) {
    throw new Error(await readFunctionError(error));
  }

  return data;
}
