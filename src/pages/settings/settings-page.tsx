import { CheckCircle2, Download, MoreHorizontal, Share2, ShieldCheck, Smartphone, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { useToast } from "@/hooks/use-toast";
import { isSupabaseConfigured } from "@/lib/env";

const installSteps = [
  "Open Settings on this device.",
  "Tap Install app when the browser makes it available.",
  "Launch CareerHub from your home screen for faster access."
];

const iosSteps = [
  "Open this page in Safari on your iPhone.",
  "Tap the Share button.",
  "Choose Add to Home Screen, then confirm Add."
];

export function SettingsPage() {
  const { installApp, isIos, state } = usePwaInstall();
  const { toast } = useToast();
  const canPromptInstall = state === "installable";
  const isInstalled = state === "installed";

  const handleInstall = async () => {
    const result = await installApp();

    if (result === "accepted") {
      toast({
        title: "Install started",
        description: "Smart Career Hub is being added to this device.",
        variant: "success"
      });
      return;
    }

    if (result === "dismissed") {
      toast({
        title: "Install dismissed",
        description: "You can install the app later from Settings.",
        variant: "default"
      });
      return;
    }

    toast({
      title: "Install prompt is not available yet",
      description: isIos
        ? "On iPhone, use Safari Share > Add to Home Screen."
        : "Use Chrome or Edge over HTTPS, then open the browser install menu.",
      variant: "default"
    });
  };

  const statusLabel = isInstalled
    ? "Installed"
    : canPromptInstall
      ? "Ready to install"
      : isIos
        ? "Manual install"
        : state === "unsupported"
          ? "Unsupported browser"
          : "Browser menu";

  const buttonLabel = isInstalled
    ? "Installed"
    : state === "installing"
      ? "Opening prompt"
      : canPromptInstall
        ? "Install app"
        : isIos
          ? "Use Safari share"
          : "Use browser menu";

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
        <Card className="relative overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,#0f1720_0%,#162532_64%,#0f766e_160%)] text-white lg:col-span-2">
          <div className="absolute right-[-12%] top-[-34%] h-64 w-64 rounded-full bg-[rgba(18,183,166,0.2)] blur-[70px]" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="min-w-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.08] text-[var(--color-teal-300)]">
                <Smartphone className="h-6 w-6" />
              </div>
              <CardTitle className="mt-6 text-3xl tracking-[-0.04em] text-white">Install Smart Career Hub</CardTitle>
              <CardDescription className="mt-3 max-w-2xl leading-7 text-white/68">
                Add the app to your phone or desktop for faster resume upload, dashboard access, and an offline-ready app shell.
              </CardDescription>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Badge className="border-white/10 bg-white/[0.08] text-white">{statusLabel}</Badge>
                <Badge className="border-white/10 bg-white/[0.08] text-white">PWA enabled</Badge>
              </div>
            </div>

            <Button
              type="button"
              variant={canPromptInstall ? "teal" : "secondary"}
              size="lg"
              className="w-full shrink-0 lg:w-auto"
              onClick={() => void handleInstall()}
              disabled={isInstalled || state === "installing"}
            >
              {isInstalled ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
              {buttonLabel}
            </Button>
          </div>

          <div className="relative mt-7 grid gap-3 sm:grid-cols-3">
            {(isIos ? iosSteps : installSteps).map((step, index) => (
              <div key={step} className="rounded-[22px] border border-white/10 bg-white/[0.06] p-4">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-[var(--color-graphite-950)]">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-white/72">{step}</p>
              </div>
            ))}
          </div>

          {!canPromptInstall && !isInstalled ? (
            <div className="relative mt-5 flex gap-3 rounded-[22px] border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-white/68">
              {isIos ? <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-teal-300)]" /> : <MoreHorizontal className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-teal-300)]" />}
              <p>
                {isIos
                  ? "iOS does not show a browser install popup. Safari installs PWAs through the Share menu."
                  : "If the button is not active, open Chrome or Edge over HTTPS and use the install icon in the address bar or browser menu."}
              </p>
            </div>
          ) : null}
        </Card>

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
