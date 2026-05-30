---
name: pwa-vercel-mobile
description: Configure Smart Career Hub for PWA installability, mobile-first responsiveness, offline-safe behavior, and Vercel deployment compatibility from the first production-ready version.
---

# PWA Vercel Mobile

## Description

Use this skill to set up the app for installability, offline-safe behavior, mobile responsiveness, and smooth deployment on Vercel.

## When to use this skill

Use this skill when configuring:
- PWA setup
- Manifest
- Service worker
- Offline fallback
- Mobile responsiveness
- Vercel deployment behavior

## Strict implementation rules

- Use `vite-plugin-pwa`.
- Add a manifest with:
- `name: Smart Career Hub`
- `short_name: CareerHub`
- `display: standalone`
- `start_url: /`
- `scope: /`
- Theme color
- Background color
- Icons sized at least `192x192` and `512x512`
- Add an offline fallback page.
- Do not cache sensitive user data.
- Do not cache resumes.
- Do not cache signed URLs.
- Do not cache authenticated Supabase responses by default.
- Cache only static assets, the app shell, and safe offline fallback assets.
- Add a `vercel.json` SPA rewrite if needed so refreshing `/dashboard` works on Vercel.
- Ensure layouts are mobile-first across the MVP surfaces.

## Acceptance checklist

- The PWA manifest exists with the required fields.
- A service worker is configured with safe caching defaults.
- An offline fallback exists.
- Sensitive user data is excluded from default caching.
- The app can refresh correctly on nested routes in Vercel.
- Core pages remain usable and readable on mobile breakpoints.
