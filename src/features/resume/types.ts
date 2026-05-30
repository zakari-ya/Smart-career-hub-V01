export type ResumeRecord = {
  id: string;
  title: string;
  fileType: string;
  fileSize: number;
  extractionStatus: "pending" | "completed" | "failed";
  extractionError?: string | null;
  createdAt: string;
};

export type UploadPhase =
  | "idle"
  | "uploading"
  | "extracting"
  | "analyzing"
  | "completed"
  | "failed";

export type ResumeUploadResult = {
  resumeId: string;
  analysisId: string;
};
