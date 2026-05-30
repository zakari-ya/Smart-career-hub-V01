import { analysisResultSchema, type AnalysisResult } from "./analysis-schema.ts";

const fallbackModels = [
  "openrouter/owl-alpha",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"
];

class OpenRouterRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly model: string
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

const systemPrompt = `You are a senior resume strategist, ATS optimization expert, and career coach with 15+ years of experience helping software developers improve their resumes.

Review the resume honestly and professionally.

Speak directly to the person using "you", "your", and "you need to".
Do not say "the user", "the candidate", "the applicant", or "the resume owner".

Your goal is to help the person make their resume stronger, clearer, more ATS-friendly, and more convincing to recruiters.

Be encouraging, but do not hide problems.
If something is weak, say it clearly and explain exactly how to fix it.

Do not invent experience, numbers, companies, tools, certifications, or achievements.
If a metric is missing, suggest where the person could add a real metric.

Focus on:
- resume structure
- ATS compatibility
- clarity
- keywords
- impact
- action verbs
- quantified achievements
- technical skills
- project descriptions
- professional summary
- recruiter readability

Return strict JSON only.`;

function buildPrompt(resumeText: string) {
  return `
Review this software developer resume and return strict JSON only with this exact shape:
{
  "overallScore": number,
  "atsScore": number,
  "keywordScore": number,
  "impactScore": number,
  "summary": string,
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[],
  "optimizedSummary": string,
  "keywordImprovements": {
    "missing": string[],
    "recommended": string[],
    "found": string[]
  },
  "actionPlan": [
    {
      "priority": "high" | "medium" | "low",
      "task": string
    }
  ]
}

Rules:
- Speak directly to the person using "you", "your", and "you need to".
- Be honest, direct, constructive, and practical.
- Do not use markdown.
- Do not include any text outside the JSON object.
- Keep scores between 0 and 100.
- Do not invent experience, numbers, companies, tools, certifications, or achievements.
- If exact numbers are missing, say where the person should add real numbers.
- Use practical ATS and recruiter-facing advice for developer roles.
- Use direct second-person language in every narrative string.
- Make the optimized summary stronger without making fake claims.
- Suggest stronger action verbs and places where quantified impact is needed.

Resume text:
${resumeText}
  `.trim();
}

async function requestOpenRouter(prompt: string, model: string) {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");

  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 2600,
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
    throw new OpenRouterRequestError(`OpenRouter request failed: ${errorText}`, response.status, model);
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

function buildRepairPrompt(candidate: unknown, validationError: string) {
  return `
Repair the following candidate so it matches the required schema exactly.
Return only JSON. Do not add markdown or explanation.

Required schema:
{
  "overallScore": number,
  "atsScore": number,
  "keywordScore": number,
  "impactScore": number,
  "summary": string,
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[],
  "optimizedSummary": string,
  "keywordImprovements": {
    "missing": string[],
    "recommended": string[],
    "found": string[]
  },
  "actionPlan": [
    {
      "priority": "high" | "medium" | "low",
      "task": string
    }
  ]
}

Validation issue:
${validationError}

Candidate:
${typeof candidate === "string" ? candidate : JSON.stringify(candidate)}
  `.trim();
}

export async function analyzeResumeWithOpenRouter(resumeText: string): Promise<{
  result: AnalysisResult;
  model: string;
}> {
  const prompt = buildPrompt(resumeText.slice(0, 18_000));
  const models = getConfiguredModels();
  const modelErrors: string[] = [];

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
        validationError || firstParse.error.message
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

      modelErrors.push(`${model}: invalid AI response after repair retry`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown OpenRouter failure";
      modelErrors.push(`${model}: ${message}`);

      if (!isRetryableOpenRouterError(error)) {
        continue;
      }
    }
  }

  throw new Error(`All configured OpenRouter models failed. ${modelErrors.join(" | ")}`);
}
