---
name: supabase-security-backend
description: Build Smart Career Hub Supabase clients, auth flows, storage access, and edge-function backends with strict secret handling, ownership checks, RLS, and safe error boundaries.
---

# Supabase Security Backend

## Description

Use this skill to implement backend and data-access layers safely, especially around authentication, storage, resume uploads, and server-side AI workflows.

## When to use this skill

Use this skill when building:
- Supabase client setup
- Auth logic
- Edge Functions
- Storage access
- Resume upload backend
- AI backend flows

## Strict implementation rules

- Never expose the service role key in the frontend.
- Never expose the OpenRouter key in the frontend.
- Never trust `user_id` from the client.
- Always derive identity from Supabase Auth.
- Use RLS for all user-owned tables.
- Use a private Supabase Storage bucket for resumes.
- Validate file type and file size server-side.
- Check ownership before generating signed URLs or returning file access.
- Return safe user-facing errors and keep detailed logs server-side only.
- Keep shared backend helpers in `supabase/functions/_shared/`.

## Acceptance checklist

- No private secret appears in client code or public environment variables.
- Authenticated identity is derived server-side.
- Resume file access requires ownership checks.
- Storage buckets for resumes are private.
- Input validation exists for uploads and backend requests.
- Error responses are safe for users and detailed logs stay server-side.
