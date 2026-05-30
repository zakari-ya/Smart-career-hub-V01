---
name: database-schema-rls
description: Create Smart Career Hub Supabase migrations with a minimal MVP schema, clear ownership rules, row-level security policies, indexes, timestamps, and production-safe defaults.
---

# Database Schema RLS

## Description

Use this skill to design and implement the MVP database schema and security policies without drifting into future-feature complexity.

## When to use this skill

Use this skill when:
- Creating Supabase migrations
- Defining MVP tables
- Adding row-level security policies
- Designing ownership and indexing rules
- Storing analysis results

## Strict implementation rules

MVP tables only:
- `profiles`
- `resumes`
- `analyses`
- `rate_limits`
- `audit_logs`

Do not create:
- Payment tables
- Pro plan tables
- Portfolio parser tables
- Job matcher tables
- Team tables

Schema rules:
- Enable RLS on all user-owned tables.
- Add policies using `auth.uid() = user_id` where appropriate.
- Add indexes on `user_id` columns.
- Add `created_at` and `updated_at` timestamps.
- Store AI analysis payloads as `jsonb`.
- Keep the schema simple, clear, and production-ready.

## Acceptance checklist

- Only MVP tables are introduced.
- RLS is enabled where ownership matters.
- Policies enforce authenticated ownership correctly.
- `user_id` indexes exist on user-owned tables.
- Timestamp columns are included consistently.
- AI result storage uses `jsonb`.
