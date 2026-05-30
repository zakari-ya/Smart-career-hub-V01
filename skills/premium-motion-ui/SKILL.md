---
name: premium-motion-ui
description: Apply premium, accessible motion to Smart Career Hub using Framer Motion by default and GSAP with @gsap/react only where higher-fidelity animation materially improves the experience.
---

# Premium Motion UI

## Description

Use this skill to improve perceived quality with refined motion, especially on hero sections, polished transitions, and high-value micro-interactions.

## When to use this skill

Use this skill when:
- Improving animation quality
- Adding section transitions
- Refining landing hero motion
- Building tasteful scroll-based storytelling
- Creating premium micro-interactions

## Strict implementation rules

- Use Framer Motion for simple React component transitions and section reveals.
- Use GSAP with `@gsap/react` only for premium landing-page animation, scroll-based hero effects, or micro-interactions that need tighter animation control.
- Do not overuse animation.
- All motion must feel expensive, smooth, and intentional.
- Respect `prefers-reduced-motion` and provide calm fallbacks.
- Keep animations fast, subtle, and non-blocking.
- Avoid motion that delays interaction or hurts readability.
- When using GSAP in React, use the `useGSAP` hook from `@gsap/react`.
- Clean up all animations properly on unmount or dependency changes.

## Acceptance checklist

- Motion improves polish without distracting from content.
- Reduced-motion preferences are respected.
- Framer Motion is the default unless GSAP clearly adds value.
- Any GSAP usage is isolated to high-value interactions.
- Animations do not block clicks, typing, or navigation.
- The interface still feels premium when motion is minimized.
