import { create } from "zustand";

export type BeforeInstallPromptChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

export type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  readonly userChoice: Promise<BeforeInstallPromptChoice>;
  prompt: () => Promise<void>;
};

type PwaInstallState = {
  installPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  isInstalling: boolean;
  clearInstallPrompt: () => void;
  setInstallPrompt: (event: BeforeInstallPromptEvent | null) => void;
  setInstalled: (value: boolean) => void;
  setInstalling: (value: boolean) => void;
};

export const usePwaInstallStore = create<PwaInstallState>((set) => ({
  installPrompt: null,
  isInstalled: false,
  isInstalling: false,
  clearInstallPrompt: () => set({ installPrompt: null }),
  setInstallPrompt: (installPrompt) => set({ installPrompt }),
  setInstalled: (isInstalled) => set({ isInstalled }),
  setInstalling: (isInstalling) => set({ isInstalling })
}));
