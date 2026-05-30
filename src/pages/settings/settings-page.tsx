import { ShieldCheck, Smartphone, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";

export function SettingsPage() {
  return (
    <div className="grid gap-6">
      <Card className="rounded-[34px] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(238,244,242,0.94))]">
        <CardDescription>Settings</CardDescription>
        <CardTitle className="mt-2">Platform readiness and experience preferences</CardTitle>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-graphite-700)]">
          The MVP keeps settings intentionally focused: security posture, mobile/PWA readiness, and environment visibility.
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[var(--color-surface-200)] text-[var(--color-graphite-900)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="mt-6">Security posture</CardTitle>
          <CardDescription className="mt-3 leading-7">
            {isSupabaseConfigured
              ? "Supabase env values are configured, so auth and data routes can connect to the backend."
              : "Supabase env values are missing, so private product routes stay locked until the backend is connected."}
          </CardDescription>
          <Badge className="mt-5 w-fit">{isSupabaseConfigured ? "Connected" : "Backend missing"}</Badge>
        </Card>

        <Card>
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[var(--color-surface-200)] text-[var(--color-graphite-900)]">
            <Smartphone className="h-6 w-6" />
          </div>
          <CardTitle className="mt-6">Mobile and PWA</CardTitle>
          <CardDescription className="mt-3 leading-7">
            The app shell, upload flow, and dashboard layout are designed mobile-first and prepared for installable deployment.
          </CardDescription>
          <Badge className="mt-5 w-fit">Installable-ready</Badge>
        </Card>

        <Card>
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[var(--color-surface-200)] text-[var(--color-graphite-900)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="mt-6">Experience design</CardTitle>
          <CardDescription className="mt-3 leading-7">
            Marketing surfaces use richer GSAP storytelling while private product screens stay calmer for legibility and speed.
          </CardDescription>
          <Badge className="mt-5 w-fit">GSAP-first motion</Badge>
        </Card>
      </div>
    </div>
  );
}
