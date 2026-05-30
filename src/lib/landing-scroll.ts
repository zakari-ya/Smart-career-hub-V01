export const LANDING_SCROLL_EVENT = "smart-career-hub:landing-scroll";

export type LandingScrollDetail = {
  sectionId: string;
};

export function requestLandingSectionScroll(sectionId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<LandingScrollDetail>(LANDING_SCROLL_EVENT, {
      detail: {
        sectionId
      }
    })
  );
}
