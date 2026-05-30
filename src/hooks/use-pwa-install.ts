import { useCallback, useMemo } from "react";

import { usePwaInstallStore } from "@/stores/pwa-install-store";

export type PwaInstallState = "unsupported" | "unavailable" | "installable" | "installing" | "installed";
export type PwaInstallResult = "accepted" | "dismissed" | "unavailable";

function isIosDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function usePwaInstall() {
  const clearInstallPrompt = usePwaInstallStore((state) => state.clearInstallPrompt);
  const installPrompt = usePwaInstallStore((state) => state.installPrompt);
  const isInstalled = usePwaInstallStore((state) => state.isInstalled);
  const isInstalling = usePwaInstallStore((state) => state.isInstalling);
  const setInstalling = usePwaInstallStore((state) => state.setInstalling);
  const isIos = useMemo(() => isIosDevice(), []);
  const isSupported = typeof window !== "undefined" && "serviceWorker" in window.navigator;

  const installApp = useCallback(async (): Promise<PwaInstallResult> => {
    if (!installPrompt) {
      return "unavailable";
    }

    setInstalling(true);

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      clearInstallPrompt();
      return choice.outcome;
    } finally {
      setInstalling(false);
    }
  }, [clearInstallPrompt, installPrompt, setInstalling]);

  const state: PwaInstallState = isInstalled
    ? "installed"
    : isInstalling
      ? "installing"
      : installPrompt
        ? "installable"
        : isSupported
          ? "unavailable"
          : "unsupported";

  return {
    installApp,
    isIos,
    state
  };
}
