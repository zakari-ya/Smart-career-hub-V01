import { useEffect } from "react";

import { type BeforeInstallPromptEvent, usePwaInstallStore } from "@/stores/pwa-install-store";

function isStandaloneDisplay() {
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };

  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

export function PwaInstallListener() {
  const clearInstallPrompt = usePwaInstallStore((state) => state.clearInstallPrompt);
  const setInstallPrompt = usePwaInstallStore((state) => state.setInstallPrompt);
  const setInstalled = usePwaInstallStore((state) => state.setInstalled);
  const setInstalling = usePwaInstallStore((state) => state.setInstalling);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const legacyMediaQuery = mediaQuery as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      clearInstallPrompt();
      setInstalling(false);
      setInstalled(true);
    };

    const handleDisplayModeChange = () => {
      setInstalled(isStandaloneDisplay());
    };

    setInstalled(isStandaloneDisplay());
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleDisplayModeChange);
    } else {
      legacyMediaQuery.addListener?.(handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);

      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleDisplayModeChange);
      } else {
        legacyMediaQuery.removeListener?.(handleDisplayModeChange);
      }
    };
  }, [clearInstallPrompt, setInstallPrompt, setInstalled, setInstalling]);

  return null;
}
