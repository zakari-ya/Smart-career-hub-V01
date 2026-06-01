export type LayoutType = "single_column" | "possible_two_column" | "unknown";
export type AtsRiskLevel = "low" | "medium" | "high";

export type LayoutMetadata = {
  layoutType: LayoutType;
  layoutWarnings: string[];
  pageCount?: number;
  textItemCount?: number;
  lineCount?: number;
  averageWordsPerItem?: number;
  xClusterCount?: number;
  fragmentationScore?: number;
  suspiciousReadingOrder?: boolean;
};

export type ResumeStructureAnalysis = {
  hasEmail: boolean;
  hasPhone: boolean;
  hasLinkedIn: boolean;
  hasGithub: boolean;
  hasPortfolio: boolean;
  detectedSections: string[];
  missingSections: string[];
  possibleSectionOrder: string[];
  bulletCount: number;
  weakBulletCount: number;
  hasMeasurableImpact: boolean;
  hasTechnicalSkills: boolean;
  hasProjects: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  atsRiskLevel: AtsRiskLevel;
  layoutType: LayoutType;
  layoutWarnings: string[];
};

const sectionPatterns: Array<[string, RegExp]> = [
  ["contact", /\b(email|phone|linkedin|github|portfolio|contact)\b/i],
  ["summary", /\b(summary|profile|objective|about)\b/i],
  ["skills", /\b(skills|technical skills|technologies|tools|tech stack)\b/i],
  ["experience", /\b(experience|work experience|employment|professional experience)\b/i],
  ["projects", /\b(projects|selected projects|personal projects)\b/i],
  ["education", /\b(education|degree|university|college|school)\b/i],
  ["certifications", /\b(certifications?|licenses?|courses?)\b/i]
];

const actionVerbPattern =
  /\b(built|created|developed|designed|implemented|improved|optimized|launched|led|managed|automated|integrated|reduced|increased|delivered|shipped|maintained|migrated|tested|deployed|analyzed|configured|refactored|collaborated)\b/i;

const measurableImpactPattern =
  /(\b\d+(\.\d+)?\s?(%|x|k|m|ms|s|sec|seconds?|minutes?|hours?|days?|weeks?|months?|users?|clients?|customers?|requests?|features?|apis?|pages?|screens?|components?|bugs?|tests?|tickets?|projects?|records?|rows?)\b|\$\s?\d+)/i;

const technicalKeywordPattern =
  /\b(react|next\.?js|vue|angular|typescript|javascript|node\.?js|python|java|c#|\.net|php|laravel|go|rust|sql|postgres|mysql|mongodb|supabase|firebase|aws|azure|gcp|docker|kubernetes|tailwind|graphql|rest|api|recharts|redux|zustand|tanstack|vite)\b/i;

function normalizeLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function looksLikeSectionHeading(line: string, pattern: RegExp) {
  return line.length <= 70 && pattern.test(line);
}

function detectSections(lines: string[], fullText: string) {
  const detected = new Set<string>();
  const order: string[] = [];

  for (const line of lines) {
    for (const [section, pattern] of sectionPatterns) {
      if (looksLikeSectionHeading(line, pattern)) {
        detected.add(section);
        if (!order.includes(section)) {
          order.push(section);
        }
      }
    }
  }

  if (/@/.test(fullText) || /linkedin|github|portfolio/i.test(fullText)) {
    detected.add("contact");
    if (!order.includes("contact")) {
      order.unshift("contact");
    }
  }

  return { detectedSections: [...detected], possibleSectionOrder: order };
}

function detectBullets(lines: string[]) {
  return lines.filter((line) => /^([-*•–—]|\d+[.)])\s+/.test(line));
}

function countWeakBullets(bullets: string[]) {
  return bullets.filter((bullet) => {
    const cleaned = bullet.replace(/^([-*•–—]|\d+[.)])\s+/, "").trim();
    const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
    const lacksAction = !actionVerbPattern.test(cleaned);
    const lacksMethod = !technicalKeywordPattern.test(cleaned);
    const lacksImpact = !measurableImpactPattern.test(cleaned);
    const tooLong = wordCount > 35;
    const tooShort = wordCount < 8;
    const generic = /\b(worked on|responsible for|helped with|participated in|various tasks)\b/i.test(cleaned);

    return tooLong || tooShort || generic || (lacksAction && lacksImpact) || (lacksMethod && lacksImpact);
  }).length;
}

function getMissingSections(analysis: {
  detectedSections: string[];
  hasGithub: boolean;
  hasLinkedIn: boolean;
  hasPortfolio: boolean;
  hasProjects: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  hasTechnicalSkills: boolean;
}) {
  const missing = new Set<string>();

  if (!analysis.detectedSections.includes("summary")) {
    missing.add("summary");
  }

  if (!analysis.hasTechnicalSkills) {
    missing.add("skills");
  }

  if (!analysis.hasProjects && !analysis.hasExperience) {
    missing.add("projects or experience");
  }

  if (!analysis.hasEducation) {
    missing.add("education");
  }

  if (!analysis.hasGithub) {
    missing.add("github");
  }

  if (!analysis.hasLinkedIn) {
    missing.add("linkedin");
  }

  if (!analysis.hasPortfolio) {
    missing.add("portfolio");
  }

  return [...missing];
}

function classifyAtsRisk(options: {
  textLength: number;
  hasEmail: boolean;
  hasPhone: boolean;
  detectedSections: string[];
  missingSections: string[];
  layoutType: LayoutType;
  layoutWarnings: string[];
}) {
  if (
    options.textLength < 450 ||
    (!options.hasEmail && !options.hasPhone) ||
    options.detectedSections.length < 2 ||
    options.layoutWarnings.some((warning) => /image|fragmented|reading order/i.test(warning))
  ) {
    return "high";
  }

  if (
    options.layoutType === "possible_two_column" ||
    options.missingSections.length >= 3 ||
    !options.hasEmail ||
    options.detectedSections.length < 4
  ) {
    return "medium";
  }

  return "low";
}

export function analyzeResumeStructure(
  extractedText: string,
  layoutMetadata: Partial<LayoutMetadata> | null | undefined
): ResumeStructureAnalysis {
  const text = extractedText.replaceAll(String.fromCharCode(0), " ").trim();
  const lowerText = text.toLowerCase();
  const lines = normalizeLines(text);
  const { detectedSections, possibleSectionOrder } = detectSections(lines, text);
  const bullets = detectBullets(lines);
  const layoutType = layoutMetadata?.layoutType ?? "unknown";
  const layoutWarnings = [...(layoutMetadata?.layoutWarnings ?? [])];

  if (text.length < 450) {
    layoutWarnings.push("Very little readable text was extracted, which can signal an image-based or hard-to-parse resume.");
  }

  const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(text);
  const hasLinkedIn = /linkedin\.com|linkedin/i.test(lowerText);
  const hasGithub = /github\.com|github/i.test(lowerText);
  const urls = text.match(/(https?:\/\/|www\.)[^\s)]+/gi) ?? [];
  const hasPortfolio =
    /\b(portfolio|personal site|website)\b/i.test(text) ||
    urls.some((url) => !/github\.com|linkedin\.com/i.test(url));
  const hasProjects = detectedSections.includes("projects") || /\b(project|built|deployed|github)\b/i.test(text);
  const hasExperience =
    detectedSections.includes("experience") ||
    /\b(intern|developer|engineer|freelance|company|work experience)\b/i.test(text);
  const hasEducation = detectedSections.includes("education") || /\b(bachelor|master|degree|university|college|school)\b/i.test(text);
  const hasTechnicalSkills = detectedSections.includes("skills") || technicalKeywordPattern.test(text);
  const hasMeasurableImpact = measurableImpactPattern.test(text);
  const missingSections = getMissingSections({
    detectedSections,
    hasGithub,
    hasLinkedIn,
    hasPortfolio,
    hasProjects,
    hasExperience,
    hasEducation,
    hasTechnicalSkills
  });
  const atsRiskLevel = classifyAtsRisk({
    textLength: text.length,
    hasEmail,
    hasPhone,
    detectedSections,
    missingSections,
    layoutType,
    layoutWarnings
  });

  return {
    hasEmail,
    hasPhone,
    hasLinkedIn,
    hasGithub,
    hasPortfolio,
    detectedSections,
    missingSections,
    possibleSectionOrder,
    bulletCount: bullets.length,
    weakBulletCount: countWeakBullets(bullets),
    hasMeasurableImpact,
    hasTechnicalSkills,
    hasProjects,
    hasExperience,
    hasEducation,
    atsRiskLevel,
    layoutType,
    layoutWarnings: [...new Set(layoutWarnings)]
  };
}
