import { getAuthenticatedUser, createServiceClient } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { errorResponse, jsonResponse } from "../_shared/errors.ts";
import { analyzeResumeWithOpenRouter } from "../_shared/openrouter.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";
import { analyzeResumeStructure } from "../_shared/resume-pre-analysis.ts";
import { parseRequestBody, resumeActionSchema } from "../_shared/validators.ts";

Deno.serve(async (request) => {
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
      return errorResponse("Resume not found.", 404);
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
      return errorResponse("Unable to create the pending analysis.", 500);
    }

    if (resume.extraction_status !== "completed" || !resume.extracted_text?.trim()) {
      const reason =
        "Resume text is not ready for analysis. You need a successful extraction first.";

      await supabase
        .from("analyses")
        .update({
          status: "failed",
          failure_reason: reason
        })
        .eq("id", pendingAnalysis.id);

      return errorResponse("Resume text is not ready for analysis.", 400, {
        analysisId: pendingAnalysis.id,
        reason
      });
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
        return errorResponse("Unable to save the analysis.", 500);
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
      const reason =
        error instanceof Error ? error.message : "We could not generate a valid AI analysis.";

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
          reason
        }
      });

      return errorResponse("AI analysis failed.", 400, {
        analysisId: pendingAnalysis.id,
        reason
      });
    }
  } catch (error) {
    console.error("analyze-resume failed", error);
    return errorResponse(
      error instanceof Error ? error.message : "Unexpected analysis failure.",
      400
    );
  }
});
