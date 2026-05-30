import { z } from "zod";

const acceptedTypes = ["application/pdf", "text/plain", "text/markdown", "text/x-markdown"];
const acceptedExtensions = ["pdf", "txt", "md"];
const maxFileSize = 5 * 1024 * 1024;

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export const resumeUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Upload a resume file." })
    .refine(
      (file) => acceptedTypes.includes(file.type) || acceptedExtensions.includes(getExtension(file.name)),
      "Use PDF, TXT, or MD."
    )
    .refine((file) => file.size <= maxFileSize, "File must be smaller than 5MB.")
});

export type ResumeUploadSchema = z.infer<typeof resumeUploadSchema>;
