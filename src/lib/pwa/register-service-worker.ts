import { registerSW } from "virtual:pwa-register";

export const updateServiceWorker = registerSW({
  immediate: true,
  onRegisterError(error) {
    console.error("Service worker registration failed", error);
  }
});
