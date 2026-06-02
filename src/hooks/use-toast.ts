import { sileo } from "sileo";

type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

export function useToast() {
  return {
    toast: ({ description, title, variant = "default" }: ToastInput) => {
      const payload = { title, description };

      if (variant === "success") {
        return sileo.success(payload);
      }

      if (variant === "destructive") {
        return sileo.error(payload);
      }

      if (variant === "warning") {
        return sileo.warning(payload);
      }

      return sileo.info(payload);
    }
  };
}
