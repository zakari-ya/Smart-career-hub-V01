import { getAuthenticatedUser, createServiceClient } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  createAppError,
  errorResponse,
  getSafeErrorMessage,
  jsonResponse,
  logBackendError,
  toAppError
} from "../_shared/errors.ts";
import { analyzeResumeWithOpenRouter } from "../_shared/openrouter.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";
import { analyzeResumeStructure } from "../_shared/resume-pre-analysis.ts";
import { parseRequestBody, resumeActionSchema } from "../_shared/validators.ts";

Deno.serve(async (request) => {
  const requestId = crypto.randomUUID();

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { resumeId } = await parseRequestBody(request, resumeActionSchema);
    const user = await getAuthenticatedUser(request);
    const supabase = createServiceClient();

    await checkRateLimit(supabase, user.id, "analyze-resume");

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, user_id, extracted_text, extraction_status, layout_metadata")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resumeError || !resume) {
      if (resumeError) {
        logBackendError("analyze-resume resume lookup failed", requestId, resumeError, { resumeId });
      }

      return errorResponse(createAppError("NOT_FOUND"), requestId);
    }

    const defaultModel =
      Deno.env.get("OPENROUTER_MODELS")?.split(",")[0]?.trim() ??
      Deno.env.get("OPENROUTER_MODEL") ??
      "openrouter/owl-alpha";

    const { data: pendingAnalysis, error: pendingError } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        resume_id: resume.id,
        provider: "openrouter",
        model: defaultModel,
        status: "pending"
      })
      .select("*")
      .single();

    if (pendingError || !pendingAnalysis) {
      logBackendError("analyze-resume pending row creation failed", requestId, pendingError, { resumeId });
      return errorResponse(createAppError("UNKNOWN_BACKEND_ERROR"), requestId);
    }

    if (resume.extraction_status !== "completed" || !resume.extracted_text?.trim()) {
      const safeError = createAppError("EXTRACTION_FAILED");
      const reason = getSafeErrorMessage(safeError.code);

      await supabase
        .from("analyses")
        .update({
          status: "failed",
          failure_reason: reason
        })
        .eq("id", pendingAnalysis.id);

      return errorResponse(safeError, requestId);
    }

    try {
      const preAnalysis = analyzeResumeStructure(
        resume.extracted_text,
        resume.layout_metadata && typeof resume.layout_metadata === "object"
          ? resume.layout_metadata
          : null
      );
      const { result, model } = await analyzeResumeWithOpenRouter(
        resume.extracted_text,
        preAnalysis
      );

      const { data: analysisRow, error: analysisError } = await supabase
        .from("analyses")
        .update({
          model,
          status: "completed",
          result,
          overall_score: Math.round(result.scores.overall),
          ats_score: Math.round(result.scores.ats),
          keyword_score: Math.round(result.scores.keywords),
          impact_score: Math.round(result.scores.impact),
          failure_reason: null
        })
        .eq("id", pendingAnalysis.id)
        .select("*")
        .single();

      if (analysisError || !analysisRow) {
        logBackendError("analyze-resume save analysis failed", requestId, analysisError, {
          analysisId: pendingAnalysis.id,
          resumeId
        });
        return errorResponse(createAppError("UNKNOWN_BACKEND_ERROR"), requestId);
      }

      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "analyze_resume",
        resource_type: "analysis",
        resource_id: analysisRow.id,
        metadata: {
          resumeId: resume.id,
          model,
          preAnalysis,
          scores: {
            overall: result.scores.overall,
            ats: result.scores.ats,
            structure: result.scores.structure,
            content: result.scores.content,
            impact: result.scores.impact,
            keywords: result.scores.keywords
          }
        }
      });

      return jsonResponse({
        id: analysisRow.id,
        resumeId: analysisRow.resume_id,
        provider: analysisRow.provider,
        model: analysisRow.model,
        status: analysisRow.status,
        result: analysisRow.result,
        overallScore: result.scores.overall,
        atsScore: result.scores.ats,
        keywordScore: result.scores.keywords,
        impactScore: result.scores.impact,
        failureReason: analysisRow.failure_reason,
        createdAt: analysisRow.created_at,
        updatedAt: analysisRow.updated_at
      });
    } catch (error) {
      const appError = toAppError(error, "AI_INVALID_RESPONSE");
      const reason = getSafeErrorMessage(appError.code);

      logBackendError("analyze-resume AI generation failed", requestId, error, {
        analysisId: pendingAnalysis.id,
        resumeId
      });

      await supabase
        .from("analyses")
        .update({
          status: "failed",
          failure_reason: reason
        })
        .eq("id", pendingAnalysis.id);

      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "analyze_resume_failed",
        resource_type: "analysis",
        resource_id: pendingAnalysis.id,
        metadata: {
          resumeId: resume.id,
          code: appError.code,
          requestId,
          reason
        }
      });

      return errorResponse(appError, requestId, "AI_INVALID_RESPONSE");
    }
  } catch (error) {
    logBackendError("analyze-resume failed", requestId, error);
    return errorResponse(error, requestId);
  }
});
