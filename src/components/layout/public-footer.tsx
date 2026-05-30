import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { requestLandingSectionScroll } from "@/lib/landing-scroll";

const footerLinks = [
  { label: "Pillars", href: "#features" },
  { label: "Workflow", href: "#how-it-works" },
  { label: "Preview", href: "#product-preview" },
  { label: "Start", href: "#pricing" }
] as const;

export function PublicFooter() {
  const handleSectionClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();

    const sectionId = href.replace("#", "");
    if (!sectionId) {
      return;
    }

    requestLandingSectionScroll(sectionId);
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[var(--color-graphite-950)] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="absolute right-[-10%] top-[-24%] h-64 w-64 rounded-full bg-[rgba(18,183,166,0.16)] blur-[64px]" />
      <div className="relative mx-auto grid max-w-[92rem] gap-8 rounded-[36px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl sm:p-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-teal-500)] text-[var(--color-graphite-950)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-[var(--font-heading)] text-xl font-semibold text-white">Smart Career Hub</p>
              <p className="text-sm text-white/52">Career intelligence for developers.</p>
            </div>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/64">
            Analyze your CV, understand role fit, and connect GitHub proof into one clear story recruiters can scan quickly.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { icon: LockKeyhole, label: "AI stays server-side" },
              { icon: ShieldCheck, label: "Private resume storage" }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-semibold text-white/72">
                  <Icon className="h-4 w-4 text-[var(--color-teal-300)]" />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="grid grid-cols-2 gap-3 text-sm sm:flex sm:flex-wrap sm:justify-end">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleSectionClick(event, link.href)}
                className="rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-center font-semibold text-white/68 transition-colors hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:justify-end">
            <Button asChild variant="teal" className="group">
              <Link to="/signup">
                Start free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="secondary" className="bg-white text-[var(--color-graphite-950)] hover:bg-white">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
          <p className="text-xs leading-6 text-white/42 sm:text-right">
            MVP focused on resume analysis, optimization, and career signal clarity.
          </p>
        </div>
      </div>
    </footer>
  );
}
