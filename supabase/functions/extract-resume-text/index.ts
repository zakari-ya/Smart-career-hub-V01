import { getAuthenticatedUser, createServiceClient } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { errorResponse, jsonResponse } from "../_shared/errors.ts";
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
      return errorResponse("Resume not found.", 404);
    }

    if (!String(resume.storage_path).startsWith(`${user.id}/`)) {
      const reason = "Resume storage path does not match the authenticated user.";
      await markExtractionFailure(supabase, user.id, resume.id, resume.storage_path, reason);
      return errorResponse("Unauthorized resume storage path.", 403, { reason });
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
      const reason = error instanceof Error ? error.message : "Invalid resume file.";
      await markExtractionFailure(supabase, user.id, resume.id, resume.storage_path, reason, true);
      return errorResponse(reason, 400);
    }

    const { data: fileData, error: fileError } = await supabase.storage
      .from("resumes")
      .download(resume.storage_path);

    if (fileError || !fileData) {
      const reason = "Unable to access the private resume file.";
      await markExtractionFailure(supabase, user.id, resume.id, resume.storage_path, reason);
      return errorResponse(reason, 400);
    }

    let extractedText = "";

    try {
      extractedText = await extractTextFromBuffer(
        await fileData.arrayBuffer(),
        fileType,
        fileName
      );
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "We could not parse the resume text.";
      await markExtractionFailure(supabase, user.id, resume.id, resume.storage_path, reason);
      return errorResponse("Text extraction failed.", 400, { reason });
    }

    if (!extractedText.trim()) {
      const reason = "We could not extract readable text from this file.";
      await markExtractionFailure(supabase, user.id, resume.id, resume.storage_path, reason);
      return errorResponse("Text extraction failed.", 400, { reason });
    }

    await supabase
      .from("resumes")
      .update({
        extracted_text: extractedText,
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
        extractedCharacters: extractedText.length
      }
    });

    return jsonResponse({
      resumeId,
      extractionStatus: "completed",
      extractedTextLength: extractedText.length,
      preview: extractedText.slice(0, 240)
    });
  } catch (error) {
    console.error("extract-resume-text failed", error);
    return errorResponse(
      error instanceof Error ? error.message : "Unexpected extraction failure.",
      400
    );
  }
});
