---
name: code-quality-review
description: Review Smart Career Hub changes for production readiness by checking build health, type safety, security boundaries, mobile responsiveness, state coverage, and deployment essentials.
---

# Code Quality Review

## Description

Use this skill as the final quality gate before considering a major Smart Career Hub task complete.

## When to use this skill

Use this skill before finishing:
- Major frontend tasks
- Backend integrations
- Security-sensitive features
- PWA and deployment changes
- Resume analysis features

## Strict implementation rules

- Confirm `npm run build` passes.
- Confirm TypeScript checks pass.
- Confirm imports are complete and there are no obvious broken references.
- Confirm no secret is exposed in the frontend.
- Confirm there is no OpenRouter call in client code.
- Confirm there is no service role key in client code.
- Confirm RLS policies exist where required.
- Confirm the layout works at `320px`.
- Confirm loading states exist.
- Confirm empty states exist.
- Confirm error states exist.
- Confirm the PWA manifest exists.
- Confirm Vercel deployment configuration exists when needed.

## Acceptance checklist

- Build status is known and reported.
- Type safety status is known and reported.
- Client/server secret boundaries remain intact.
- AI calls remain server-side only.
- Required security policies are present.
- Mobile responsiveness and state coverage have been checked.
- PWA and deployment readiness have been verified for the task scope.
