import { requireSupabaseBrowserClient } from "@/lib/supabase/client";
import { invokeEdgeFunction } from "@/lib/supabase/functions";
import { uploadResumeFile } from "@/lib/supabase/storage";
import type { ResumeRecord, ResumeUploadResult, UploadPhase } from "@/features/resume/types";

type UploadResumeInput = {
  file: File;
  onPhaseChange?: (phase: UploadPhase) => void;
};

function deriveResumeTitle(fileName: string) {
  const sanitized = fileName.replace(/\.[^.]+$/, "").trim();
  return sanitized.length > 0 ? sanitized : "Untitled resume";
}

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function normalizeResumeFileType(file: File) {
  const extension = getExtension(file.name);

  if (file.type === "application/pdf" || extension === "pdf") {
    return "application/pdf";
  }

  if (file.type === "text/markdown" || file.type === "text/x-markdown" || extension === "md") {
    return "text/markdown";
  }

  return "text/plain";
}

function mapResumeRow(row: Record<string, unknown>): ResumeRecord {
  return {
    id: String(row.id),
    title: String(row.title),
    fileType: String(row.file_type),
    fileSize: Number(row.file_size),
    extractionStatus:
      row.extraction_status === "failed"
        ? "failed"
        : row.extraction_status === "pending"
          ? "pending"
          : "completed",
    extractionError: typeof row.extraction_error === "string" ? row.extraction_error : null,
    createdAt: String(row.created_at)
  };
}

async function removeUploadedFile(storagePath: string) {
  const client = requireSupabaseBrowserClient();
  await client.storage.from("resumes").remove([storagePath]);
}

export async function listResumes() {
  const client = requireSupabaseBrowserClient();

  const { data, error } = await client
    .from("resumes")
    .select("id, title, file_type, file_size, extraction_status, extraction_error, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapResumeRow(row as Record<string, unknown>));
}

export async function uploadResume({
  file,
  onPhaseChange
}: UploadResumeInput): Promise<ResumeUploadResult> {
  const client = requireSupabaseBrowserClient();
  const {
    data: { user }
  } = await client.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to upload a resume.");
  }

  const storagePath = `${user.id}/${Date.now()}-${file.name.replace(/\s+/g, "-").toLowerCase()}`;
  const title = deriveResumeTitle(file.name);
  const fileType = normalizeResumeFileType(file);

  onPhaseChange?.("uploading");

  const uploadResult = await uploadResumeFile(storagePath, file, fileType);
  if (uploadResult.error) {
    onPhaseChange?.("failed");
    throw uploadResult.error;
  }

  let resumeId = "";

  try {
    const { data: resumeRow, error: resumeError } = await client
      .from("resumes")
      .insert({
        title,
        file_name: file.name,
        storage_path: storagePath,
        file_type: fileType,
        mime_type: fileType,
        file_size: file.size,
        extraction_status: "pending"
      })
      .select("id")
      .single();

    if (resumeError || !resumeRow) {
      throw resumeError ?? new Error("Failed to create the resume record.");
    }

    resumeId = String(resumeRow.id);

    onPhaseChange?.("extracting");

    await invokeEdgeFunction(client, "extract-resume-text", { resumeId });

    onPhaseChange?.("analyzing");

    const analysisResponse = await invokeEdgeFunction<{ id?: string }>(client, "analyze-resume", {
      resumeId
    });

    if (!analysisResponse?.id) {
      throw new Error("The analysis service did not return a valid analysis record.");
    }

    onPhaseChange?.("completed");

    return {
      resumeId,
      analysisId: String(analysisResponse.id)
    };
  } catch (error) {
    onPhaseChange?.("failed");

    if (!resumeId) {
      await removeUploadedFile(storagePath);
    }

    throw error;
  }
}
