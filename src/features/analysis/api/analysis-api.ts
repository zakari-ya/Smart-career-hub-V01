import { requireSupabaseBrowserClient } from "@/lib/supabase/client";
import { invokeEdgeFunction } from "@/lib/supabase/functions";
import { resumeAnalysisSchema } from "@/features/analysis/schemas/resume-analysis-schema";
import type { DashboardOverview, ResumeAnalysis } from "@/features/analysis/types";

const emptyAnalysisResult = {
  summary: "",
  strengths: [],
  weaknesses: [],
  suggestions: [],
  optimizedSummary: "",
  keywordImprovements: {
    missing: [],
    recommended: [],
    found: []
  },
  actionPlan: []
} as const;

function mapAnalysisRow(row: Record<string, unknown>): ResumeAnalysis {
  const rawResult =
    row.result && typeof row.result === "object" && !Array.isArray(row.result)
      ? (row.result as Record<string, unknown>)
      : null;

  return resumeAnalysisSchema.parse({
    id: String(row.id ?? crypto.randomUUID()),
    resumeId: String(row.resume_id ?? ""),
    provider: String(row.provider ?? "openrouter"),
    model: String(row.model ?? "unknown"),
    status: row.status === "failed" ? "failed" : row.status === "pending" ? "pending" : "completed",
    createdAt: String(row.created_at ?? new Date().toISOString()),
    overallScore: Number(row.overall_score ?? rawResult?.overallScore ?? 0),
    atsScore: Number(row.ats_score ?? rawResult?.atsScore ?? 0),
    keywordScore: Number(row.keyword_score ?? rawResult?.keywordScore ?? 0),
    impactScore: Number(row.impact_score ?? rawResult?.impactScore ?? 0),
    ...emptyAnalysisResult,
    ...(rawResult ?? {}),
    failureReason: typeof row.failure_reason === "string" ? row.failure_reason : null
  });
}

async function getLatestAnalysisRow() {
  const client = requireSupabaseBrowserClient();

  const { data, error } = await client
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getAnalysisById(analysisId: string) {
  const client = requireSupabaseBrowserClient();

  let data;

  if (analysisId === "latest") {
    data = await getLatestAnalysisRow();
  } else {
    const response = await client.from("analyses").select("*").eq("id", analysisId).maybeSingle();

    if (response.error) {
      throw response.error;
    }

    data = response.data;
  }

  if (!data) {
    return null;
  }

  return mapAnalysisRow(data as Record<string, unknown>);
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const client = requireSupabaseBrowserClient();

  const [recentAnalysesResponse, resumesCountResponse, completedAnalysesResponse] = await Promise.all([
    client.from("analyses").select("*").order("created_at", { ascending: false }).limit(12),
    client.from("resumes").select("id", { count: "exact", head: true }),
    client.from("analyses").select("overall_score").eq("status", "completed")
  ]);

  if (recentAnalysesResponse.error) {
    throw recentAnalysesResponse.error;
  }

  if (resumesCountResponse.error) {
    throw resumesCountResponse.error;
  }

  if (completedAnalysesResponse.error) {
    throw completedAnalysesResponse.error;
  }

  const recentAnalyses = (recentAnalysesResponse.data ?? []).map((row) =>
    mapAnalysisRow(row as Record<string, unknown>)
  );
  const completedScores = (completedAnalysesResponse.data ?? [])
    .map((row) => Number(row.overall_score ?? 0))
    .filter((score) => Number.isFinite(score));

  const averageScore = completedScores.length
    ? Math.round(completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length)
    : 0;

  return {
    latestAnalysis: recentAnalyses[0] ?? null,
    recentAnalyses,
    completedAnalyses: completedScores.length,
    resumesUploaded: resumesCountResponse.count ?? 0,
    averageScore
  };
}

export async function requestResumeAnalysis(resumeId: string) {
  const client = requireSupabaseBrowserClient();

  const data = await invokeEdgeFunction<{ id?: string }>(client, "analyze-resume", { resumeId });

  if (!data?.id) {
    throw new Error("The analysis service did not return a valid analysis record.");
  }

  return {
    analysisId: String(data.id)
  };
}
