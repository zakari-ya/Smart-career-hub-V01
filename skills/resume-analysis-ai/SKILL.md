---
name: resume-analysis-ai
description: Build Smart Career Hub resume parsing and AI analysis flows with server-side extraction, strict JSON prompting, Zod validation, retry-safe parsing, and validated result storage.
---

# Resume Analysis AI

## Description

Use this skill to implement the server-side resume extraction and AI analysis workflow for the MVP with strict validation and safe storage.

## When to use this skill

Use this skill when:
- Building resume analysis
- Parsing uploaded resume files
- Extracting text server-side
- Calling OpenRouter from secure backend code
- Defining validated AI output schemas

## Strict implementation rules

- Parse PDF, TXT, and Markdown files server-side.
- Extract resume text server-side only.
- Truncate very long resume text before sending it to the model.
- Build a strict prompt that requests valid JSON only.
- Require the AI response to match a defined schema.
- Validate AI JSON using Zod.
- Retry or repair invalid AI responses before accepting them.
- Store only validated analysis results.

Result schema must include:
- `overallScore`
- `atsScore`
- `keywordScore`
- `impactScore`
- `summary`
- `strengths`
- `weaknesses`
- `suggestions`
- `optimizedSummary`
- `keywordImprovements`
- `actionPlan`

## Acceptance checklist

- Resume text extraction happens server-side.
- Long documents are truncated safely before AI calls.
- The AI prompt expects strict JSON output.
- Zod validation guards the final stored response.
- Invalid model output is retried or repaired instead of silently accepted.
- Stored analysis data contains all required result fields.
