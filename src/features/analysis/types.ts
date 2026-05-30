export type ActionPlanStep = {
  priority: "high" | "medium" | "low";
  task: string;
};

export type KeywordImprovements = {
  missing: string[];
  recommended: string[];
  found: string[];
};

export type ResumeAnalysis = {
  id: string;
  resumeId: string;
  provider: string;
  model: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  overallScore: number;
  atsScore: number;
  keywordScore: number;
  impactScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  optimizedSummary: string;
  keywordImprovements: KeywordImprovements;
  actionPlan: ActionPlanStep[];
  failureReason?: string | null;
};

export type DashboardOverview = {
  latestAnalysis: ResumeAnalysis | null;
  recentAnalyses: ResumeAnalysis[];
  completedAnalyses: number;
  resumesUploaded: number;
  averageScore: number;
};
