import { corsHeaders } from "./cors.ts";

export type AppErrorCode =
  | "DAILY_LIMIT_REACHED"
  | "AI_PROVIDER_BUSY"
  | "AI_INVALID_RESPONSE"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "EXTRACTION_FAILED"
  | "SERVER_CONFIG_ERROR"
  | "UNKNOWN_BACKEND_ERROR";

const safeErrorMessages: Record<AppErrorCode, string> = {
  DAILY_LIMIT_REACHED: "You used today's AI analysis limit. Try again tomorrow.",
  AI_PROVIDER_BUSY: "The AI provider is busy right now. Please try again shortly.",
  AI_INVALID_RESPONSE: "The AI review could not be validated. Please try again.",
  UNAUTHORIZED: "Please sign in again.",
  NOT_FOUND: "We could not find this resume.",
  EXTRACTION_FAILED: "We could not read this resume. Try a cleaner PDF, TXT, or MD file.",
  SERVER_CONFIG_ERROR: "The resume service is not configured correctly yet.",
  UNKNOWN_BACKEND_ERROR: "Something went wrong. Please try again."
};

const defaultStatuses: Record<AppErrorCode, number> = {
  DAILY_LIMIT_REACHED: 429,
  AI_PROVIDER_BUSY: 429,
  AI_INVALID_RESPONSE: 502,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  EXTRACTION_FAILED: 400,
  SERVER_CONFIG_ERROR: 500,
  UNKNOWN_BACKEND_ERROR: 500
};

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly status: number;
  public readonly retryAfterSeconds?: number;
  public readonly debugDetails?: unknown;

  constructor(
    code: AppErrorCode,
    options: {
      cause?: unknown;
      debugDetails?: unknown;
      message?: string;
      retryAfterSeconds?: number;
      status?: number;
    } = {}
  ) {
    super(options.message ?? safeErrorMessages[code], { cause: options.cause });
    this.name = "AppError";
    this.code = code;
    this.status = options.status ?? defaultStatuses[code];
    this.retryAfterSeconds = options.retryAfterSeconds;
    this.debugDetails = options.debugDetails;
  }
}

export function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    },
    ...init
  });
}

export function createAppError(code: AppErrorCode, options: ConstructorParameters<typeof AppError>[1] = {}) {
  return new AppError(code, options);
}

export function getSafeErrorMessage(code: AppErrorCode) {
  return safeErrorMessages[code];
}

export function toAppError(error: unknown, fallbackCode: AppErrorCode = "UNKNOWN_BACKEND_ERROR") {
  if (error instanceof AppError) {
    return error;
  }

  const message = error instanceof Error ? error.message : "";

  if (/authentication required|jwt|unauthorized/i.test(message)) {
    return new AppError("UNAUTHORIZED", { cause: error, debugDetails: message });
  }

  if (/missing supabase|missing openrouter|server configuration|anon configuration/i.test(message)) {
    return new AppError("SERVER_CONFIG_ERROR", { cause: error, debugDetails: message });
  }

  if (/rate limit exceeded/i.test(message)) {
    return new AppError("DAILY_LIMIT_REACHED", { cause: error, debugDetails: message });
  }

  return new AppError(fallbackCode, { cause: error, debugDetails: message || error });
}

export function logBackendError(context: string, requestId: string, error: unknown, metadata?: Record<string, unknown>) {
  const appError = toAppError(error);

  console.error(context, {
    requestId,
    code: appError.code,
    message: error instanceof Error ? error.message : String(error),
    debugDetails: appError.debugDetails,
    metadata
  });
}

export function errorResponse(error: unknown, requestId: string, fallbackCode: AppErrorCode = "UNKNOWN_BACKEND_ERROR") {
  const appError = toAppError(error, fallbackCode);

  return jsonResponse(
    {
      error: {
        code: appError.code,
        message: getSafeErrorMessage(appError.code),
        requestId,
        ...(appError.retryAfterSeconds ? { retryAfterSeconds: appError.retryAfterSeconds } : {})
      }
    },
    { status: appError.status }
  );
}
