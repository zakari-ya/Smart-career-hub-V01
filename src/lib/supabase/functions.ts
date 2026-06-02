import type { SupabaseClient } from "@supabase/supabase-js";

export type AppErrorCode =
  | "DAILY_LIMIT_REACHED"
  | "AI_PROVIDER_BUSY"
  | "AI_INVALID_RESPONSE"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "EXTRACTION_FAILED"
  | "SERVER_CONFIG_ERROR"
  | "UNKNOWN_BACKEND_ERROR";

const fallbackMessages: Record<AppErrorCode, string> = {
  DAILY_LIMIT_REACHED: "You used today's AI analysis limit. Try again tomorrow.",
  AI_PROVIDER_BUSY: "The AI provider is busy right now. Please try again shortly.",
  AI_INVALID_RESPONSE: "The AI review could not be validated. Please try again.",
  UNAUTHORIZED: "Please sign in again.",
  NOT_FOUND: "We could not find this resume.",
  EXTRACTION_FAILED: "We could not read this resume. Try a cleaner PDF, TXT, or MD file.",
  SERVER_CONFIG_ERROR: "The resume service is not configured correctly yet.",
  UNKNOWN_BACKEND_ERROR: "Something went wrong. Please try again."
};

type FunctionErrorWithContext = Error & {
  context?: Response;
};

type SafeFunctionErrorBody = {
  error?: {
    code?: unknown;
    message?: unknown;
    requestId?: unknown;
    retryAfterSeconds?: unknown;
  };
};

export class AppFunctionError extends Error {
  public readonly code: AppErrorCode;
  public readonly requestId?: string;
  public readonly retryAfterSeconds?: number;

  constructor(code: AppErrorCode, options: { message?: string; requestId?: string; retryAfterSeconds?: number } = {}) {
    super(options.message ?? fallbackMessages[code]);
    this.name = "AppFunctionError";
    this.code = code;
    this.requestId = options.requestId;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

function isAppErrorCode(value: unknown): value is AppErrorCode {
  return typeof value === "string" && value in fallbackMessages;
}

function sanitizeLegacyMessage(message: string) {
  if (/rate.?limit|retry shortly|provider returned|429|upstream/i.test(message)) {
    return new AppFunctionError("AI_PROVIDER_BUSY");
  }

  if (/invalid ai|invalid json|validated|repair retry/i.test(message)) {
    return new AppFunctionError("AI_INVALID_RESPONSE");
  }

  if (/auth|jwt|unauthorized|sign in/i.test(message)) {
    return new AppFunctionError("UNAUTHORIZED");
  }

  if (/extract|parse|readable text|pdf/i.test(message)) {
    return new AppFunctionError("EXTRACTION_FAILED");
  }

  return new AppFunctionError("UNKNOWN_BACKEND_ERROR");
}

async function readFunctionError(error: unknown) {
  const typedError = error as Partial<FunctionErrorWithContext>;

  if (typedError.context instanceof Response) {
    const bodyText = await typedError.context.clone().text();

    if (bodyText) {
      try {
        const body = JSON.parse(bodyText) as SafeFunctionErrorBody;
        const safeError = body.error;
        const code = isAppErrorCode(safeError?.code) ? safeError.code : "UNKNOWN_BACKEND_ERROR";
        const requestId = typeof safeError?.requestId === "string" ? safeError.requestId : undefined;
        const retryAfterSeconds =
          typeof safeError?.retryAfterSeconds === "number" ? safeError.retryAfterSeconds : undefined;
        const message = typeof safeError?.message === "string" ? safeError.message : fallbackMessages[code];

        return new AppFunctionError(code, {
          message,
          requestId,
          retryAfterSeconds
        });
      } catch {
        return sanitizeLegacyMessage(bodyText);
      }
    }
  }

  const message = error instanceof Error ? error.message : "The backend function failed.";

  if (message === "Failed to send a request to the Edge Function") {
    return new AppFunctionError("SERVER_CONFIG_ERROR", {
      message: "The resume backend is not reachable. Please try again shortly."
    });
  }

  return sanitizeLegacyMessage(message);
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
    const appError = await readFunctionError(error);

    console.error("Supabase Edge Function failed", {
      functionName,
      code: appError.code,
      requestId: appError.requestId,
      retryAfterSeconds: appError.retryAfterSeconds
    });

    throw appError;
  }

  return data;
}
