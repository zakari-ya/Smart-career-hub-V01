import { ArrowRight, CheckCircle2, FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import type { DragEvent, RefObject } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type UploadDropzoneProps = {
  disabled?: boolean;
  file?: File;
  inputRef: RefObject<HTMLInputElement | null>;
  isProcessing?: boolean;
  onAnalyze: () => void;
  onSelect: (file: File | null) => void;
  validationError?: string;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function UploadDropzone({
  disabled,
  file,
  inputRef,
  isProcessing,
  onAnalyze,
  onSelect,
  validationError
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled || isProcessing) {
      return;
    }

    onSelect(event.dataTransfer.files.item(0));
  };

  return (
    <Card className="relative min-w-0 max-w-full overflow-hidden rounded-[38px] bg-white/82 p-4 shadow-[0_28px_90px_rgba(15,23,32,0.1)] sm:p-5">
      <div className="absolute right-[-16%] top-[-28%] h-52 w-52 rounded-full bg-[rgba(18,183,166,0.12)] blur-[52px]" />
      <div className="relative grid min-w-0 gap-4">
        <div
          role="button"
          tabIndex={0}
          aria-label="Drag and drop resume file or browse"
          className={cn(
            "grid min-h-[250px] min-w-0 place-items-center rounded-[32px] border-2 border-dashed border-black/14 bg-[rgba(244,247,246,0.74)] p-5 text-center transition-transform duration-200 sm:min-h-[330px] sm:p-6",
            isDragging && "scale-[1.01] border-[var(--color-teal-500)] bg-[rgba(18,183,166,0.08)]",
            file && "border-[rgba(18,183,166,0.34)] bg-[rgba(18,183,166,0.055)]",
            (disabled || isProcessing) && "pointer-events-none opacity-70"
          )}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!disabled && !isProcessing) {
              setIsDragging(true);
            }
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <div className="grid max-w-full justify-items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-[26px] border border-black/8 bg-white text-[var(--color-graphite-700)] shadow-[0_18px_46px_rgba(15,23,32,0.08)] sm:h-18 sm:w-18">
              <UploadCloud className="h-7 w-7" />
            </div>
            <div className="min-w-0 max-w-full">
              <h3 className="font-[var(--font-heading)] text-2xl font-semibold tracking-[-0.035em] text-[var(--color-graphite-950)] sm:text-4xl">
                Drag & drop resume to upload
              </h3>
              <button
                type="button"
                className="mt-2 text-lg font-extrabold text-[var(--color-graphite-950)] underline decoration-[var(--color-graphite-950)] decoration-2 underline-offset-4 sm:text-2xl"
                onClick={(event) => {
                  event.stopPropagation();
                  inputRef.current?.click();
                }}
                disabled={disabled || isProcessing}
              >
                or browse
              </button>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-graphite-700)]">
                PDF, TXT, MD • Max 5MB
              </p>
            </div>
          </div>
        </div>

        {file ? (
          <div className="min-w-0 rounded-[28px] border border-black/8 bg-[var(--color-surface-100)] p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--color-graphite-700)]">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-[var(--color-graphite-950)] sm:text-lg">
                  {file.name}
                </p>
                <p className="text-sm font-medium text-[var(--color-graphite-700)]">
                  {formatFileSize(file.size)} • ready to analyze
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-[var(--color-success-500)]" />
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-graphite-700)] transition-colors hover:bg-white hover:text-[var(--color-danger-500)]"
                  onClick={() => onSelect(null)}
                  disabled={disabled || isProcessing}
                  aria-label="Remove selected file"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            {validationError ? (
              <p className="mt-3 rounded-2xl border border-[rgba(220,74,52,0.16)] bg-[rgba(220,74,52,0.06)] px-4 py-3 text-sm text-[var(--color-danger-500)]">
                {validationError}
              </p>
            ) : null}
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="min-w-44 bg-[var(--color-graphite-950)] text-white hover:bg-[var(--color-graphite-900)]"
                onClick={onAnalyze}
                disabled={isProcessing || Boolean(validationError)}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Working
                  </>
                ) : (
                  <>
                    Analyze resume
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : validationError ? (
          <p className="rounded-2xl border border-[rgba(220,74,52,0.16)] bg-[rgba(220,74,52,0.06)] px-4 py-3 text-sm text-[var(--color-danger-500)]">
            {validationError}
          </p>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,text/plain,text/markdown,application/pdf"
          className="hidden"
          disabled={disabled || isProcessing}
          onChange={(event) => onSelect(event.target.files?.item(0) ?? null)}
        />
      </div>
    </Card>
  );
}
