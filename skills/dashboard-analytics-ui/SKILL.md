---
name: dashboard-analytics-ui
description: Build the Smart Career Hub dashboard shell and analytics-style resume result interfaces with score cards, charts, summary panels, and mobile-friendly analytical layouts.
---

# Dashboard Analytics UI

## Description

Use this skill to build private dashboard surfaces that present resume analysis like a professional analytics product instead of a plain text report.

## When to use this skill

Use this skill when building:
- Dashboard layout
- Resume result page
- Analytics cards
- Score widgets
- Charts
- Dashboard navigation and private app shell patterns

## Strict implementation rules

- The resume result page must look like an analytical dashboard, not a text report.
- Render the result page as one cohesive dashboard surface instead of splitting it into disconnected report pages.
- Use Recharts for chart-based visualizations.
- Use shadcn/ui cards, badges, tabs, progress bars, and skeletons where appropriate.
- Keep the most important scores visible at a glance.
- Compose the dashboard from focused reusable cards instead of one oversized page component.
- Ensure mobile layouts stack cleanly and preserve readability.

Result page must show:
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

Layout rules:
- Top row contains score cards.
- Middle rows contain charts and summary cards.
- Lower rows contain strengths, weaknesses, suggestions, optimized summary, and keyword content.
- On mobile, cards stack vertically in a clear reading order.

## Acceptance checklist

- The result page looks like a professional analytics dashboard.
- Score cards are prominent in the first visible section.
- Charts are readable on both mobile and desktop.
- All required analysis sections are present.
- Loading skeletons and empty states are planned for dashboard surfaces.
- The layout remains clean and uncluttered at small breakpoints.
