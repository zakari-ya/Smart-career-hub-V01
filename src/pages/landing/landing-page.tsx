import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  FileSearch,
  Github,
  GitPullRequestArrow,
  KeyRound,
  LockKeyhole,
  Radar,
  Route,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  WandSparkles
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useRef } from "react";
import { Link } from "react-router-dom";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { LANDING_SCROLL_EVENT, type LandingScrollDetail } from "@/lib/landing-scroll";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText);

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const platformPillars = [
  {
    label: "CV Analysis",
    eyebrow: "Resume diagnosis",
    title: "Turn your CV into a clear hiring signal.",
    description:
      "Score ATS readiness, keywords, impact, and clarity, then see the highest-value fixes first.",
    icon: FileSearch,
    metric: "82",
    signal: "Impact bullets need proof",
    accent: "bg-[rgba(18,183,166,0.16)]"
  },
  {
    label: "Job Matcher",
    eyebrow: "Role targeting",
    title: "Compare your profile with the roles you want.",
    description:
      "Map your resume language against target jobs so you know which skills and proof points to sharpen.",
    icon: BriefcaseBusiness,
    metric: "74%",
    signal: "Backend API language is close",
    accent: "bg-[rgba(255,188,92,0.18)]"
  },
  {
    label: "GitHub Profile Audit",
    eyebrow: "Developer proof",
    title: "Make your GitHub support your career story.",
    description:
      "Audit pinned projects, README quality, and recruiter scan signals so your technical proof feels intentional.",
    icon: Github,
    metric: "+11",
    signal: "Project story can be clearer",
    accent: "bg-[rgba(15,23,32,0.08)]"
  }
] as const;

const fastOutcomes = [
  "See the weak signal before recruiters do.",
  "Know what to rewrite, quantify, or remove.",
  "Connect your CV, jobs, and GitHub into one story."
] as const;

const workflow = [
  {
    step: "01",
    title: "Upload",
    description: "Start with your resume. Files are validated and processed through the secure backend.",
    icon: UploadCloud
  },
  {
    step: "02",
    title: "Diagnose",
    description: "The dashboard turns long feedback into scores, priorities, and direct coaching.",
    icon: Radar
  },
  {
    step: "03",
    title: "Match",
    description: "Target roles reveal the keywords, skills, and proof points your profile needs.",
    icon: BriefcaseBusiness
  },
  {
    step: "04",
    title: "Improve",
    description: "Action cards tell you exactly what to rewrite, add, quantify, and connect.",
    icon: WandSparkles
  }
] as const;

const dashboardScores = [
  ["Overall", 82],
  ["ATS", 76],
  ["Keywords", 71],
  ["Impact", 88]
] as const;

const reviewItems = [
  "Your projects show strong technical range, but your bullet impact needs clearer outcomes.",
  "You need more role-specific keywords near your summary and recent project descriptions.",
  "Add real metrics where results are implied instead of leaving recruiters to guess."
] as const;

const trustSignals = [
  {
    title: "Server-side AI only",
    description: "OpenRouter runs inside Supabase Edge Functions. No AI key is exposed to the browser.",
    icon: LockKeyhole
  },
  {
    title: "Private resume storage",
    description: "Resume files stay in a private bucket and require ownership checks before processing.",
    icon: ShieldCheck
  },
  {
    title: "Validated career data",
    description: "AI output must pass strict schema validation before it appears in your dashboard.",
    icon: KeyRound
  }
] as const;

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const smoothWrapperRef = useRef<HTMLDivElement | null>(null);
  const smoothContentRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!rootRef.current || !heroRef.current) {
        return;
      }

      const handleLandingScroll = (event: Event) => {
        const sectionId = (event as CustomEvent<LandingScrollDetail>).detail?.sectionId;
        if (!sectionId) {
          return;
        }

        const target = document.getElementById(sectionId);
        if (!target) {
          return;
        }

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const smoother = ScrollSmoother.get();

        if (smoother && !prefersReducedMotion) {
          smoother.scrollTo(target, true, "top 92px");
        } else {
          const y = target.getBoundingClientRect().top + window.scrollY - 92;
          window.scrollTo({
            top: Math.max(y, 0),
            behavior: prefersReducedMotion ? "auto" : "smooth"
          });
        }

        window.history.replaceState(null, "", `#${sectionId}`);
      };

      window.addEventListener(LANDING_SCROLL_EVENT, handleLandingScroll);

      if (reducedMotion) {
        return () => window.removeEventListener(LANDING_SCROLL_EVENT, handleLandingScroll);
      }

      const heading = heroRef.current.querySelector("[data-hero-heading]");
      const copy = heroRef.current.querySelector("[data-hero-copy]");
      const actions = heroRef.current.querySelector("[data-hero-actions]");
      const stage = heroRef.current.querySelector("[data-hero-stage]");
      const heroCards = heroRef.current.querySelectorAll("[data-hero-card]");

      if (!heading || !copy || !actions || !stage) {
        return;
      }

      const split = SplitText.create(heading, {
        type: "lines",
        mask: "lines",
        linesClass: "landing-hero-line++",
        aria: "auto"
      });

      gsap.set(split.lines, { yPercent: 105, opacity: 0, willChange: "transform, opacity" });
      gsap.set([copy, actions, stage, heroCards], {
        y: 28,
        opacity: 0,
        willChange: "transform, opacity"
      });

      const intro = gsap.timeline({
        defaults: {
          duration: 0.82,
          ease: "power3.out"
        }
      });

      intro
        .to(split.lines, { yPercent: 0, opacity: 1, stagger: 0.07 })
        .to(copy, { y: 0, opacity: 1 }, "<0.16")
        .to(actions, { y: 0, opacity: 1 }, "<0.08")
        .to(stage, { y: 0, opacity: 1 }, "<0.08")
        .to(heroCards, { y: 0, opacity: 1, stagger: 0.06 }, "<0.1");

      const ambient = gsap.timeline({
        repeat: -1,
        yoyo: true,
        defaults: {
          ease: "sine.inOut"
        }
      });

      ambient
        .to("[data-canvas-glow='one']", { x: 24, y: -16, duration: 12 }, 0)
        .to("[data-canvas-glow='two']", { x: -20, y: 18, duration: 13.5 }, 0)
        .to("[data-orbit-dot]", { y: -8, scale: 1.05, duration: 3, stagger: 0.22 }, 0);

      gsap.to(stage, {
        y: -24,
        rotateX: 1.5,
        rotateY: -2,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.4
        }
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal-section]").forEach((section) => {
        const items = section.querySelectorAll("[data-reveal-item]");
        if (!items.length) {
          return;
        }

        gsap.from(items, {
          y: 28,
          opacity: 0,
          duration: 0.76,
          ease: "power2.out",
          stagger: 0.07,
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            once: true
          }
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax-depth]").forEach((element) => {
        const depth = Number(element.dataset.parallaxDepth ?? 1);

        gsap.to(element, {
          y: () => depth * -34,
          rotate: () => depth * 0.7,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.3
          }
        });
      });

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (pointer: fine)", () => {
        if (!smoothWrapperRef.current || !smoothContentRef.current) {
          return;
        }

        const heroElement = heroRef.current;
        if (!heroElement) {
          return;
        }

        const smoother = ScrollSmoother.create({
          wrapper: smoothWrapperRef.current,
          content: smoothContentRef.current,
          smooth: 0.45,
          effects: false,
          normalizeScroll: false
        });

        const xTo = gsap.quickTo(stage, "x", { duration: 0.55, ease: "power3.out" });
        const rotateYTo = gsap.quickTo(stage, "rotateY", { duration: 0.55, ease: "power3.out" });
        const rotateXTo = gsap.quickTo(stage, "rotateX", { duration: 0.55, ease: "power3.out" });

        const onPointerMove = (event: PointerEvent) => {
          const bounds = heroElement.getBoundingClientRect();
          const xProgress = (event.clientX - bounds.left) / bounds.width - 0.5;
          const yProgress = (event.clientY - bounds.top) / bounds.height - 0.5;
          xTo(xProgress * 18);
          rotateYTo(xProgress * 4 - 1.5);
          rotateXTo(yProgress * -3 + 1.5);
        };

        const onPointerLeave = () => {
          xTo(0);
          rotateYTo(-1.5);
          rotateXTo(1.5);
        };

        heroElement.addEventListener("pointermove", onPointerMove);
        heroElement.addEventListener("pointerleave", onPointerLeave);

        return () => {
          heroElement.removeEventListener("pointermove", onPointerMove);
          heroElement.removeEventListener("pointerleave", onPointerLeave);
          smoother.kill();
        };
      });

      return () => {
        window.removeEventListener(LANDING_SCROLL_EVENT, handleLandingScroll);
        split.revert();
        mm.revert();
      };
    },
    {
      scope: rootRef,
      dependencies: [reducedMotion],
      revertOnUpdate: true
    }
  );

  return (
    <div ref={rootRef} className="min-h-screen bg-[#f7f3ea] text-[var(--color-graphite-950)]">
      <PublicNavbar />
      <div ref={smoothWrapperRef} id="smooth-wrapper">
        <div ref={smoothContentRef} id="smooth-content">
          <main className="relative overflow-hidden bg-[#f7f3ea]">
            <ContinuousCanvas />

            <section
              ref={heroRef}
              className="relative z-10 px-4 pb-10 pt-28 sm:px-6 sm:pb-14 sm:pt-32 lg:px-10 lg:pb-16"
            >
              <div className="mx-auto grid w-full max-w-[92rem] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div className="max-w-5xl">
                  <Badge className="mb-5 border-black/10 bg-white/60 text-[var(--color-graphite-900)] shadow-[0_16px_44px_rgba(15,23,32,0.08)] backdrop-blur-xl">
                    Developer career cockpit
                  </Badge>
                  <h1
                    data-hero-heading
                    className="max-w-5xl font-[var(--font-heading)] text-[clamp(3.35rem,11vw,9rem)] font-semibold leading-[0.86] tracking-[-0.078em] text-[var(--color-graphite-950)]"
                  >
                    One clear signal for your next developer role.
                  </h1>
                  <p
                    data-hero-copy
                    className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-graphite-700)] sm:text-lg lg:text-xl lg:leading-9"
                  >
                    Smart Career Hub connects your CV, job target, and GitHub proof into a focused career system that tells you what to fix next.
                  </p>

                  <div data-hero-actions className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Button asChild variant="teal" size="lg" className="group">
                      <Link to="/signup">
                        Start with your CV
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" size="lg" className="bg-white/64 backdrop-blur-xl">
                      <a href="#features">See the system</a>
                    </Button>
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:max-w-3xl">
                    {fastOutcomes.map((outcome) => (
                      <div
                        key={outcome}
                        data-hero-card
                        className="rounded-[24px] border border-black/8 bg-white/54 p-4 shadow-[0_18px_56px_rgba(15,23,32,0.07)] backdrop-blur-2xl"
                      >
                        <CheckCircle2 className="h-5 w-5 text-[var(--color-teal-500)]" />
                        <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-graphite-800)]">{outcome}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative min-h-[520px] [perspective:1500px] sm:min-h-[590px] lg:min-h-[660px]">
                  <div
                    data-hero-stage
                    className="absolute inset-x-0 top-0 mx-auto h-full max-w-[760px] will-change-transform [transform-style:preserve-3d]"
                  >
                    <div className="absolute left-1/2 top-[48%] h-[470px] w-[470px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/8 bg-white/24 shadow-[inset_0_0_70px_rgba(255,255,255,0.42)] backdrop-blur-[2px] [transform:rotateX(68deg)_translateZ(-120px)] sm:h-[610px] sm:w-[610px]" />
                    <svg
                      className="absolute left-1/2 top-[47%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 overflow-visible text-[var(--color-graphite-950)] opacity-40 [transform:rotateX(66deg)_translateZ(-80px)] sm:h-[640px] sm:w-[640px]"
                      viewBox="0 0 640 640"
                      aria-hidden="true"
                    >
                      <path
                        d="M108 360 C212 216 365 474 524 246"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="8 14"
                        strokeWidth="2"
                      />
                      <path
                        d="M144 210 C258 416 410 134 548 382"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="4 18"
                        strokeWidth="2"
                      />
                    </svg>

                    <HeroLayer
                      className="left-[3%] top-[8%] w-[83%] rotate-[-6deg] sm:left-[4%] sm:w-[68%]"
                      icon={FileSearch}
                      label="CV Analysis"
                      score="82"
                      title="Resume clarity"
                      lines={["ATS 76", "Keywords 71", "Impact 88"]}
                    />
                    <HeroLayer
                      className="right-[1%] top-[33%] z-20 w-[82%] rotate-[4deg] sm:right-[3%] sm:w-[66%]"
                      dark
                      icon={BriefcaseBusiness}
                      label="Job Matcher"
                      score="74%"
                      title="Role fit"
                      lines={["React role close", "API proof rising", "Testing signal missing"]}
                    />
                    <HeroLayer
                      className="bottom-[7%] left-[12%] z-30 w-[78%] rotate-[-1deg] sm:left-[17%] sm:w-[60%]"
                      icon={Github}
                      label="GitHub Audit"
                      score="+11"
                      title="Proof quality"
                      lines={["README clarity", "Pinned repo story", "Recruiter scan path"]}
                    />

                    <div
                      data-orbit-dot
                      className="absolute right-[8%] top-[8%] z-40 hidden rounded-full border border-white/70 bg-[var(--color-teal-500)] px-4 py-3 text-sm font-bold text-[var(--color-graphite-950)] shadow-[0_24px_70px_rgba(18,183,166,0.24)] backdrop-blur-xl sm:block"
                    >
                      Live career map
                    </div>
                    <div
                      data-orbit-dot
                      className="absolute bottom-[22%] right-[3%] z-40 rounded-[24px] border border-black/8 bg-white/76 p-4 text-sm font-semibold text-[var(--color-graphite-800)] shadow-[0_24px_70px_rgba(15,23,32,0.12)] backdrop-blur-xl"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[var(--color-teal-500)]" />
                        Next best fix
                      </div>
                      <p className="mt-2 max-w-[190px] text-xs leading-5 text-[var(--color-graphite-700)]">
                        Quantify backend project impact before applying.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="features" data-reveal-section className="relative z-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
              <div className="mx-auto max-w-[92rem] rounded-[46px] border border-black/8 bg-white/48 p-3 shadow-[0_28px_110px_rgba(15,23,32,0.09)] backdrop-blur-2xl sm:p-5 lg:p-7">
                <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-stretch">
                  <div data-reveal-item className="rounded-[36px] bg-[var(--color-graphite-950)] p-6 text-white sm:p-8">
                    <Badge className="border-white/10 bg-white/10 text-white">Connected product orbit</Badge>
                    <h2 className="mt-5 font-[var(--font-heading)] text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-white sm:text-5xl">
                      Three career surfaces. One continuous signal.
                    </h2>
                    <p className="mt-5 text-sm leading-7 text-white/68 sm:text-base">
                      The landing now reads like one product system: resume feedback, role fit, and GitHub proof work together instead of appearing as separate websites.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {platformPillars.map((pillar, index) => {
                      const Icon = pillar.icon;

                      return (
                        <article
                          key={pillar.label}
                          data-reveal-item
                          data-parallax-depth={index + 1}
                          className="relative overflow-hidden rounded-[34px] border border-black/8 bg-white/68 p-5 shadow-[0_20px_70px_rgba(15,23,32,0.08)] backdrop-blur-xl will-change-transform"
                        >
                          <div className={`absolute right-[-20%] top-[-18%] h-36 w-36 rounded-full blur-2xl ${pillar.accent}`} />
                          <div className="relative">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[var(--color-graphite-950)] text-white">
                                <Icon className="h-6 w-6" />
                              </div>
                              <p className="rounded-full bg-[rgba(18,183,166,0.14)] px-3 py-1 font-[var(--font-heading)] text-xl font-semibold">
                                {pillar.metric}
                              </p>
                            </div>
                            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-graphite-700)]">
                              {pillar.eyebrow}
                            </p>
                            <h3 className="mt-3 font-[var(--font-heading)] text-2xl font-semibold leading-tight tracking-[-0.03em]">
                              {pillar.title}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-[var(--color-graphite-700)]">{pillar.description}</p>
                            <div className="mt-5 rounded-[22px] bg-[var(--color-surface-100)] px-4 py-3 text-sm font-semibold text-[var(--color-graphite-800)]">
                              {pillar.signal}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section data-reveal-section className="relative z-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
              <div className="mx-auto grid max-w-[92rem] gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                <div data-reveal-item>
                  <Badge className="bg-white/64">Built for fast readers</Badge>
                  <h2 className="mt-5 max-w-3xl font-[var(--font-heading)] text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-5xl">
                    The page moves like one product, not a stack of templates.
                  </h2>
                </div>
                <div data-reveal-item className="grid gap-3 md:grid-cols-3">
                  {[
                    ["Scan first", "Scores and priorities appear before long explanations."],
                    ["Decide faster", "Each panel answers one clear question while you scroll."],
                    ["Improve directly", "Every insight points to a rewrite, metric, keyword, or proof point."]
                  ].map(([title, description]) => (
                    <Card key={title} className="rounded-[30px] bg-white/62 p-5 backdrop-blur-xl">
                      <CardTitle>{title}</CardTitle>
                      <CardDescription className="mt-3 leading-7">{description}</CardDescription>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            <section id="product-preview" data-reveal-section className="relative z-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
              <div className="mx-auto grid max-w-[92rem] gap-6 xl:grid-cols-[0.72fr_1.28fr] xl:items-center">
                <div data-reveal-item>
                  <Badge className="bg-white/64">Product preview</Badge>
                  <h2 className="mt-5 max-w-2xl font-[var(--font-heading)] text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-5xl">
                    A dashboard that makes feedback readable.
                  </h2>
                  <p className="mt-5 max-w-xl text-base leading-8 text-[var(--color-graphite-700)]">
                    The interface answers the quick question first: how strong is your signal? Then it shows exactly what to fix.
                  </p>
                </div>

                <div
                  data-reveal-item
                  data-parallax-depth="1.4"
                  className="relative rounded-[46px] border border-black/8 bg-white/50 p-3 shadow-[0_36px_130px_rgba(15,23,32,0.12)] backdrop-blur-2xl will-change-transform sm:p-5"
                >
                  <div className="rounded-[34px] border border-black/8 bg-[#fbf7ee] p-4 text-[var(--color-graphite-950)] sm:p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-graphite-700)]">
                          Career signal dashboard
                        </p>
                        <h3 className="mt-2 font-[var(--font-heading)] text-3xl font-semibold tracking-[-0.03em]">
                          Your next strongest application
                        </h3>
                      </div>
                      <Badge className="w-fit border-[rgba(18,183,166,0.24)] bg-[rgba(18,183,166,0.12)] text-[var(--color-graphite-950)]">
                        Completed
                      </Badge>
                    </div>

                    <div className="mt-7 grid gap-3 sm:grid-cols-4">
                      {dashboardScores.map(([label, value]) => (
                        <div key={label} className="rounded-[26px] border border-black/6 bg-white/74 p-4">
                          <p className="text-xs font-semibold text-[var(--color-graphite-700)]">{label}</p>
                          <p className="mt-3 font-[var(--font-heading)] text-4xl font-semibold">{value}</p>
                          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-300)]">
                            <div className="h-full rounded-full bg-[var(--color-teal-500)]" style={{ width: `${value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                      <div className="rounded-[30px] bg-[var(--color-graphite-950)] p-5 text-white">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-5 w-5 text-[var(--color-teal-300)]" />
                          <p className="font-semibold">Coach diagnosis</p>
                        </div>
                        <div className="mt-5 grid gap-3">
                          {reviewItems.map((item) => (
                            <div key={item} className="flex gap-3 rounded-[22px] border border-white/10 bg-white/[0.06] p-4">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-teal-300)]" />
                              <p className="text-sm leading-6 text-white/72">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4">
                        <SignalCard icon={Route} title="Action plan" items={["Add real project metrics", "Rewrite summary for target roles", "Connect GitHub proof to CV bullets"]} />
                        <div className="rounded-[30px] border border-black/6 bg-[rgba(18,183,166,0.12)] p-5">
                          <div className="flex items-center gap-3">
                            <GitPullRequestArrow className="h-5 w-5 text-[var(--color-teal-500)]" />
                            <p className="font-semibold">GitHub signal</p>
                          </div>
                          <p className="mt-3 text-sm leading-7 text-[var(--color-graphite-700)]">
                            Your pinned projects should prove the skills your CV claims.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="how-it-works" data-reveal-section className="relative z-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
              <div className="mx-auto grid max-w-[92rem] gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
                <div data-reveal-item className="lg:sticky lg:top-28">
                  <Badge className="bg-white/64">Workflow</Badge>
                  <h2 className="mt-5 max-w-2xl font-[var(--font-heading)] text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-5xl">
                    Upload, diagnose, match, improve.
                  </h2>
                  <p className="mt-5 max-w-xl text-base leading-8 text-[var(--color-graphite-700)]">
                    The same signal system expands from resume feedback into job matching and GitHub profile auditing, without making the interface heavier.
                  </p>
                </div>
                <div className="grid gap-3">
                  {workflow.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Card key={item.step} data-reveal-item className="group rounded-[32px] bg-white/64 p-5 transition-transform duration-300 hover:-translate-y-1">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[23px] bg-[var(--color-graphite-950)] text-white transition-colors group-hover:bg-[var(--color-teal-500)] group-hover:text-[var(--color-graphite-950)]">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-graphite-700)]">
                              {item.step}
                            </p>
                            <CardTitle className="mt-2 text-2xl">{item.title}</CardTitle>
                            <CardDescription className="mt-2 max-w-2xl leading-7">{item.description}</CardDescription>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </section>

            <section data-reveal-section className="relative z-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
              <div className="mx-auto grid max-w-[92rem] gap-4 lg:grid-cols-3">
                {trustSignals.map((signal) => {
                  const Icon = signal.icon;

                  return (
                    <Card key={signal.title} data-reveal-item className="rounded-[32px] bg-white/64">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[var(--color-graphite-950)] text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="mt-7 text-2xl">{signal.title}</CardTitle>
                      <CardDescription className="mt-3 leading-7">{signal.description}</CardDescription>
                    </Card>
                  );
                })}
              </div>
            </section>

            <section id="pricing" data-reveal-section className="relative z-10 px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-14 lg:px-10">
              <div className="relative mx-auto max-w-[92rem] overflow-hidden rounded-[48px] border border-white/10 bg-[var(--color-graphite-950)] p-6 text-white shadow-[0_44px_140px_rgba(15,23,32,0.2)] sm:p-10 lg:p-14">
                <div className="absolute right-[-8%] top-[-24%] h-[320px] w-[320px] rounded-full bg-[rgba(18,183,166,0.2)] blur-[66px]" />
                <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                  <div data-reveal-item>
                    <Badge className="border-white/10 bg-white/10 text-white">Start with the highest-signal surface</Badge>
                    <h2 className="mt-5 max-w-4xl font-[var(--font-heading)] text-4xl font-semibold leading-[0.96] tracking-[-0.055em] text-white sm:text-6xl">
                      Make your CV, job target, and GitHub profile tell one stronger story.
                    </h2>
                    <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">
                      Start with resume analysis now. The same cockpit direction expands into job matching and GitHub profile auditing without adding clutter.
                    </p>
                  </div>
                  <div data-reveal-item className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <Button asChild variant="teal" size="lg" className="group">
                      <Link to="/signup">
                        Start free analysis
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" size="lg" className="bg-white text-[var(--color-graphite-950)]">
                      <Link to="/login">Sign in</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </main>
          <PublicFooter />
        </div>
      </div>
    </div>
  );
}

function ContinuousCanvas() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(18,183,166,0.21),transparent_24%),radial-gradient(circle_at_84%_9%,rgba(255,196,108,0.2),transparent_20%),radial-gradient(circle_at_50%_72%,rgba(15,23,32,0.08),transparent_32%),linear-gradient(135deg,#fbf7ee_0%,#eff8f6_48%,#f7f3ea_100%)]" />
      <div
        data-canvas-glow="one"
        className="absolute left-[-10%] top-[5%] h-[340px] w-[340px] rounded-full bg-[rgba(18,183,166,0.16)] blur-[72px] will-change-transform"
      />
      <div
        data-canvas-glow="two"
        className="absolute right-[-12%] top-[20%] h-[410px] w-[410px] rounded-full bg-[rgba(15,23,32,0.08)] blur-[82px] will-change-transform"
      />
      <div
        data-canvas-glow="three"
        className="absolute bottom-[8%] left-[15%] h-[360px] w-[360px] rounded-full bg-[rgba(255,196,108,0.14)] blur-[76px]"
      />
      <div className="absolute inset-0 opacity-[0.27] [background-image:linear-gradient(rgba(15,23,32,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,32,0.07)_1px,transparent_1px)] [background-size:72px_72px]" />
    </div>
  );
}

type HeroLayerProps = {
  className: string;
  dark?: boolean;
  icon: IconType;
  label: string;
  lines: readonly string[];
  score: string;
  title: string;
};

function HeroLayer({ className, dark = false, icon: Icon, label, lines, score, title }: HeroLayerProps) {
  return (
    <div
      className={`absolute rounded-[32px] border p-4 shadow-[0_34px_110px_rgba(15,23,32,0.16)] backdrop-blur-2xl will-change-transform [transform-style:preserve-3d] sm:p-5 ${
        dark
          ? "border-white/10 bg-[var(--color-graphite-950)] text-white"
          : "border-white/70 bg-white/76 text-[var(--color-graphite-950)]"
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-[20px] ${
              dark ? "bg-white/10 text-[var(--color-teal-300)]" : "bg-[var(--color-graphite-950)] text-white"
            }`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.16em] ${dark ? "text-white/45" : "text-[var(--color-graphite-700)]"}`}>
              {label}
            </p>
            <p className="mt-1 font-[var(--font-heading)] text-2xl font-semibold tracking-[-0.03em]">{title}</p>
          </div>
        </div>
        <p
          className={`rounded-full px-3 py-1 font-[var(--font-heading)] text-xl font-semibold ${
            dark ? "bg-[var(--color-teal-400)] text-[var(--color-graphite-950)]" : "bg-[rgba(18,183,166,0.14)]"
          }`}
        >
          {score}
        </p>
      </div>
      <div className="mt-5 grid gap-2">
        {lines.map((line) => (
          <div
            key={line}
            className={`flex items-center gap-3 rounded-[18px] px-3 py-2 text-sm font-semibold ${
              dark ? "bg-white/[0.07] text-white/72" : "bg-[var(--color-surface-100)] text-[var(--color-graphite-800)]"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[var(--color-teal-500)]" />
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function SignalCard({ icon: Icon, items, title }: { icon: IconType; items: string[]; title: string }) {
  return (
    <div className="rounded-[30px] border border-black/6 bg-white/74 p-5">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-[var(--color-teal-500)]" />
        <p className="font-semibold">{title}</p>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <p key={item} className="rounded-[18px] bg-[var(--color-surface-200)] px-4 py-3 text-sm font-semibold">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
