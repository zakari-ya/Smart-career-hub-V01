import { requireSupabaseBrowserClient } from "@/lib/supabase/client";
import { invokeEdgeFunction } from "@/lib/supabase/functions";
import {
  analysisResultSchema,
  resumeAnalysisSchema
} from "@/features/analysis/schemas/resume-analysis-schema";
import type { AnalysisResult, DashboardOverview, ResumeAnalysis } from "@/features/analysis/types";

function getRawResult(row: Record<string, unknown>) {
  return row.result && typeof row.result === "object" && !Array.isArray(row.result)
    ? (row.result as Record<string, unknown>)
    : null;
}

function getBaseAnalysis(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    resumeId: String(row.resume_id ?? ""),
    provider: String(row.provider ?? "openrouter"),
    model: String(row.model ?? "unknown"),
    status: row.status === "failed" ? "failed" : row.status === "pending" ? "pending" : "completed",
    createdAt: String(row.created_at ?? new Date().toISOString()),
    failureReason: typeof row.failure_reason === "string" ? row.failure_reason : null
  } as const;
}

function parseV2Result(row: Record<string, unknown>): AnalysisResult | null {
  const rawResult = getRawResult(row);

  if (!rawResult) {
    return null;
  }

  const parsed = analysisResultSchema.safeParse(rawResult);

  return parsed.success ? parsed.data : null;
}

function mapAnalysisRow(row: Record<string, unknown>): ResumeAnalysis {
  const base = getBaseAnalysis(row);
  const result = parseV2Result(row);

  if (result) {
    return resumeAnalysisSchema.parse({
      ...base,
      schemaVersion: "v2",
      result
    });
  }

  return resumeAnalysisSchema.parse({
    ...base,
    schemaVersion: "legacy",
    legacyMessage:
      base.status === "completed"
        ? "This report was created before the upgraded resume analyzer. Re-run your resume to see the new coaching dashboard."
        : "This analysis does not have an upgraded result yet."
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
    client.from("analyses").select("result").eq("status", "completed")
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
    .map((row) => parseV2Result(row as Record<string, unknown>)?.scores.overall)
    .filter((score): score is number => Number.isFinite(score));

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
