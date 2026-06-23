import { analysisResultSchema, type AnalysisResult } from "./analysis-schema.ts";
import type { ResumeStructureAnalysis } from "./resume-pre-analysis.ts";

const developerKeywords = [
  "React",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "SQL",
  "Postgres",
  "Supabase",
  "API",
  "Docker",
  "Tailwind",
  "Testing",
  "Git",
  "AWS"
];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreFromRisk(risk: ResumeStructureAnalysis["atsRiskLevel"]) {
  if (risk === "low") {
    return 82;
  }

  if (risk === "medium") {
    return 68;
  }

  return 52;
}

function getVerdictLabel(score: number): AnalysisResult["verdict"]["label"] {
  if (score >= 90) {
    return "Excellent";
  }

  if (score >= 75) {
    return "Good base";
  }

  if (score >= 60) {
    return "Needs improvement";
  }

  if (score >= 40) {
    return "Weak";
  }

  return "Critical";
}

function detectKeywordGroups(resumeText: string) {
  const found = developerKeywords.filter((keyword) => {
    const pattern = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    return pattern.test(resumeText);
  });

  const recommended = ["TypeScript", "API", "Testing", "SQL", "React"].filter(
    (keyword) => !found.includes(keyword)
  );

  return {
    found: found.slice(0, 10),
    missing: recommended.slice(0, 8),
    recommended: recommended.slice(0, 8)
  };
}

function getBullets(resumeText: string) {
  return resumeText
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => /^([-*•–—]|\d+[.)])\s+/.test(line));
}

function buildWeakBullets(bullets: string[]) {
  return bullets
    .filter((bullet) => {
      const cleaned = bullet.replace(/^([-*•–—]|\d+[.)])\s+/, "").trim();
      const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
      return wordCount < 8 || wordCount > 35 || !/\d|%|users?|reduced|increased|improved/i.test(cleaned);
    })
    .slice(0, 3)
    .map((bullet) => ({
      original: bullet.slice(0, 500),
      problem: "This bullet needs a clearer action, method, and measurable result.",
      improvedVersion:
        "Rewrite this as: Built or improved a specific feature using the relevant technology, then add a real metric if you can.",
      followsXYZ: false,
      missingPart: "multiple" as const
    }));
}

function getMissingContactItems(preAnalysis: ResumeStructureAnalysis) {
  return [
    !preAnalysis.hasEmail ? "email" : "",
    !preAnalysis.hasPhone ? "phone" : "",
    !preAnalysis.hasLinkedIn ? "LinkedIn" : "",
    !preAnalysis.hasGithub ? "GitHub" : "",
    !preAnalysis.hasPortfolio ? "portfolio" : ""
  ].filter(Boolean);
}

export function buildFallbackAnalysisResult(
  resumeText: string,
  preAnalysis: ResumeStructureAnalysis
): AnalysisResult {
  const keywords = detectKeywordGroups(resumeText);
  const bullets = getBullets(resumeText);
  const weakBullets = buildWeakBullets(bullets);
  const missingContactItems = getMissingContactItems(preAnalysis);
  const ats = scoreFromRisk(preAnalysis.atsRiskLevel);
  const structure = clampScore(86 - preAnalysis.missingSections.length * 6 - preAnalysis.layoutWarnings.length * 5);
  const content = clampScore(
    48 +
      (preAnalysis.hasTechnicalSkills ? 12 : 0) +
      (preAnalysis.hasProjects ? 10 : 0) +
      (preAnalysis.hasExperience ? 10 : 0) +
      (preAnalysis.hasEducation ? 8 : 0) +
      (preAnalysis.bulletCount > 0 ? 6 : 0)
  );
  const impact = clampScore(58 + (preAnalysis.hasMeasurableImpact ? 22 : 0) - preAnalysis.weakBulletCount * 3);
  const keywordScore = clampScore(54 + keywords.found.length * 5);
  const overall = clampScore((ats + structure + content + impact + keywordScore) / 5);
  const label = getVerdictLabel(overall);

  const result: AnalysisResult = {
    verdict: {
      label,
      message:
        "Your resume was reviewed with the available structure and keyword signals. You can still improve recruiter scan quality by tightening the highest-priority gaps first."
    },
    scores: {
      overall,
      ats,
      structure,
      content,
      impact,
      keywords: keywordScore
    },
    quickWins: [
      "Add or sharpen your professional summary so your target role is obvious in the first scan.",
      "Make your strongest projects or experience bullets measurable with real outcomes.",
      "Keep section headings simple so ATS tools can detect your content reliably."
    ],
    structureCheck: {
      layoutType: preAnalysis.layoutType,
      atsRiskLevel: preAnalysis.atsRiskLevel,
      detectedSections: preAnalysis.detectedSections.slice(0, 12),
      missingSections: preAnalysis.missingSections.slice(0, 12),
      layoutWarnings: preAnalysis.layoutWarnings.slice(0, 8)
    },
    contactCheck: {
      hasEmail: preAnalysis.hasEmail,
      hasPhone: preAnalysis.hasPhone,
      hasLinkedIn: preAnalysis.hasLinkedIn,
      hasGithub: preAnalysis.hasGithub,
      hasPortfolio: preAnalysis.hasPortfolio,
      missingContactItems: missingContactItems.slice(0, 8)
    },
    strengths: [
      preAnalysis.hasTechnicalSkills
        ? "Your resume includes technical signals that help with developer screening."
        : "Your resume has readable extracted text, which gives you a base to improve from.",
      preAnalysis.hasProjects
        ? "Your project section gives recruiters concrete work to evaluate."
        : "Your current structure can be improved by adding stronger project evidence.",
      preAnalysis.hasEducation
        ? "Your education signal is present and supports your profile."
        : "You can make your background clearer by adding education or training details."
    ],
    weaknesses: [
      preAnalysis.missingSections.length
        ? `You are missing important resume signals: ${preAnalysis.missingSections.slice(0, 4).join(", ")}.`
        : "Your main sections are present, but they still need sharper evidence.",
      preAnalysis.hasMeasurableImpact
        ? "Some impact is visible, but your best bullets should make outcomes easier to scan."
        : "Your resume needs more measurable impact in projects or experience bullets.",
      preAnalysis.weakBulletCount
        ? "Several bullets look vague, too short, too long, or light on results."
        : "Your bullets should stay concise and focused on action, method, and result."
    ],
    suggestions: [
      "Rewrite vague bullets with an action verb, the technology used, and the result.",
      "Add real metrics where you can, such as users, speed, bugs reduced, APIs built, or time saved.",
      "Move your strongest developer keywords into your summary, skills, and project bullets.",
      "Use standard section headings like Summary, Skills, Projects, Experience, and Education."
    ],
    optimizedSummary:
      "Developer focused on building reliable web applications, working across frontend and backend tools, and turning technical projects into clear product outcomes. Strengthen this summary by adding your target role, strongest stack, and one real achievement metric.",
    keywordImprovements: keywords,
    actionPlan: [
      {
        priority: "high",
        task: "Add measurable outcomes to your strongest project or experience bullets."
      },
      {
        priority: "high",
        task: "Fill missing contact or profile links so recruiters can verify your work quickly."
      },
      {
        priority: "medium",
        task: "Tighten your summary around your target developer role and strongest technologies."
      },
      {
        priority: "medium",
        task: "Group your technical skills by category so ATS and recruiters can scan them faster."
      }
    ],
    bulletQuality: {
      score: clampScore(78 - preAnalysis.weakBulletCount * 5 + (preAnalysis.hasMeasurableImpact ? 10 : 0)),
      tooLongBullets: bullets
        .filter((bullet) => bullet.split(/\s+/).length > 35)
        .slice(0, 5),
      weakBullets,
      xyzGuidance:
        "Use the XYZ formula: what you accomplished, how it was measured, and what technology or method you used."
    }
  };

  return analysisResultSchema.parse(result);
}
