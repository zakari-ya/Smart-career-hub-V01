import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  FileSearch,
  Gauge,
  Lightbulb,
  LoaderCircle,
  SearchCheck,
  Sparkles,
  Target,
  TrendingUp
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBreakdownChart } from "@/features/analysis/components/score-breakdown-chart";
import { useResumeAnalysis } from "@/features/analysis/hooks/use-resume-analysis";
import type { ResumeAnalysis } from "@/features/analysis/types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatScore } from "@/lib/utils";

const scoreCards = [
  { key: "overallScore", label: "Overall", icon: Gauge },
  { key: "atsScore", label: "ATS", icon: SearchCheck },
  { key: "keywordScore", label: "Keywords", icon: Sparkles },
  { key: "impactScore", label: "Impact", icon: TrendingUp }
] as const;

function getScoreTone(score: number) {
  if (score >= 85) {
    return "Strong";
  }

  if (score >= 70) {
    return "Close";
  }

  return "Needs work";
}

function getPriorityClass(priority: "high" | "medium" | "low") {
  if (priority === "high") {
    return "border-[rgba(220,74,52,0.22)] bg-[rgba(220,74,52,0.06)] text-[var(--color-danger-500)]";
  }

  if (priority === "medium") {
    return "border-[rgba(209,140,58,0.24)] bg-[rgba(209,140,58,0.08)] text-[var(--color-warning-500)]";
  }

  return "border-[rgba(18,183,166,0.24)] bg-[rgba(18,183,166,0.08)] text-[var(--color-teal-500)]";
}

function MiniScoreGrid({ analysis }: { analysis: ResumeAnalysis }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {scoreCards.map((item) => {
        const Icon = item.icon;
        const score = analysis[item.key];

        return (
          <div key={item.key} className="rounded-[24px] border border-black/6 bg-white/76 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-graphite-700)]">
                  {item.label}
                </p>
                <p className="mt-2 font-[var(--font-heading)] text-3xl font-semibold text-[var(--color-graphite-950)]">
                  {formatScore(score)}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-surface-200)] text-[var(--color-graphite-900)]">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={score} />
            </div>
            <p className="mt-3 text-xs font-semibold text-[var(--color-graphite-700)]">{getScoreTone(score)}</p>
          </div>
        );
      })}
    </div>
  );
}

function InsightList({
  items,
  icon: Icon,
  emptyCopy,
  tone
}: {
  items: string[];
  icon: typeof CheckCircle2;
  emptyCopy: string;
  tone: "good" | "warning" | "idea";
}) {
  const color =
    tone === "good"
      ? "text-[var(--color-success-500)]"
      : tone === "warning"
        ? "text-[var(--color-warning-500)]"
        : "text-[var(--color-teal-500)]";

  if (!items.length) {
    return (
      <div className="rounded-[20px] border border-dashed border-black/8 bg-[var(--color-surface-100)] p-4 text-sm leading-6 text-[var(--color-graphite-700)]">
        {emptyCopy}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item} className="flex gap-3 rounded-[20px] border border-black/6 bg-white/74 p-4 text-sm leading-6 text-[var(--color-graphite-700)]">
          <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function KeywordPillGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-[22px] border border-black/6 bg-white/74 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-graphite-700)]">{label}</p>
      {items.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={`${label}-${item}`} className="rounded-full border border-black/8 bg-[var(--color-surface-100)] px-3 py-1.5 text-xs font-semibold text-[var(--color-graphite-800)]">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-[var(--color-graphite-700)]">No keywords in this group yet.</p>
      )}
    </div>
  );
}

export function ResumeResultPage() {
  const { analysisId = "latest" } = useParams();
  const { data: analysis, error, isLoading } = useResumeAnalysis(analysisId);

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="We couldn’t load this analysis"
        description={error instanceof Error ? error.message : "Please try again."}
        actionLabel="Upload a resume"
        onAction={() => {
          window.location.href = "/dashboard/resume/upload";
        }}
      />
    );
  }

  if (!analysis) {
    return (
      <EmptyState
        icon={FileSearch}
        title="No analysis available yet"
        description="Upload a resume to generate your first real analytics dashboard."
        actionLabel="Upload resume"
        onAction={() => {
          window.location.href = "/dashboard/resume/upload";
        }}
      />
    );
  }

  if (analysis.status === "pending") {
    return (
      <Card className="rounded-[34px]">
        <CardDescription>Analysis in progress</CardDescription>
        <CardTitle className="mt-2">Your resume is still being processed</CardTitle>
        <div className="mt-5 flex items-start gap-3 rounded-[24px] border border-black/6 bg-[var(--color-surface-100)] p-5">
          <LoaderCircle className="mt-0.5 h-5 w-5 animate-spin text-[var(--color-teal-500)]" />
          <p className="text-sm leading-7 text-[var(--color-graphite-700)]">
            The backend is finishing extraction or analysis. This page will refresh automatically when the completed result is ready.
          </p>
        </div>
      </Card>
    );
  }

  if (analysis.status === "failed") {
    return (
      <Card className="rounded-[34px]">
        <CardDescription>Analysis failed</CardDescription>
        <CardTitle className="mt-2">Your resume could not be analyzed safely</CardTitle>
        <div className="mt-5 rounded-[24px] border border-[rgba(220,74,52,0.18)] bg-[rgba(220,74,52,0.06)] p-5 text-sm leading-7 text-[var(--color-danger-500)]">
          {analysis.failureReason ?? "The analysis service returned an invalid result. Please upload the file again."}
        </div>
        <div className="mt-6">
          <Button asChild variant="secondary">
            <Link to="/dashboard/resume/upload">Upload another resume</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-[34px] border border-black/6 bg-[linear-gradient(135deg,#101820_0%,#17323a_58%,#0fb8a7_150%)] text-white shadow-[0_24px_80px_rgba(15,23,32,0.14)]">
        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1.1fr_0.9fr] xl:p-7">
          <div className="flex min-h-[320px] flex-col justify-between">
            <div>
              <Badge className="border-white/10 bg-white/8 text-white/78">Resume review</Badge>
              <h1 className="mt-5 max-w-3xl font-[var(--font-heading)] text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Your resume is at {formatScore(analysis.overallScore)}. Here is the fastest path to make it stronger.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/74 sm:text-base">
                {analysis.summary}
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {analysis.actionPlan.slice(0, 3).map((step, index) => (
                <div key={`${step.priority}-${step.task}`} className="rounded-[22px] border border-white/10 bg-white/8 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/58">
                      Step 0{index + 1}
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold uppercase text-white/72">
                      {step.priority}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-6 text-white">{step.task}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white/62">Score diagnosis</p>
                <p className="mt-1 font-[var(--font-heading)] text-5xl font-semibold text-white">
                  {formatScore(analysis.overallScore)}
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--color-teal-500)] text-[var(--color-graphite-950)]">
                <Target className="h-7 w-7" />
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {scoreCards.slice(1).map((item) => {
                const score = analysis[item.key];
                return (
                  <div key={item.key} className="rounded-[20px] border border-white/10 bg-white/[0.08] p-4">
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="font-semibold text-white">{item.label}</span>
                      <span className="text-white/68">{formatScore(score)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/12">
                      <div
                        className="h-full rounded-full bg-[var(--color-teal-300)]"
                        style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <MiniScoreGrid analysis={analysis} />

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <ScoreBreakdownChart analysis={analysis} />

        <Card className="h-full rounded-[30px]">
          <CardDescription>Rewrite-ready summary</CardDescription>
          <CardTitle className="mt-2">A stronger opening you can adapt</CardTitle>
          <div className="mt-5 rounded-[24px] border border-black/6 bg-[var(--color-surface-100)] p-5 text-sm leading-7 text-[var(--color-graphite-700)]">
            {analysis.optimizedSummary}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => void navigator.clipboard.writeText(analysis.optimizedSummary)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy summary
            </Button>
            <Button asChild variant="teal">
              <Link to="/dashboard/resume/upload">
                Upload revision
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </section>

      <Tabs defaultValue="fixes" className="grid gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-graphite-700)]">
              Focused feedback
            </p>
            <h2 className="mt-2 font-[var(--font-heading)] text-3xl font-semibold text-[var(--color-graphite-950)]">
              Read what matters, then revise.
            </h2>
          </div>
          <TabsList className="w-full overflow-x-auto sm:w-auto">
            <TabsTrigger value="fixes">Fix first</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="fixes">
          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-[30px]">
              <CardDescription>Priority queue</CardDescription>
              <CardTitle className="mt-2">What you should improve first</CardTitle>
              <div className="mt-5 grid gap-3">
                {analysis.actionPlan.map((step, index) => (
                  <div key={`${step.priority}-${step.task}`} className="rounded-[22px] border border-black/6 bg-white/74 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold leading-6 text-[var(--color-graphite-950)]">
                        {index + 1}. {step.task}
                      </p>
                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${getPriorityClass(step.priority)}`}>
                        {step.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[30px]">
              <CardDescription>Suggestions</CardDescription>
              <CardTitle className="mt-2">Practical edits that raise quality</CardTitle>
              <div className="mt-5">
                <InsightList
                  items={analysis.suggestions}
                  icon={Lightbulb}
                  tone="idea"
                  emptyCopy="Suggestions will appear here after analysis."
                />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="signals">
          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="rounded-[30px]">
              <CardDescription>Strengths</CardDescription>
              <CardTitle className="mt-2">What is already working</CardTitle>
              <div className="mt-5">
                <InsightList
                  items={analysis.strengths}
                  icon={CheckCircle2}
                  tone="good"
                  emptyCopy="Strengths will appear here after analysis."
                />
              </div>
            </Card>
            <Card className="rounded-[30px]">
              <CardDescription>Weaknesses</CardDescription>
              <CardTitle className="mt-2">Where recruiters may hesitate</CardTitle>
              <div className="mt-5">
                <InsightList
                  items={analysis.weaknesses}
                  icon={AlertTriangle}
                  tone="warning"
                  emptyCopy="Weaknesses will appear here after analysis."
                />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keywords">
          <div className="grid gap-5 xl:grid-cols-3">
            <KeywordPillGroup label="Missing" items={analysis.keywordImprovements.missing} />
            <KeywordPillGroup label="Recommended" items={analysis.keywordImprovements.recommended} />
            <KeywordPillGroup label="Already found" items={analysis.keywordImprovements.found} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
