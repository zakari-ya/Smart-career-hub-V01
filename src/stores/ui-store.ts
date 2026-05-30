import { create } from "zustand";

type UIState = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (value: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen })
}));
