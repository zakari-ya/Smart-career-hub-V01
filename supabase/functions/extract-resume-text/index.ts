import { getAuthenticatedUser, createServiceClient } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  createAppError,
  errorResponse,
  getSafeErrorMessage,
  jsonResponse,
  logBackendError
} from "../_shared/errors.ts";
import { extractTextFromBuffer } from "../_shared/pdf-extract.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";
import { assertValidResumeFile } from "../_shared/resume-file.ts";
import { parseRequestBody, resumeActionSchema } from "../_shared/validators.ts";

type ServiceClient = ReturnType<typeof createServiceClient>;

async function markExtractionFailure(
  supabase: ServiceClient,
  userId: string,
  resumeId: string,
  storagePath: string,
  reason: string,
  removeFile = false
) {
  await supabase
    .from("resumes")
    .update({
      extraction_status: "failed",
      extraction_error: reason
    })
    .eq("id", resumeId)
    .eq("user_id", userId);

  if (removeFile) {
    await supabase.storage.from("resumes").remove([storagePath]);
  }

  await supabase.from("audit_logs").insert({
    user_id: userId,
    action: "extract_resume_text_failed",
    resource_type: "resume",
    resource_id: resumeId,
    metadata: {
      reason
    }
  });
}

Deno.serve(async (request) => {
  const requestId = crypto.randomUUID();

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { resumeId } = await parseRequestBody(request, resumeActionSchema);
    const user = await getAuthenticatedUser(request);
    const supabase = createServiceClient();

    await checkRateLimit(supabase, user.id, "extract-resume-text");

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, user_id, title, file_name, storage_path, file_type, mime_type, file_size")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resumeError || !resume) {
      if (resumeError) {
        logBackendError("extract-resume-text resume lookup failed", requestId, resumeError, { resumeId });
      }

      return errorResponse(createAppError("NOT_FOUND"), requestId);
    }

    if (!String(resume.storage_path).startsWith(`${user.id}/`)) {
      const safeError = createAppError("UNAUTHORIZED");
      const reason = getSafeErrorMessage(safeError.code);
      logBackendError("extract-resume-text unauthorized storage path", requestId, safeError, {
        resumeId,
        storagePath: resume.storage_path
      });
      await markExtractionFailure(supabase, user.id, resume.id, resume.storage_path, reason);
      return errorResponse(safeError, requestId);
    }

    const fileName = String(resume.file_name ?? resume.title ?? "resume.txt");
    const fileType = String(resume.mime_type ?? resume.file_type ?? "");

    try {
      assertValidResumeFile({
        fileName,
        fileType,
        fileSize: Number(resume.file_size ?? 0)
      });
    } catch (error) {
      const safeError = createAppError("EXTRACTION_FAILED", { cause: error, debugDetails: error });
      const reason = getSafeErrorMessage(safeError.code);
      logBackendError("extract-resume-text invalid file", requestId, error, { resumeId, fileName, fileType });
      await markExtractionFailure(supabase, user.id, resume.id, resume.storage_path, reason, true);
      return errorResponse(safeError, requestId);
    }

    const { data: fileData, error: fileError } = await supabase.storage
      .from("resumes")
      .download(resume.storage_path);

    if (fileError || !fileData) {
      const safeError = createAppError("EXTRACTION_FAILED", { cause: fileError, debugDetails: fileError });
      const reason = getSafeErrorMessage(safeError.code);
      logBackendError("extract-resume-text storage download failed", requestId, fileError, { resumeId });
      await markExtractionFailure(supabase, user.id, resume.id, resume.storage_path, reason);
      return errorResponse(safeError, requestId);
    }

    let extractedText = "";
    let layoutMetadata = {};

    try {
      const extraction = await extractTextFromBuffer(
        await fileData.arrayBuffer(),
        fileType,
        fileName
      );
      extractedText = extraction.text;
      layoutMetadata = extraction.layoutMetadata;
    } catch (error) {
      const safeError = createAppError("EXTRACTION_FAILED", { cause: error, debugDetails: error });
      const reason = getSafeErrorMessage(safeError.code);
      logBackendError("extract-resume-text parsing failed", requestId, error, { resumeId, fileName, fileType });
      await markExtractionFailure(supabase, user.id, resume.id, resume.storage_path, reason);
      return errorResponse(safeError, requestId);
    }

    if (!extractedText.trim()) {
      const safeError = createAppError("EXTRACTION_FAILED");
      const reason = getSafeErrorMessage(safeError.code);
      logBackendError("extract-resume-text empty text", requestId, safeError, { resumeId, fileName, fileType });
      await markExtractionFailure(supabase, user.id, resume.id, resume.storage_path, reason);
      return errorResponse(safeError, requestId);
    }

    await supabase
      .from("resumes")
      .update({
        extracted_text: extractedText,
        layout_metadata: layoutMetadata,
        extraction_status: "completed",
        extraction_error: null
      })
      .eq("id", resume.id)
      .eq("user_id", user.id);

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "extract_resume_text",
      resource_type: "resume",
      resource_id: resume.id,
      metadata: {
        fileType,
        mimeType: resume.mime_type,
        extractedCharacters: extractedText.length,
        layoutMetadata
      }
    });

    return jsonResponse({
      resumeId,
      extractionStatus: "completed",
      extractedTextLength: extractedText.length,
      layoutMetadata,
      preview: extractedText.slice(0, 240)
    });
  } catch (error) {
    logBackendError("extract-resume-text failed", requestId, error);
    return errorResponse(error, requestId);
  }
});
