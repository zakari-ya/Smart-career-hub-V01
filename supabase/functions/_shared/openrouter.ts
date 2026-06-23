import { analysisResultSchema, type AnalysisResult } from "./analysis-schema.ts";
import { AppError, createAppError } from "./errors.ts";
import type { ResumeStructureAnalysis } from "./resume-pre-analysis.ts";

const fallbackModels = [
  "qwen/qwen3-next-80b-a3b-instruct:free",
  // "meta-llama/llama-3.3-70b-instruct:free", 
  // "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"
];

class OpenRouterRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly model: string,
    public readonly retryAfterSeconds?: number,
    public readonly responseBody?: unknown
  ) {
    super(message);
  }
}

function getConfiguredModels() {
  const configuredList = Deno.env.get("OPENROUTER_MODELS")
    ?.split(",")
    .map((model) => model.trim())
    .filter(Boolean);
  const singleModel = Deno.env.get("OPENROUTER_MODEL")?.trim();
  const models = [...(configuredList ?? []), ...(singleModel ? [singleModel] : []), ...fallbackModels];

  return [...new Set(models)];
}

const systemPrompt = `You are a senior resume strategist, ATS optimization expert, and friendly career coach for software developers.

Your job is to review the resume honestly and help the person improve it quickly.

Speak directly to the person using "you" and "your".
Never say "the user", "the candidate", "the applicant", or "the resume owner".

Your tone:
- professional
- friendly
- direct
- practical
- honest
- concise

Do not be rude.
Do not be too soft.
Do not write long boring paragraphs.
Do not invent experience, numbers, companies, tools, certifications, or achievements.

Your goal is to answer:
1. Is your resume good right now?
2. Can it pass ATS safely?
3. What is missing?
4. What should you fix first?
5. How can you make it stronger for recruiter review?

Use fair scoring:
90-100 = Excellent
75-89 = Good
60-74 = Needs improvement
40-59 = Weak
0-39 = Critical

Do not score below 60 if the resume is readable and includes contact info, skills, projects or experience, and education.
Only score below 50 if major sections are missing, text extraction is poor, or the resume is very hard to understand.
Do not score 90+ unless the resume has strong structure, ATS-safe formatting, measurable impact, clear keywords, and recruiter-friendly content.
Do not punish beginners for not having professional experience if they have strong projects, skills, education, and clear proof of work.

When reviewing projects and work experience, check if bullets follow the XYZ formula:
Accomplished [X] as measured by [Y], by doing [Z].

Prefer short, strong bullets over long explanations.
If a bullet is too long, rewrite it shorter.
If a bullet is vague, rewrite it with action, tool, and result.
If measurement is missing, suggest where the person can add a real metric, but never invent one.

For bullet improvements, use:
Action Verb + What you did + Tool/Technology + Result/Impact

Return strict JSON only.
No markdown.
No extra text.`;

function buildPrompt(resumeText: string, preAnalysis: ResumeStructureAnalysis) {
  return `
Review this software developer resume using the deterministic pre-analysis signals and return strict JSON only.

Required JSON shape:
{
  "verdict": {
    "label": "Excellent" | "Good base" | "Needs improvement" | "Weak" | "Critical",
    "message": string
  },
  "scores": {
    "overall": number,
    "ats": number,
    "structure": number,
    "content": number,
    "impact": number,
    "keywords": number
  },
  "quickWins": string[],
  "structureCheck": {
    "layoutType": "single_column" | "possible_two_column" | "unknown",
    "atsRiskLevel": "low" | "medium" | "high",
    "detectedSections": string[],
    "missingSections": string[],
    "layoutWarnings": string[]
  },
  "contactCheck": {
    "hasEmail": boolean,
    "hasPhone": boolean,
    "hasLinkedIn": boolean,
    "hasGithub": boolean,
    "hasPortfolio": boolean,
    "missingContactItems": string[]
  },
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[],
  "optimizedSummary": string,
  "keywordImprovements": {
    "found": string[],
    "missing": string[],
    "recommended": string[]
  },
  "actionPlan": [
    {
      "priority": "high" | "medium" | "low",
      "task": string
    }
  ],
  "bulletQuality": {
    "score": number,
    "tooLongBullets": string[],
    "weakBullets": [
      {
        "original": string,
        "problem": string,
        "improvedVersion": string,
        "followsXYZ": boolean,
        "missingPart": "X" | "Y" | "Z" | "multiple" | "none"
      }
    ],
    "xyzGuidance": string
  }
}

Strict output rules:
- Return only the JSON object. No markdown. No commentary. No code fences.
- Use direct second-person language in narrative strings: "you", "your", and "you need to".
- Never write "the user", "the candidate", "the applicant", or "the resume owner".
- Keep the writing concise. No long boring paragraphs.
- Do not invent experience, numbers, companies, tools, certifications, or achievements.
- If a metric is missing, suggest where the person can add a real metric instead of inventing one.
- Keep "verdict.message" to 1-2 short sentences.
- Keep "quickWins" to 3-5 items.
- Keep "strengths" to 3-5 items.
- Keep "weaknesses" to 3-5 items.
- Keep "suggestions" to 4-7 items.
- Keep "actionPlan" to 3-6 items.

Scoring rules:
- Overall score is a weighted score from ATS readability 20%, structure/layout 20%, content completeness 20%, impact/achievements 20%, and keywords/role relevance 20%.
- 90-100 = Excellent. Use only if the resume is ATS-safe, complete, clear, keyword-rich, and has strong measurable impact.
- 75-89 = Good. Use if the resume can likely pass many screens but still needs targeted improvements.
- 60-74 = Needs improvement. Use if the resume has useful content but needs better structure, stronger bullets, clearer keywords, or more impact.
- 40-59 = Weak. Use if the resume may struggle with ATS or recruiters because of missing sections, weak content, poor structure, or vague bullets.
- 0-39 = Critical. Use only if the resume is very incomplete, unreadable, image-based, or missing major information.
- Do not score below 60 if the resume is readable and includes contact info, skills, education, and either projects or experience.
- Do not score below 50 unless major sections are missing or text extraction is poor.
- Do not give 90+ unless the resume has strong structure, ATS-safe formatting, strong keywords, and measurable achievements.
- Do not punish beginners for not having professional experience if they have strong projects, skills, education, and clear proof of work.

Use these deterministic pre-analysis signals as evidence. You may not contradict them unless the resume text clearly proves a better interpretation:
${JSON.stringify(preAnalysis, null, 2)}

Bullet quality rules:
- Excellent bullet: 12-28 words.
- Acceptable bullet: 8-35 words.
- Too short: under 8 words and lacks context.
- Too long: over 35 words or hard to scan.
- Bad bullet: vague, generic, no action verb, no method, no result.
- For weak bullets, improve them using Action Verb + Accomplishment + Measurement if available + Method/Technology.
- If no real number exists, include this idea in the improved version or guidance: "Add a real metric here if you can, such as number of users, time saved, performance improved, tasks automated, bugs reduced, pages built, APIs created, or project size."
- Never invent companies, roles, achievements, or fake numbers.

Resume text:
${resumeText}
  `.trim();
}

async function requestOpenRouter(prompt: string, model: string) {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");

  if (!apiKey) {
    throw createAppError("SERVER_CONFIG_ERROR", {
      debugDetails: "Missing OPENROUTER_API_KEY."
    });
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.18,
      max_tokens: 4200,
      response_format: {
        type: "json_object"
      },
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    let responseBody: unknown = errorText;
    let retryAfterSeconds =
      Number(response.headers.get("Retry-After") ?? "") || undefined;

    try {
      responseBody = JSON.parse(errorText) as {
        error?: { metadata?: { retry_after_seconds?: number; retry_after_seconds_raw?: number } };
      };
      const metadata = (responseBody as {
        error?: { metadata?: { retry_after_seconds?: number; retry_after_seconds_raw?: number } };
      }).error?.metadata;
      retryAfterSeconds =
        metadata?.retry_after_seconds ??
        Math.ceil(metadata?.retry_after_seconds_raw ?? retryAfterSeconds ?? 0) ??
        retryAfterSeconds;
    } catch {
      // Keep the raw text for developer logs.
    }

    throw new OpenRouterRequestError(
      `OpenRouter request failed for ${model}`,
      response.status,
      model,
      retryAfterSeconds,
      responseBody
    );
  }

  return response.json();
}

function isRetryableOpenRouterError(error: unknown) {
  if (!(error instanceof OpenRouterRequestError)) {
    return false;
  }

  if ([408, 429, 500, 502, 503, 504].includes(error.status)) {
    return true;
  }

  return /rate.?limit|temporarily|provider returned|upstream|overloaded/i.test(error.message);
}

function getCompletionContent(payload: unknown) {
  const content = (payload as {
    choices?: Array<{ message?: { content?: string } }>;
  }).choices?.[0]?.message?.content;

  if (!content) {
    const providerError = (payload as { error?: { message?: string } }).error?.message;
    throw new Error(providerError ?? "OpenRouter returned an empty response.");
  }

  return content;
}

function parseJsonContent(content: string) {
  const normalized = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(normalized);
  } catch {
    const firstBrace = normalized.indexOf("{");
    const lastBrace = normalized.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(normalized.slice(firstBrace, lastBrace + 1));
    }

    throw new Error("OpenRouter returned invalid JSON.");
  }
}

function buildRepairPrompt(candidate: unknown, validationError: string, preAnalysis: ResumeStructureAnalysis) {
  return `
Repair the following candidate so it matches the required schema exactly.
Return only JSON. Do not add markdown or explanation.

Direct coaching rules:
- Speak directly using "you" and "your".
- Never say "the user", "the candidate", "the applicant", or "the resume owner".
- Keep copy concise, professional, friendly, direct, practical, and honest.
- Do not invent experience, numbers, companies, tools, certifications, or achievements.
- Preserve fair scores between 0 and 100.
- Arrays must stay short: quickWins 3-5, strengths 3-5, weaknesses 3-5, suggestions 4-7, actionPlan 3-6.

Required schema:
{
  "verdict": { "label": "Excellent" | "Good base" | "Needs improvement" | "Weak" | "Critical", "message": string },
  "scores": { "overall": number, "ats": number, "structure": number, "content": number, "impact": number, "keywords": number },
  "quickWins": string[],
  "structureCheck": {
    "layoutType": "single_column" | "possible_two_column" | "unknown",
    "atsRiskLevel": "low" | "medium" | "high",
    "detectedSections": string[],
    "missingSections": string[],
    "layoutWarnings": string[]
  },
  "contactCheck": {
    "hasEmail": boolean,
    "hasPhone": boolean,
    "hasLinkedIn": boolean,
    "hasGithub": boolean,
    "hasPortfolio": boolean,
    "missingContactItems": string[]
  },
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[],
  "optimizedSummary": string,
  "keywordImprovements": { "found": string[], "missing": string[], "recommended": string[] },
  "actionPlan": [{ "priority": "high" | "medium" | "low", "task": string }],
  "bulletQuality": {
    "score": number,
    "tooLongBullets": string[],
    "weakBullets": [
      { "original": string, "problem": string, "improvedVersion": string, "followsXYZ": boolean, "missingPart": "X" | "Y" | "Z" | "multiple" | "none" }
    ],
    "xyzGuidance": string
  }
}

Use this pre-analysis as evidence:
${JSON.stringify(preAnalysis, null, 2)}

Validation issue:
${validationError}

Candidate:
${typeof candidate === "string" ? candidate : JSON.stringify(candidate)}
  `.trim();
}

export async function analyzeResumeWithOpenRouter(
  resumeText: string,
  preAnalysis: ResumeStructureAnalysis
): Promise<{
  result: AnalysisResult;
  model: string;
}> {
  const prompt = buildPrompt(resumeText.slice(0, 18_000), preAnalysis);
  const models = getConfiguredModels();
  const modelErrors: string[] = [];
  const debugModelErrors: unknown[] = [];
  let sawInvalidResponse = false;
  let sawProviderBusy = false;
  let retryAfterSeconds: number | undefined;

  for (const model of models) {
    try {
      const firstPayload = await requestOpenRouter(prompt, model);
      const firstContent = getCompletionContent(firstPayload);
      let firstCandidate: unknown = firstContent;
      let validationError = "";

      try {
        firstCandidate = parseJsonContent(firstContent);
      } catch (error) {
        validationError = error instanceof Error ? error.message : "The model returned invalid JSON.";
      }

      const firstParse = analysisResultSchema.safeParse(firstCandidate);

      if (firstParse.success) {
        return {
          result: firstParse.data,
          model
        };
      }

      const repairPrompt = buildRepairPrompt(
        firstCandidate,
        validationError || firstParse.error.message,
        preAnalysis
      );
      const secondPayload = await requestOpenRouter(repairPrompt, model);
      const secondContent = getCompletionContent(secondPayload);
      const secondCandidate = parseJsonContent(secondContent);
      const secondParse = analysisResultSchema.safeParse(secondCandidate);

      if (secondParse.success) {
        return {
          result: secondParse.data,
          model
        };
      }

      sawInvalidResponse = true;
      modelErrors.push(`${model}: invalid AI response after repair retry`);
      debugModelErrors.push({
        model,
        reason: "invalid AI response after repair retry",
        validationError: secondParse.error.message
      });
    } catch (error) {
      if (error instanceof AppError && error.code === "SERVER_CONFIG_ERROR") {
        throw error;
      }

      const message = error instanceof Error ? error.message : "unknown OpenRouter failure";
      modelErrors.push(`${model}: ${message}`);
      debugModelErrors.push(
        error instanceof OpenRouterRequestError
          ? {
              model: error.model,
              status: error.status,
              retryAfterSeconds: error.retryAfterSeconds,
              responseBody: error.responseBody
            }
          : {
              model,
              message,
              error
            }
      );

      if (error instanceof OpenRouterRequestError && isRetryableOpenRouterError(error)) {
        sawProviderBusy = true;
        retryAfterSeconds = error.retryAfterSeconds ?? retryAfterSeconds;
      }

      if (!isRetryableOpenRouterError(error)) {
        continue;
      }
    }
  }

  if (sawProviderBusy) {
    throw createAppError("AI_PROVIDER_BUSY", {
      debugDetails: {
        modelErrors,
        debugModelErrors
      },
      retryAfterSeconds
    });
  }

  if (sawInvalidResponse) {
    throw createAppError("AI_INVALID_RESPONSE", {
      debugDetails: {
        modelErrors,
        debugModelErrors
      }
    });
  }

  throw createAppError("UNKNOWN_BACKEND_ERROR", {
    debugDetails: {
      modelErrors,
      debugModelErrors
    }
  });
}
