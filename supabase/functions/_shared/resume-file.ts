const allowedMimeTypes = new Set(["application/pdf", "text/plain", "text/markdown", "text/x-markdown"]);
const allowedExtensions = new Set(["pdf", "txt", "md"]);

export const maxResumeFileSizeBytes = 5 * 1024 * 1024;

export function deriveResumeTitle(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").trim() || "Untitled Resume";
}

function getExtension(fileNameOrPath: string) {
  return fileNameOrPath.split(".").pop()?.toLowerCase() ?? "";
}

export function buildDisplayFileName(title: string, fileType: string) {
  const extension = fileType === "application/pdf"
    ? "pdf"
    : fileType === "text/markdown" || fileType === "text/x-markdown"
      ? "md"
      : "txt";

  return `${title}.${extension}`;
}

export function assertValidResumeFile(input: {
  fileName: string;
  fileType: string;
  fileSize: number;
}) {
  const extension = getExtension(input.fileName);
  const isMarkdownByExtension = extension === "md" && (input.fileType === "" || input.fileType === "text/plain");

  if (!allowedMimeTypes.has(input.fileType) && !isMarkdownByExtension) {
    throw new Error("Invalid file type. Use PDF, TXT, or MD.");
  }

  if (input.fileSize <= 0 || input.fileSize > maxResumeFileSizeBytes) {
    throw new Error("Invalid file size. Resume files must be 5MB or smaller.");
  }

  if (!allowedExtensions.has(extension)) {
    throw new Error("Invalid file extension. Use PDF, TXT, or MD.");
  }
}
