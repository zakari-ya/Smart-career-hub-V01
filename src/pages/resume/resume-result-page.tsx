import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  FileSearch,
  Gauge,
  Github,
  Globe2,
  LayoutDashboard,
  Lightbulb,
  Linkedin,
  LoaderCircle,
  Mail,
  Phone,
  RefreshCw,
  SearchCheck,
  Target,
  TrendingUp
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreBreakdownChart } from "@/features/analysis/components/score-breakdown-chart";
import { useResumeAnalysis } from "@/features/analysis/hooks/use-resume-analysis";
import { hasV2Result, type ResumeAnalysisV2 } from "@/features/analysis/types";
import { formatScore } from "@/lib/utils";

const scoreCards = [
  { key: "overall", label: "Overall", icon: Gauge },
  { key: "ats", label: "ATS", icon: SearchCheck },
  { key: "structure", label: "Structure", icon: LayoutDashboard },
  { key: "impact", label: "Impact", icon: TrendingUp }
] as const;

function getScoreTone(score: number) {
  if (score >= 90) {
    return "Excellent";
  }

  if (score >= 75) {
    return "Good";
  }

  if (score >= 60) {
    return "Needs focus";
  }

  return "At risk";
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

function formatEnum(value: string) {
  return value.replaceAll("_", " ");
}

function MiniScoreGrid({ analysis }: { analysis: ResumeAnalysisV2 }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {scoreCards.map((item) => {
        const Icon = item.icon;
        const score = analysis.result.scores[item.key];

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

function ContactCheckCard({ analysis }: { analysis: ResumeAnalysisV2 }) {
  const contactItems = [
    { label: "Email", value: analysis.result.contactCheck.hasEmail, icon: Mail },
    { label: "Phone", value: analysis.result.contactCheck.hasPhone, icon: Phone },
    { label: "LinkedIn", value: analysis.result.contactCheck.hasLinkedIn, icon: Linkedin },
    { label: "GitHub", value: analysis.result.contactCheck.hasGithub, icon: Github },
    { label: "Portfolio", value: analysis.result.contactCheck.hasPortfolio, icon: Globe2 }
  ];

  return (
    <Card className="rounded-[30px]">
      <CardDescription>Contact check</CardDescription>
      <CardTitle className="mt-2">Can recruiters reach you fast?</CardTitle>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {contactItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="flex items-center gap-3 rounded-[20px] border border-black/6 bg-white/74 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.value ? "bg-[rgba(19,135,93,0.12)] text-[var(--color-success-500)]" : "bg-[rgba(220,74,52,0.08)] text-[var(--color-danger-500)]"}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-graphite-950)]">{item.label}</p>
                <p className="text-xs text-[var(--color-graphite-700)]">{item.value ? "Detected" : "Missing"}</p>
              </div>
            </div>
          );
        })}
      </div>
      {analysis.result.contactCheck.missingContactItems.length ? (
        <div className="mt-4 rounded-[22px] border border-[rgba(209,140,58,0.2)] bg-[rgba(209,140,58,0.08)] p-4 text-sm leading-6 text-[var(--color-warning-500)]">
          Add: {analysis.result.contactCheck.missingContactItems.join(", ")}.
        </div>
      ) : null}
    </Card>
  );
}

function StructureCheckCard({ analysis }: { analysis: ResumeAnalysisV2 }) {
  return (
    <Card className="rounded-[30px]">
      <CardDescription>Structure and ATS</CardDescription>
      <CardTitle className="mt-2">Parsing risk before recruiters read it</CardTitle>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[22px] border border-black/6 bg-white/74 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-graphite-700)]">Layout</p>
          <p className="mt-2 font-[var(--font-heading)] text-2xl font-semibold capitalize text-[var(--color-graphite-950)]">
            {formatEnum(analysis.result.structureCheck.layoutType)}
          </p>
        </div>
        <div className="rounded-[22px] border border-black/6 bg-white/74 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-graphite-700)]">ATS risk</p>
          <p className="mt-2 font-[var(--font-heading)] text-2xl font-semibold capitalize text-[var(--color-graphite-950)]">
            {analysis.result.structureCheck.atsRiskLevel}
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <KeywordPillGroup label="Detected sections" items={analysis.result.structureCheck.detectedSections} />
        <KeywordPillGroup label="Missing sections" items={analysis.result.structureCheck.missingSections} />
      </div>
      {analysis.result.structureCheck.layoutWarnings.length ? (
        <div className="mt-4">
          <InsightList
            items={analysis.result.structureCheck.layoutWarnings}
            icon={AlertTriangle}
            tone="warning"
            emptyCopy="No layout warnings were detected."
          />
        </div>
      ) : null}
    </Card>
  );
}

function BulletQualityCard({ analysis }: { analysis: ResumeAnalysisV2 }) {
  return (
    <Card className="rounded-[30px]">
      <CardDescription>Bullet quality</CardDescription>
      <CardTitle className="mt-2">Are your bullets clear and measurable?</CardTitle>
      <div className="mt-5 rounded-[22px] border border-black/6 bg-[var(--color-surface-100)] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--color-graphite-950)]">Bullet score</p>
            <p className="mt-1 text-xs text-[var(--color-graphite-700)]">XYZ formula and scan quality</p>
          </div>
          <p className="font-[var(--font-heading)] text-4xl font-semibold text-[var(--color-graphite-950)]">
            {formatScore(analysis.result.bulletQuality.score)}
          </p>
        </div>
        <Progress className="mt-4" value={analysis.result.bulletQuality.score} />
        <p className="mt-4 text-sm leading-6 text-[var(--color-graphite-700)]">
          {analysis.result.bulletQuality.xyzGuidance}
        </p>
      </div>

      {analysis.result.bulletQuality.tooLongBullets.length ? (
        <div className="mt-5">
          <InsightList
            items={analysis.result.bulletQuality.tooLongBullets}
            icon={AlertTriangle}
            tone="warning"
            emptyCopy="No long bullets were flagged."
          />
        </div>
      ) : null}

      {analysis.result.bulletQuality.weakBullets.length ? (
        <div className="mt-5 grid gap-3">
          {analysis.result.bulletQuality.weakBullets.map((bullet) => (
            <div key={`${bullet.original}-${bullet.problem}`} className="rounded-[22px] border border-black/6 bg-white/74 p-4">
              <Badge className="w-fit">{bullet.missingPart === "none" ? "Close" : `Missing ${bullet.missingPart}`}</Badge>
              <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-graphite-950)]">{bullet.problem}</p>
              <p className="mt-3 rounded-2xl bg-[var(--color-surface-100)] p-3 text-sm leading-6 text-[var(--color-graphite-700)]">
                {bullet.improvedVersion}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
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

  if (!hasV2Result(analysis)) {
    return (
      <Card className="rounded-[34px]">
        <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[var(--color-surface-200)] text-[var(--color-graphite-950)]">
          <RefreshCw className="h-6 w-6" />
        </div>
        <CardDescription className="mt-6">Upgraded analyzer available</CardDescription>
        <CardTitle className="mt-2">Re-run your resume to see the professional report</CardTitle>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-graphite-700)]">
          {analysis.legacyMessage}
        </p>
        <div className="mt-6">
          <Button asChild variant="teal">
            <Link to="/dashboard/resume/upload">Upload resume again</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-[34px] border border-black/6 bg-[linear-gradient(135deg,#101820_0%,#17323a_58%,#0fb8a7_150%)] text-white shadow-[0_24px_80px_rgba(15,23,32,0.14)]">
        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1.08fr_0.92fr] xl:p-7">
          <div className="flex min-h-[320px] flex-col justify-between">
            <div>
              <Badge className="border-white/10 bg-white/8 text-white/78">{analysis.result.verdict.label}</Badge>
              <h1 className="mt-5 max-w-3xl font-[var(--font-heading)] text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Your resume scores {formatScore(analysis.result.scores.overall)}. Here is what to fix first.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/74 sm:text-base">
                {analysis.result.verdict.message}
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {analysis.result.quickWins.slice(0, 3).map((item, index) => (
                <div key={item} className="rounded-[22px] border border-white/10 bg-white/8 p-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/58">
                    Win 0{index + 1}
                  </span>
                  <p className="mt-3 text-sm font-semibold leading-6 text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white/62">Career signal</p>
                <p className="mt-1 font-[var(--font-heading)] text-5xl font-semibold text-white">
                  {formatScore(analysis.result.scores.overall)}
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--color-teal-500)] text-[var(--color-graphite-950)]">
                <Target className="h-7 w-7" />
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {scoreCards.slice(1).map((item) => {
                const score = analysis.result.scores[item.key];
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
            {analysis.result.optimizedSummary}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => void navigator.clipboard.writeText(analysis.result.optimizedSummary)}>
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

      <section className="grid gap-5 xl:grid-cols-2">
        <ContactCheckCard analysis={analysis} />
        <StructureCheckCard analysis={analysis} />
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
            <TabsTrigger value="bullets">Bullets</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="fixes">
          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-[30px]">
              <CardDescription>Priority queue</CardDescription>
              <CardTitle className="mt-2">What you should improve first</CardTitle>
              <div className="mt-5 grid gap-3">
                {analysis.result.actionPlan.map((step, index) => (
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
                  items={analysis.result.suggestions}
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
                  items={analysis.result.strengths}
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
                  items={analysis.result.weaknesses}
                  icon={AlertTriangle}
                  tone="warning"
                  emptyCopy="Weaknesses will appear here after analysis."
                />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bullets">
          <BulletQualityCard analysis={analysis} />
        </TabsContent>

        <TabsContent value="keywords">
          <div className="grid gap-5 xl:grid-cols-3">
            <KeywordPillGroup label="Missing" items={analysis.result.keywordImprovements.missing} />
            <KeywordPillGroup label="Recommended" items={analysis.result.keywordImprovements.recommended} />
            <KeywordPillGroup label="Already found" items={analysis.result.keywordImprovements.found} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
