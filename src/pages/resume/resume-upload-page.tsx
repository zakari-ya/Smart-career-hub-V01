import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ResumeLibraryCard } from "@/features/resume/components/resume-library-card";
import { UploadDropzone } from "@/features/resume/components/upload-dropzone";
import { UploadPipelineCard } from "@/features/resume/components/upload-pipeline-card";
import { useResumes } from "@/features/resume/hooks/use-resumes";
import { useUploadResume } from "@/features/resume/hooks/use-upload-resume";
import { resumeUploadSchema, type ResumeUploadSchema } from "@/features/resume/schemas/resume-upload-schema";
import type { UploadPhase } from "@/features/resume/types";
import { useToast } from "@/hooks/use-toast";
import { AppFunctionError } from "@/lib/supabase/functions";

const phaseHeadlines: Record<UploadPhase, { title: string; subtitle: string }> = {
  idle: {
    title: "Upload your resume",
    subtitle: "We will show upload, extraction, AI review, and result creation live."
  },
  uploading: {
    title: "Securing your file",
    subtitle: "Your resume is moving into private storage."
  },
  extracting: {
    title: "Reading your resume",
    subtitle: "The backend is extracting clean text and checking ownership."
  },
  analyzing: {
    title: "AI coach is analyzing",
    subtitle: "The model is reviewing ATS, keywords, impact, and next actions."
  },
  completed: {
    title: "Analysis ready",
    subtitle: "Opening your result dashboard now."
  },
  failed: {
    title: "Something stopped",
    subtitle: "No private data was exposed. Review the error and try again."
  }
};

function getUploadErrorCopy(error: unknown) {
  if (error instanceof AppFunctionError) {
    const retryCopy = error.retryAfterSeconds
      ? ` Try again in about ${Math.max(error.retryAfterSeconds, 1)} seconds.`
      : "";

    if (error.code === "DAILY_LIMIT_REACHED") {
      return {
        title: "Daily limit reached",
        message: error.message
      };
    }

    if (error.code === "AI_PROVIDER_BUSY") {
      return {
        title: "AI is busy",
        message: `${error.message}${retryCopy}`
      };
    }

    if (error.code === "EXTRACTION_FAILED") {
      return {
        title: "Resume could not be read",
        message: error.message
      };
    }

    if (error.code === "UNAUTHORIZED") {
      return {
        title: "Sign in again",
        message: error.message
      };
    }

    return {
      title: "Analysis stopped",
      message: error.message
    };
  }

  return {
    title: "Upload failed",
    message: error instanceof Error ? error.message : "Please try again."
  };
}

export function ResumeUploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [uploadError, setUploadError] = useState<string | undefined>();
  const form = useForm<ResumeUploadSchema>({
    resolver: zodResolver(resumeUploadSchema),
    defaultValues: {
      file: undefined
    }
  });
  const uploadMutation = useUploadResume();
  const resumesQuery = useResumes();

  const selectedFile = form.watch("file");
  const isProcessing =
    uploadPhase === "uploading" || uploadPhase === "extracting" || uploadPhase === "analyzing";
  const headline = phaseHeadlines[selectedFile ? uploadPhase : "idle"];

  const handleSubmit = form.handleSubmit(async (values) => {
    setUploadError(undefined);

    try {
      const result = await uploadMutation.mutateAsync({
        file: values.file,
        onPhaseChange: (phase) => {
          setUploadPhase(phase);
        }
      });

      toast({
        title: "Resume analyzed",
        description: "Your result dashboard is ready."
      });

      navigate(`/dashboard/analyses/${result.analysisId}`);
    } catch (error) {
      const { message, title } = getUploadErrorCopy(error);
      setUploadPhase("failed");
      setUploadError(message);

      toast({
        title,
        description: message,
        variant: "destructive"
      });
    }
  });

  return (
    <div className="grid w-full max-w-full gap-4 overflow-x-clip">
      <section className="grid min-w-0 max-w-full gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] xl:items-stretch">
        <Card className="relative min-w-0 overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,#111c27_0%,#17343d_66%,#0f766e_170%)] p-5 text-white sm:p-6">
          <div className="absolute right-[-10%] top-[-26%] h-56 w-56 rounded-full bg-[rgba(18,183,166,0.18)] blur-[58px]" />
          <div className="relative z-10 min-w-0">
            <CardDescription className="text-white/52">Resume upload</CardDescription>
            <CardTitle className="mt-2 max-w-2xl text-4xl leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl">
              {headline.title}
            </CardTitle>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">{headline.subtitle}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, label: "Private storage" },
                { icon: Sparkles, label: "Server-side AI" },
                { icon: Clock3, label: "Live pipeline" }
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                    <Icon className="h-4 w-4 text-[var(--color-teal-300)]" />
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/72">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className="min-w-0 rounded-[34px] bg-white/74 p-5">
          <CardDescription>What you will see</CardDescription>
          <CardTitle className="mt-2 text-2xl">No waiting in silence</CardTitle>
          <div className="mt-5 grid gap-3">
            {[
              "Upload confirms when the file reaches private storage.",
              "Extraction confirms when backend text parsing starts.",
              "AI review shows a live analyzing state until scores are saved."
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-[22px] bg-[var(--color-surface-100)] p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-teal-500)]" />
                <p className="text-sm leading-6 text-[var(--color-graphite-700)]">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid min-w-0 max-w-full gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <div className="grid min-w-0 max-w-full gap-4">
          <UploadDropzone
            disabled={isProcessing}
            file={selectedFile}
            inputRef={inputRef}
            isProcessing={isProcessing}
            onAnalyze={() => void handleSubmit()}
            onSelect={(file) => {
              if (file) {
                setUploadPhase("idle");
                setUploadError(undefined);
                form.setValue("file", file, {
                  shouldValidate: true,
                  shouldDirty: true
                });
              } else {
                setUploadPhase("idle");
                setUploadError(undefined);
                form.resetField("file");
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }
            }}
            validationError={form.formState.errors.file?.message}
          />
          <UploadPipelineCard
            phase={selectedFile ? uploadPhase : "idle"}
            fileName={selectedFile?.name}
            errorMessage={uploadError}
          />
        </div>

        <div className="grid min-w-0 max-w-full gap-4 xl:sticky xl:top-24 xl:self-start">
          <ResumeLibraryCard
            resumes={resumesQuery.data ?? []}
            isLoading={resumesQuery.isLoading}
            errorMessage={resumesQuery.error instanceof Error ? resumesQuery.error.message : undefined}
          />
        </div>
      </section>
    </div>
  );
}
