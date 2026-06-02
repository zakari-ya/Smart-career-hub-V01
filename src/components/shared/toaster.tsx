import { Toaster as SileoToaster } from "sileo";

export function Toaster() {
  return (
    <SileoToaster
      position="top-right"
      offset={{ top: 18, right: 18 }}
      theme="light"
      options={{
        duration: 3600,
        roundness: 22
      }}
    />
  );
}
