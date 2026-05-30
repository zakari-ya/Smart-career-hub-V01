import { useToastStore } from "@/stores/toast-store";

export function useToast() {
  const addToast = useToastStore((state) => state.addToast);

  return {
    toast: addToast
  };
}
