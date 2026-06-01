export type AnalysisStatus = "pending" | "completed" | "failed";

export type ActionPlanStep = {
  priority: "high" | "medium" | "low";
  task: string;
};

export type AnalysisScores = {
  overall: number;
  ats: number;
  structure: number;
  content: number;
  impact: number;
  keywords: number;
};

export type KeywordImprovements = {
  missing: string[];
  recommended: string[];
  found: string[];
};

export type AnalysisResult = {
  verdict: {
    label: "Excellent" | "Good base" | "Needs improvement" | "Weak" | "Critical";
    message: string;
  };
  scores: AnalysisScores;
  quickWins: string[];
  structureCheck: {
    layoutType: "single_column" | "possible_two_column" | "unknown";
    atsRiskLevel: "low" | "medium" | "high";
    detectedSections: string[];
    missingSections: string[];
    layoutWarnings: string[];
  };
  contactCheck: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedIn: boolean;
    hasGithub: boolean;
    hasPortfolio: boolean;
    missingContactItems: string[];
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  optimizedSummary: string;
  keywordImprovements: KeywordImprovements;
  actionPlan: ActionPlanStep[];
  bulletQuality: {
    score: number;
    tooLongBullets: string[];
    weakBullets: Array<{
      original: string;
      problem: string;
      improvedVersion: string;
      followsXYZ: boolean;
      missingPart: "X" | "Y" | "Z" | "multiple" | "none";
    }>;
    xyzGuidance: string;
  };
};

export type ResumeAnalysisBase = {
  id: string;
  resumeId: string;
  provider: string;
  model: string;
  status: AnalysisStatus;
  createdAt: string;
  failureReason?: string | null;
};

export type ResumeAnalysisV2 = ResumeAnalysisBase & {
  schemaVersion: "v2";
  result: AnalysisResult;
};

export type ResumeAnalysisLegacy = ResumeAnalysisBase & {
  schemaVersion: "legacy";
  legacyMessage: string;
};

export type ResumeAnalysis = ResumeAnalysisV2 | ResumeAnalysisLegacy;

export type DashboardOverview = {
  latestAnalysis: ResumeAnalysis | null;
  recentAnalyses: ResumeAnalysis[];
  completedAnalyses: number;
  resumesUploaded: number;
  averageScore: number;
};

export function hasV2Result(analysis: ResumeAnalysis | null | undefined): analysis is ResumeAnalysisV2 {
  return Boolean(analysis && analysis.schemaVersion === "v2" && analysis.status === "completed");
}
