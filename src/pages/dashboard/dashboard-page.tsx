import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  FolderOpenDot,
  Gauge,
  LineChart as LineChartIcon,
  Rocket,
  Sparkles,
  TriangleAlert
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResumeAnalysis } from "@/features/analysis/types";
import { useDashboardOverview } from "@/features/analysis/hooks/use-dashboard-overview";
import { formatRelativeDate, formatScore } from "@/lib/utils";

const scoreColor = "#12b7a6";
const softGridColor = "rgba(15, 23, 32, 0.08)";
const statusColors = {
  completed: "#12b7a6",
  pending: "#d58d1f",
  failed: "#de4f66"
} as const;

export function DashboardPage() {
  const { data, error, isLoading } = useDashboardOverview();

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-52 w-full rounded-[34px]" />
        <div className="grid gap-4 xl:grid-cols-3">
          <Skeleton className="h-56 rounded-[34px]" />
          <Skeleton className="h-56 rounded-[34px]" />
          <Skeleton className="h-56 rounded-[34px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={FolderOpenDot}
        title="Dashboard unavailable"
        description={error instanceof Error ? error.message : "Please try again."}
        actionLabel="Upload resume"
        onAction={() => {
          window.location.href = "/dashboard/resume/upload";
        }}
      />
    );
  }

  if (!data) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-52 w-full rounded-[34px]" />
        <Skeleton className="h-72 w-full rounded-[34px]" />
      </div>
    );
  }

  const latestAnalysis = data.latestAnalysis;
  const completedAnalyses = data.recentAnalyses.filter((analysis) => analysis.status === "completed");
  const bestScore = completedAnalyses.reduce(
    (best, analysis) => Math.max(best, analysis.overallScore),
    completedAnalyses.length ? completedAnalyses[0]?.overallScore ?? 0 : 0
  );
  const latestAction = latestAnalysis?.actionPlan[0]?.task ?? "Upload a resume to generate your first action plan.";
  const highPriorityActions = latestAnalysis?.actionPlan.filter((action) => action.priority === "high").length ?? 0;
  const statusData = buildStatusData(data.recentAnalyses);
  const trendData = [...completedAnalyses]
    .reverse()
    .slice(-8)
    .map((analysis, index) => ({
      label: `R${index + 1}`,
      overall: Math.round(analysis.overallScore),
      ats: Math.round(analysis.atsScore),
      keywords: Math.round(analysis.keywordScore),
      impact: Math.round(analysis.impactScore)
    }));
  const latestScoreBars = latestAnalysis
    ? [
        { label: "Overall", value: latestAnalysis.overallScore },
        { label: "ATS", value: latestAnalysis.atsScore },
        { label: "Keywords", value: latestAnalysis.keywordScore },
        { label: "Impact", value: latestAnalysis.impactScore }
      ]
    : [];

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="relative overflow-hidden rounded-[34px] border-black/8 bg-[linear-gradient(135deg,#111c27_0%,#16313a_62%,#0f766e_165%)] p-5 text-white shadow-[0_28px_90px_rgba(15,23,32,0.16)] sm:p-6">
          <div className="absolute right-[-8%] top-[-26%] h-56 w-56 rounded-full bg-[rgba(18,183,166,0.18)] blur-[58px]" />
          <div className="relative z-10">
            <Badge className="w-fit border-white/10 bg-white/10 text-white/84">
              {latestAnalysis ? "Live analytics" : "Workspace ready"}
            </Badge>
            <h2 className="mt-4 max-w-2xl font-[var(--font-heading)] text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl">
              {latestAnalysis ? "Resume signal at a glance." : "Upload once. See the dashboard."}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">
              {latestAnalysis
                ? compactText(latestAnalysis.summary, 150)
                : "Your first upload creates real scores, charts, and a short action plan."}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="teal" className="group">
                <Link to="/dashboard/resume/upload">
                  Upload resume
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              {latestAnalysis ? (
                <Button asChild variant="secondary" className="bg-white text-[var(--color-graphite-950)] hover:bg-white">
                  <Link to={`/dashboard/analyses/${latestAnalysis.id}`}>Open result</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <MetricTile icon={FileText} label="Resumes" value={data.resumesUploaded} tone="neutral" />
          <MetricTile icon={CheckCircle2} label="Completed" value={data.completedAnalyses} tone="success" />
          <MetricTile icon={Gauge} label="Average" value={data.completedAnalyses ? formatScore(data.averageScore) : "—"} tone="teal" />
          <MetricTile icon={Rocket} label="Best score" value={completedAnalyses.length ? formatScore(bestScore) : "—"} tone="dark" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.72fr_0.72fr]">
        <AnalyticsCard title="Score movement" description="Recent completed reviews" icon={LineChartIcon}>
          {trendData.length ? <TrendChart data={trendData} /> : <ChartEmptyState text="Upload and complete analyses to see score movement." />}
        </AnalyticsCard>

        <AnalyticsCard title="Latest breakdown" description="Current score shape" icon={BarChart3}>
          {latestScoreBars.length ? <ScoreBarChart data={latestScoreBars} /> : <ChartEmptyState text="No latest score yet." />}
        </AnalyticsCard>

        <AnalyticsCard title="Run status" description="Last 12 analyses" icon={Sparkles}>
          {data.recentAnalyses.length ? <StatusChart data={statusData} /> : <ChartEmptyState text="No analysis runs yet." />}
        </AnalyticsCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
        <Card className="rounded-[34px] bg-white/74">
          <CardDescription>Next action</CardDescription>
          <CardTitle className="mt-2 text-2xl">What to do now</CardTitle>
          <div className="mt-5 rounded-[26px] border border-black/6 bg-[var(--color-surface-100)] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-graphite-950)] text-white">
                {latestAnalysis?.status === "failed" ? <TriangleAlert className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-graphite-950)]">
                  {latestAnalysis?.status === "failed" ? "Fix failed run" : "Highest priority"}
                </p>
                <p className="text-xs text-[var(--color-graphite-700)]">
                  {highPriorityActions ? `${highPriorityActions} high-priority item${highPriorityActions > 1 ? "s" : ""}` : "Short and actionable"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--color-graphite-700)]">
              {latestAnalysis?.status === "failed"
                ? latestAnalysis.failureReason ?? "The last run failed safely. Upload again or retry analysis."
                : compactText(latestAction, 170)}
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button asChild variant="primary">
              <Link to="/dashboard/resume/upload">New upload</Link>
            </Button>
            {latestAnalysis ? (
              <Button asChild variant="secondary">
                <Link to={`/dashboard/analyses/${latestAnalysis.id}`}>Review details</Link>
              </Button>
            ) : null}
          </div>
        </Card>

        <Card className="rounded-[34px] bg-white/74">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <CardDescription>Recent analyses</CardDescription>
              <CardTitle className="mt-2 text-2xl">Latest resume runs</CardTitle>
            </div>
            <Badge className="w-fit">{data.recentAnalyses.length} tracked</Badge>
          </div>

          {data.recentAnalyses.length ? (
            <div className="mt-5 grid gap-3">
              {data.recentAnalyses.slice(0, 6).map((analysis) => (
                <RecentAnalysisRow key={analysis.id} analysis={analysis} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[24px] border border-dashed border-black/8 bg-[var(--color-surface-100)] p-5 text-sm leading-7 text-[var(--color-graphite-700)]">
              No analyses yet. Upload a resume to establish your first score baseline.
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

function MetricTile({
  icon: Icon,
  label,
  tone,
  value
}: {
  icon: typeof FileText;
  label: string;
  tone: "neutral" | "success" | "teal" | "dark";
  value: number | string;
}) {
  const toneClass = {
    neutral: "bg-white text-[var(--color-graphite-950)]",
    success: "bg-[rgba(19,135,93,0.12)] text-[var(--color-success-500)]",
    teal: "bg-[rgba(18,183,166,0.15)] text-[var(--color-graphite-950)]",
    dark: "bg-[var(--color-graphite-950)] text-white"
  }[tone];

  return (
    <Card className="rounded-[30px] bg-white/74 p-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-graphite-700)]">{label}</p>
      <p className="mt-2 font-[var(--font-heading)] text-3xl font-semibold tracking-[-0.03em] text-[var(--color-graphite-950)]">
        {value}
      </p>
    </Card>
  );
}

function AnalyticsCard({
  children,
  description,
  icon: Icon,
  title
}: {
  children: ReactNode;
  description: string;
  icon: typeof FileText;
  title: string;
}) {
  return (
    <Card className="rounded-[34px] bg-white/74 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardDescription>{description}</CardDescription>
          <CardTitle className="mt-2 text-2xl">{title}</CardTitle>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-surface-200)] text-[var(--color-graphite-900)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5 h-64">{children}</div>
    </Card>
  );
}

function TrendChart({ data }: { data: Array<{ ats: number; impact: number; keywords: number; label: string; overall: number }> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ left: -16, right: 4, top: 10, bottom: 0 }}>
        <CartesianGrid stroke={softGridColor} vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#334151", fontSize: 11 }} />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "#334151", fontSize: 11 }} />
        <Tooltip />
        <Area type="monotone" dataKey="overall" stroke={scoreColor} fill="rgba(18,183,166,0.16)" strokeWidth={3} />
        <Area type="monotone" dataKey="impact" stroke="#0f1720" fill="rgba(15,23,32,0.05)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ScoreBarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 14, top: 6, bottom: 6 }}>
        <CartesianGrid stroke={softGridColor} horizontal={false} />
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis type="category" dataKey="label" width={72} tickLine={false} axisLine={false} tick={{ fill: "#334151", fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" radius={[0, 12, 12, 0]} fill={scoreColor} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function StatusChart({ data }: { data: Array<{ name: "completed" | "pending" | "failed"; value: number }> }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid h-full place-items-center">
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={52} outerRadius={76} paddingAngle={4} dataKey="value">
              {data.map((entry) => (
                <Cell key={entry.name} fill={statusColors[entry.name]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid w-full grid-cols-3 gap-2 text-center">
        {data.map((item) => (
          <div key={item.name} className="rounded-2xl bg-[var(--color-surface-100)] px-2 py-3">
            <p className="font-[var(--font-heading)] text-xl font-semibold text-[var(--color-graphite-950)]">{item.value}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-graphite-700)]">{item.name}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs font-semibold text-[var(--color-graphite-700)]">{total} total runs</p>
    </div>
  );
}

function ChartEmptyState({ text }: { text: string }) {
  return (
    <div className="grid h-full place-items-center rounded-[26px] border border-dashed border-black/8 bg-[var(--color-surface-100)] p-5 text-center text-sm leading-6 text-[var(--color-graphite-700)]">
      {text}
    </div>
  );
}

function RecentAnalysisRow({ analysis }: { analysis: ResumeAnalysis }) {
  const scoreText =
    analysis.status === "completed"
      ? formatScore(analysis.overallScore)
      : analysis.status === "pending"
        ? "Running"
        : "Failed";

  return (
    <Link
      to={`/dashboard/analyses/${analysis.id}`}
      className="grid gap-3 rounded-[24px] border border-black/6 bg-[var(--color-surface-100)] p-4 motion-safe-transition hover:-translate-y-0.5 hover:bg-white sm:grid-cols-[1fr_auto] sm:items-center"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-[var(--color-graphite-950)]">Resume run</p>
          <Badge>{analysis.status}</Badge>
        </div>
        <p className="mt-1 truncate text-sm text-[var(--color-graphite-700)]">
          {formatRelativeDate(analysis.createdAt)} • {analysis.model}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <p className="font-[var(--font-heading)] text-2xl font-semibold text-[var(--color-graphite-950)]">{scoreText}</p>
        <ArrowRight className="h-4 w-4 text-[var(--color-graphite-700)]" />
      </div>
    </Link>
  );
}

function buildStatusData(analyses: ResumeAnalysis[]) {
  const counts = analyses.reduce(
    (acc, analysis) => {
      acc[analysis.status] += 1;
      return acc;
    },
    { completed: 0, failed: 0, pending: 0 }
  );

  return [
    { name: "completed" as const, value: counts.completed },
    { name: "pending" as const, value: counts.pending },
    { name: "failed" as const, value: counts.failed }
  ];
}

function compactText(text: string, maxLength: number) {
  if (!text || text.length <= maxLength) {
    return text || "Upload a resume to create your first career signal.";
  }

  return `${text.slice(0, maxLength).trim()}...`;
}
