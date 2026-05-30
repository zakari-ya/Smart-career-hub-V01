# AGENTS.md

## Project Overview

Smart Career Hub is a premium SaaS web application that helps developers improve their resumes with AI.

Build the product like a polished, trustworthy software company, not like a generic template or AI-generated mockup.

Primary product goals:
- Help users upload resumes quickly
- Extract resume text safely
- Generate useful AI feedback
- Provide resume optimization suggestions
- Present results in a clean analytics-style dashboard

## MVP Scope

Build only these MVP areas unless the user explicitly expands scope:
- Landing page
- Login page
- Signup page
- Dashboard layout
- Resume upload
- Resume feedback
- Resume optimization
- Resume analysis dashboard result page
- Settings page

Do not build future features yet:
- Portfolio parser
- Job matcher
- Payment system
- Pro plans
- Admin panel
- Blog
- Complex team features

Public pages:
- Landing page
- Login page
- Signup page

Private pages:
- Dashboard
- Resume upload
- Resume analysis result
- Settings

## Tech Stack

Frontend:
- React 19
- Vite 6
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Radix UI
- Lucide React
- Framer Motion
- GSAP with `@gsap/react` only when it materially improves premium motion quality
- React Hook Form
- Zod
- TanStack Query
- Zustand
- Recharts

Backend:
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase Edge Functions
- Supabase RLS

AI:
- OpenRouter free model for MVP
- Server-side only

PDF:
- `pdfjs-dist`

Deployment:
- Vercel

PWA:
- `vite-plugin-pwa`
- Workbox

## UI Quality Rules

The UI must feel like a premium SaaS product with strong hierarchy, clean typography, calm spacing, and refined motion.

Design expectations:
- Mobile-first before desktop
- Strong visual hierarchy
- Clean typography
- Premium spacing
- Soft borders
- Subtle shadows
- Tasteful gradients only when they improve the composition
- Smooth, fast, accessible animations
- Polished cards, charts, widgets, and empty states
- Clean loading, empty, and error states
- Trustworthy, modern visual tone

Avoid:
- Generic AI-generated layouts
- Cheap-looking hero sections
- Random gradients
- Cluttered dashboards
- Heavy animation
- Desktop-first layouts
- Fake features or fake metrics
- Unnecessary complexity

Result page rules:
- The resume result page must look like an analytics dashboard, not a text report.
- Use cards, score widgets, charts, progress bars, badges, tabs, and skeletons.
- The top row should emphasize score cards.
- Middle rows should emphasize charts, summary cards, and analytical breakdowns.
- Lower rows should contain actionable content and supporting details.

The dashboard result page must show:
- Overall score
- ATS score
- Keyword score
- Impact score
- Strengths
- Weaknesses
- Suggestions
- Optimized summary
- Keyword improvements
- Action plan

Animation rules:
- Use Framer Motion for subtle component and section transitions.
- Use GSAP only for premium landing hero motion, scroll-driven storytelling, or refined micro-interactions that clearly benefit from it.
- Respect `prefers-reduced-motion`.
- Keep all animation subtle, fast, and non-blocking.

## PWA And Mobile-First Rules

Smart Career Hub must be installable as a Progressive Web App from day one.

PWA requirements:
- Use `vite-plugin-pwa` in the Vite app
- Add a web app manifest
- Add a service worker
- Add app icons
- Define theme color and background color
- Add an offline fallback page
- Ensure installability on supported devices
- Keep the configuration production-safe

Manifest requirements:
- `name`: `Smart Career Hub`
- `short_name`: `CareerHub`
- `display`: `standalone`
- `start_url`: `/`
- `scope`: `/`
- Theme color
- Background color
- Icons sized at least `192x192` and `512x512`

Service worker safety rules:
- Cache static assets
- Cache the app shell
- Provide a basic offline fallback
- Do not cache private user data by default
- Do not cache authenticated Supabase responses by default
- Do not cache resume files
- Do not cache signed URLs
- Do not cache AI analysis responses unless there is an explicit secure design for it

Responsive rules:
- Design mobile-first before desktop
- Support `320px`, `375px`, `768px`, `1024px`, `1280px`, and `1440px`
- Ensure touch targets are at least `44px` high where appropriate
- Ensure keyboard navigation works
- Ensure charts remain readable on small screens
- Ensure loading, empty, and error states work on mobile

Dashboard mobile rules:
- Sidebar becomes bottom navigation or a drawer
- Cards stack vertically
- Dense content becomes scrollable or rearranged for touch
- Upload flow must feel easy on a phone

## Vercel Deployment Rules

The app must be deployable to Vercel from the first working version.

Deployment rules:
- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Vite
- Use SPA rewrites if needed so refreshes on routes like `/dashboard` work
- Do not rely on a custom Node server
- Keep frontend deployment static-first and Vercel-friendly

Frontend environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`

Forbidden frontend environment variables:
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`
- Any other private secret

Private secrets must only live in secure server-side environments such as Supabase Edge Function secrets.

## Supabase Security Rules

Never weaken security for convenience.

Required rules:
- Never expose the service role key in the frontend
- Never expose the OpenRouter API key in the frontend
- Never trust `user_id` from the client
- Always derive identity from Supabase Auth
- Always enable RLS on user-owned tables
- Always use private Supabase Storage buckets for resumes
- Always check ownership before reading files
- Always validate request input with Zod
- Always validate output returned from AI before storage or response use
- Always use signed URLs only after ownership checks
- Always return safe user-facing errors
- Log detailed backend errors server-side only

MVP database scope:
- `profiles`
- `resumes`
- `analyses`
- `rate_limits`
- `audit_logs`

Database rules:
- Add `user_id` indexes on user-owned tables
- Add `created_at` and `updated_at`
- Use `jsonb` for AI analysis payloads
- Keep schema simple and production-ready
- Use `auth.uid() = user_id` policies where appropriate

Edge Function rules:
- Keep one clear responsibility per function
- MVP functions are `extract-resume-text` and `analyze-resume`
- Shared backend helpers belong in `supabase/functions/_shared/`
- Do not duplicate auth, CORS, validation, error handling, or OpenRouter helpers across functions

## AI Safety Rules

AI must stay server-side and must be treated as untrusted output until validated.

Required rules:
- Never call OpenRouter from the browser
- Never expose the OpenRouter API key to the client
- Parse PDF, TXT, or Markdown server-side only
- Truncate long resume text before sending it to the model
- Use a strict prompt that requests valid JSON only
- Validate AI output with Zod
- Retry or repair invalid AI output before accepting it
- Store only validated results
- Never render AI output as raw HTML
- Never render AI output as raw HTML

Expected resume analysis schema must include:
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

## Code Quality Rules

Keep the codebase simple, feature-based, readable, and easy to maintain.

Important extra rule:
The code structure must be simple, feature-based, readable, and easy to maintain. Do not over-engineer.

Development workflow:
- Before coding, create a short implementation plan
- After coding, summarize changed files
- Keep components small and reusable
- Use TypeScript types
- Use Zod schemas
- Avoid unnecessary dependencies
- Do not build future features unless explicitly requested

Architecture rules:
- Do not put business logic inside UI components
- Do not call Supabase directly from random components
- Use feature-level API files or hooks for data access
- Separate UI rendering, API calls, validation, formatting, and business rules
- Keep feature-specific types close to the feature
- Use stores only for small client-side UI state

Preferred structure:

```txt
src/
  app/
    router.tsx
    providers.tsx
    routes/
      public-routes.tsx
      protected-routes.tsx

  pages/
    landing/
      landing-page.tsx
    auth/
      login-page.tsx
      signup-page.tsx
    dashboard/
      dashboard-page.tsx
    resume/
      resume-upload-page.tsx
      resume-result-page.tsx
    settings/
      settings-page.tsx

  features/
    auth/
      components/
      hooks/
      api/
      schemas/
      types.ts
    resume/
      components/
      hooks/
      api/
      schemas/
      types.ts
    analysis/
      components/
      hooks/
      api/
      schemas/
      types.ts

  components/
    ui/
    layout/
    shared/

  lib/
    supabase/
      client.ts
      auth.ts
      storage.ts
    query-client.ts
    utils.ts
    constants.ts

  hooks/
    use-mobile.ts
    use-toast.ts

  stores/
    ui-store.ts

  styles/
    globals.css

  types/
    index.ts

  assets/
    images/
    icons/
```

Naming rules:
- Use kebab-case for files
- Use PascalCase for React components
- Use camelCase for functions and variables

Component rules:
- Keep components focused on one main job
- Avoid files longer than roughly `250` lines when possible
- Split large interfaces into reusable sections

Data flow rules:
- Page calls hook
- Hook calls feature API
- API calls Supabase or Edge Function
- Result returns to hook
- Hook passes UI-ready data to components

Maintainability rules:
- The project should stay understandable to a beginner or intermediate developer
- Avoid unnecessary design patterns
- Avoid large global stores
- Avoid magic helpers and unclear abstractions
- Prefer explicit, readable code over cleverness

Before finishing a substantial task:
- Run `npm run build`
- Run `npm run typecheck`
- Run `npm run lint` when available and configured

## Commands

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run TypeScript checks:

```bash
npm run typecheck
```

Run linting:

```bash
npm run lint
```
# Before installing any package:

1. Explain why the package is needed.
2. Verify the package is actively maintained.
3. Check bundle-size impact.
4. Prefer industry-standard libraries.
5. Avoid duplicate functionality.

# Installation Policy

You may install approved packages automatically.